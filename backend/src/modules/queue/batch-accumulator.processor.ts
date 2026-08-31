import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { MerkleTreeService } from '@/modules/web3/merkle-tree.service';
import { AttestationService } from '@/modules/web3/attestation.service';
import { batchAccumulatorSizeHistogram } from '@/core/observability/metrics';

@Injectable()
export class BatchAccumulatorProcessor {
  private readonly logger = new Logger(BatchAccumulatorProcessor.name);

  constructor(
    private prisma: PrismaService,
    private merkleTreeService: MerkleTreeService,
    private attestationService: AttestationService,
  ) {}

  /**
   * Scheduled cron / worker task to aggregate uncommitted DELIVERED tracking events into a Merkle batch
   */
  async processAccumulator(): Promise<{ batchId: string; merkleRoot: string; count: number } | null> {
    this.logger.log('Scanning for uncommitted DELIVERED tracking events...');

    // 1. Fetch pending tracking events
    const pendingEvents = await this.prisma.trackingEvent.findMany({
      where: {
        status: 'DELIVERED',
        chainStatus: 'PENDING',
        batchId: null,
      },
      include: {
        shipment: true,
      },
      take: 100, // Process in batches up to 100
    });

    if (pendingEvents.length === 0) {
      this.logger.log('No pending DELIVERED events found for accumulation.');
      return null;
    }

    this.logger.log(`Accumulating ${pendingEvents.length} tracking events into Merkle tree...`);

    // 2. Compute leaf hashes for each event
    const leafHashes: string[] = [];
    const eventLeafMap = new Map<string, string>();

    for (const event of pendingEvents) {
      const leafHash = this.merkleTreeService.computeLeafHash({
        shipmentId: event.shipmentId,
        trackingId: event.shipment.trackingId,
        status: event.status,
        timestamp: event.timestamp,
        dedupeKey: event.dedupeKey,
      });

      leafHashes.push(leafHash);
      eventLeafMap.set(event.id, leafHash);
    }

    // 3. Construct Merkle tree & proofs
    const { root: merkleRoot, proofs } = this.merkleTreeService.buildTree(leafHashes);

    // 4. Generate multi-signer ECDSA attestations
    const attestations = await this.attestationService.generateBatchAttestations(merkleRoot, pendingEvents.length);

    // 5. Create Batch record in database
    const batch = await this.prisma.batch.create({
      data: {
        merkleRoot,
        attestation1: attestations.attestation1,
        attestation2: attestations.attestation2,
        status: 'ACCUMULATING',
      },
    });

    // 6. Update pending events with leaf hashes, proof reference, and batch assignment
    for (const event of pendingEvents) {
      const leafHash = eventLeafMap.get(event.id)!;
      await this.prisma.trackingEvent.update({
        where: { id: event.id },
        data: {
          batchId: batch.id,
          leafHash: leafHash,
          chainStatus: 'BATCHED',
        },
      });
    }

    batchAccumulatorSizeHistogram.observe(pendingEvents.length);
    this.logger.log(`Successfully created batch ${batch.id} with root ${merkleRoot}`);

    return {
      batchId: batch.id,
      merkleRoot,
      count: pendingEvents.length,
    };
  }
}
