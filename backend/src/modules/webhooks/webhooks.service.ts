import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { webhookDedupeCounter } from '@/core/observability/metrics';

export interface WebhookEventPayload {
  trackingId: string;
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  location: string;
  timestamp: string;
  dedupeKey: string;
  carrierCode: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async processWebhook(payload: WebhookEventPayload): Promise<{ success: boolean; deduplicated?: boolean }> {
    // 1. Check for duplicate webhook ingestion using dedupeKey constraint
    const existing = await this.prisma.trackingEvent.findUnique({
      where: { dedupeKey: payload.dedupeKey },
    });

    if (existing) {
      this.logger.warn(`Duplicate webhook payload received: ${payload.dedupeKey}`);
      webhookDedupeCounter.inc({ carrier: payload.carrierCode });
      return { success: true, deduplicated: true };
    }

    // 2. Locate associated shipment record
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingId: payload.trackingId },
    });

    if (!shipment) {
      this.logger.error(`Webhook target tracking ID not found: ${payload.trackingId}`);
      return { success: false };
    }

    // 3. Create tracking event in database
    const trackingEvent = await this.prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: payload.status,
        location: payload.location,
        timestamp: new Date(payload.timestamp),
        dedupeKey: payload.dedupeKey,
        chainStatus: payload.status === 'DELIVERED' ? 'PENDING' : 'NONE',
      },
    });

    // 4. Update overall shipment status
    await this.prisma.shipment.update({
      where: { id: shipment.id },
      data: { status: payload.status },
    });

    this.logger.log(`Ingested tracking event ${trackingEvent.id} for shipment ${shipment.trackingId} [${payload.status}]`);
    return { success: true, deduplicated: false };
  }
}
