import { Controller, Post, UseGuards } from '@nestjs/common';
import { QueueService } from '@/modules/queue/queue.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('api/queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @UseGuards(JwtAuthGuard)
  @Post('trigger-batch')
  async triggerBatch() {
    return this.queueService.triggerManualBatchCycle();
  }
}
