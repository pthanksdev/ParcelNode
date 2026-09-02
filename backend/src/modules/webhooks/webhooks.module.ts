import { Module } from '@nestjs/common';
import { WebhooksController } from '@/modules/webhooks/webhooks.controller';
import { WebhooksService } from '@/modules/webhooks/webhooks.service';
import { CarriersModule } from '@/modules/carriers/carriers.module';

@Module({
  imports: [CarriersModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
