import { Injectable } from '@nestjs/common';
import {
  CarrierAdapter,
  RateQuoteRequest,
  RateQuoteResponse,
  CreateShipmentRequest,
  CreateShipmentResponse,
} from '@/modules/carriers/carrier-adapter.interface';

@Injectable()
export class FastShipAdapter implements CarrierAdapter {
  readonly carrierCode = 'FASTSHIP';
  readonly carrierName = 'FastShip Express';

  async getRateQuote(request: RateQuoteRequest): Promise<RateQuoteResponse> {
    // Dynamic mock pricing algorithm
    const baseRate = 12.5;
    const weightFee = request.weightKg * 2.8;
    const total = parseFloat((baseRate + weightFee).toFixed(2));

    return {
      carrierCode: this.carrierCode,
      carrierName: this.carrierName,
      serviceName: 'FastShip Priority Ground',
      rateUsd: total,
      estimatedDeliveryDays: 2,
    };
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `FS-${randomNum}`;

    return {
      trackingId,
      labelUrl: `https://labels.fastship.mock/print/${trackingId}.pdf`,
      carrierCode: this.carrierCode,
      initialStatus: 'PICKED_UP',
    };
  }

  validateWebhookSignature(signature: string, payload: any): boolean {
    // Simulated carrier signature verification logic
    return signature !== undefined && signature.length > 0;
  }
}
