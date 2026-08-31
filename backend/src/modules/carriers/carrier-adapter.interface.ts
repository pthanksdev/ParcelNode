export interface RateQuoteRequest {
  weightKg: number;
  originPostal: string;
  destinationPostal: string;
}

export interface RateQuoteResponse {
  carrierCode: string;
  carrierName: string;
  serviceName: string;
  rateUsd: number;
  estimatedDeliveryDays: number;
}

export interface CreateShipmentRequest {
  orderId: string;
  item: string;
  weightKg: number;
  destination: string;
  serviceName: string;
}

export interface CreateShipmentResponse {
  trackingId: string;
  labelUrl: string;
  carrierCode: string;
  initialStatus: string;
}

export interface CarrierAdapter {
  readonly carrierCode: string;
  readonly carrierName: string;

  getRateQuote(request: RateQuoteRequest): Promise<RateQuoteResponse>;
  createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse>;
  validateWebhookSignature(signature: string, payload: any): boolean;
}
