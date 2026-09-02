import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Controller('api/web3')
export class Web3Controller {
  constructor(private prisma: PrismaService) {}

  @Get('batches')
  async getBatches() {
    const batches = await this.prisma.batch.findMany({
      include: {
        events: {
          select: {
            id: true,
            status: true,
            location: true,
            timestamp: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return batches.map((b) => ({
      id: b.id,
      merkleRoot: b.merkleRoot,
      txHash: b.txHash,
      eventCount: b.events.length,
      status: b.status,
      attestation1: b.attestation1,
      attestation2: b.attestation2,
      createdAt: b.createdAt,
      trackingEvents: b.events,
    }));
  }
}
