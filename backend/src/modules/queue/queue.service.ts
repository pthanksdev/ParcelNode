import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BatchAccumulatorProcessor } from '@/modules/queue/batch-accumulator.processor';
import { ChainSubmitProcessor } from '@/modules/queue/chain-submit.processor';
import { queueDepthGauge } from '@/core/observability/metrics';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private accumulatorProcessor: BatchAccumulatorProcessor,
    private chainSubmitProcessor: ChainSubmitProcessor,
  ) {}

  /**
   * Cron scheduled accumulator execution running every 30 seconds
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleScheduledAccumulation() {
    try {
      const result = await this.accumulatorProcessor.processAccumulator();
      if (result) {
        queueDepthGauge.set({ queue_name: 'batch_submissions' }, 1);
        await this.chainSubmitProcessor.processBatchSubmission(result.batchId);
        queueDepthGauge.set({ queue_name: 'batch_submissions' }, 0);
      }
    } catch (err) {
      this.logger.error('Error during scheduled batch accumulation cycle:', err);
    }
  }

  /**
   * On-demand manual trigger method for API calls & demo triggers
   */
  async triggerManualBatchCycle() {
    const result = await this.accumulatorProcessor.processAccumulator();
    if (result) {
      await this.chainSubmitProcessor.processBatchSubmission(result.batchId);
      return result;
    }
    return { message: 'No pending events to batch' };
  }
}
