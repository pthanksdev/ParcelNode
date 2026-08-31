import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ContractService } from '@/modules/web3/contract.service';
import { AttestationService } from '@/modules/web3/attestation.service';
import { chainConfirmationLatencyHistogram } from '@/core/observability/metrics';

@Injectable()
export class ChainSubmitProcessor {
  private readonly logger = new Logger(ChainSubmitProcessor.name);

  constructor(
    private prisma: PrismaService,
    private contractService: ContractService,
    private attestationService: AttestationService,
  ) {}

  /**
   * Worker task to verify multi-signer attestations and submit batch roots on-chain
   */
  async processBatchSubmission(batchId: string): Promise<boolean> {
    const startTime = Date.now();
    this.logger.log(`Processing chain submission for batch ID: ${batchId}`);

    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: { events: true },
    });

    if (!batch) {
      this.logger.error(`Batch ID not found: ${batchId}`);
      return false;
    }

    if (batch.status === 'CONFIRMED') {
      this.logger.log(`Batch ${batchId} is already confirmed on-chain.`);
      return true;
    }

    // 1. Verify 2-of-2 attestation signatures before submitting
    const isValidAttestation = this.attestationService.verifyAttestations(
      batch.merkleRoot,
      batch.events.length,
      batch.attestation1 || '',
      batch.attestation2 || ''
    );

    if (!isValidAttestation) {
      this.logger.error(`Batch ${batchId} failed multi-signer attestation verification! Rejecting submission.`);
      await this.prisma.batch.update({
        where: { id: batchId },
        data: { status: 'FAILED' },
      });
      return false;
    }

    // 2. Submit root on-chain to DeliveryLedger contract
    const submissionTime = new Date();
    const result = await this.contractService.submitBatchRoot(batch.merkleRoot, batch.events.length);

    // 3. Mark batch as SUBMITTED & CONFIRMED
    const confirmedTime = new Date();
    await this.prisma.batch.update({
      where: { id: batchId },
      data: {
        txHash: result.txHash,
        submittedAt: submissionTime,
        confirmedAt: confirmedTime,
        status: 'CONFIRMED',
      },
    });

    // 4. Update tracking events to CONFIRMED chain status
    await this.prisma.trackingEvent.updateMany({
      where: { batchId: batch.id },
      data: { chainStatus: 'CONFIRMED' },
    });

    const durationSec = (Date.now() - startTime) / 1000;
    chainConfirmationLatencyHistogram.observe(durationSec);

    this.logger.log(`Successfully published batch ${batchId} on-chain! Tx: ${result.txHash} (${durationSec}s)`);
    return true;
  }
}
