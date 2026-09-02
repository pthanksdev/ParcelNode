import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { WebhooksService, WebhookEventPayload } from '@/modules/webhooks/webhooks.service';
import { FastShipAdapter } from '@/modules/carriers/fastship.adapter';
import { EcoDeliverAdapter } from '@/modules/carriers/ecodeliver.adapter';

@Controller('api/webhooks')
export class WebhooksController {
  constructor(
    private webhooksService: WebhooksService,
    private fastShip: FastShipAdapter,
    private ecoDeliver: EcoDeliverAdapter,
  ) {}

  @Post('carrier')
  async handleCarrierWebhook(
    @Headers('x-carrier-signature') signature: string,
    @Body() payload: WebhookEventPayload,
  ) {
    const adapter = payload.carrierCode === 'FASTSHIP' ? this.fastShip : this.ecoDeliver;
    
    if (signature && !adapter.validateWebhookSignature(signature, payload)) {
      throw new UnauthorizedException('Invalid carrier webhook signature');
    }

    return this.webhooksService.processWebhook(payload);
  }
}
