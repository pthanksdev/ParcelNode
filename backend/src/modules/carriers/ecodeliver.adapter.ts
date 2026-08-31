import { Injectable } from '@nestjs/common';
import {
  CarrierAdapter,
  RateQuoteRequest,
  RateQuoteResponse,
  CreateShipmentRequest,
  CreateShipmentResponse,
} from '@/modules/carriers/carrier-adapter.interface';

@Injectable()
export class EcoDeliverAdapter implements CarrierAdapter {
  readonly carrierCode = 'ECODELIVER';
  readonly carrierName = 'EcoDeliver Logistics';

  async getRateQuote(request: RateQuoteRequest): Promise<RateQuoteResponse> {
    const baseRate = 8.0;
    const weightFee = request.weightKg * 1.9;
    const total = parseFloat((baseRate + weightFee).toFixed(2));

    return {
      carrierCode: this.carrierCode,
      carrierName: this.carrierName,
      serviceName: 'EcoDeliver Green Economy',
      rateUsd: total,
      estimatedDeliveryDays: 4,
    };
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `ECO-${randomNum}`;

    return {
      trackingId,
      labelUrl: `https://labels.ecodeliver.mock/print/${trackingId}.pdf`,
      carrierCode: this.carrierCode,
      initialStatus: 'PICKED_UP',
    };
  }

  validateWebhookSignature(signature: string, payload: any): boolean {
    return signature !== undefined && signature.length > 0;
  }
}
