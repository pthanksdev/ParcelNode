import { Module } from '@nestjs/common';
import { QueueService } from '@/modules/queue/queue.service';
import { QueueController } from '@/modules/queue/queue.controller';
import { BatchAccumulatorProcessor } from '@/modules/queue/batch-accumulator.processor';
import { ChainSubmitProcessor } from '@/modules/queue/chain-submit.processor';
import { Web3Module } from '@/modules/web3/web3.module';

@Module({
  imports: [Web3Module],
  controllers: [QueueController],
  providers: [
    QueueService,
    BatchAccumulatorProcessor,
    ChainSubmitProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
