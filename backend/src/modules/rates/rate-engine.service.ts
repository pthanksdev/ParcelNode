import { Injectable } from '@nestjs/common';
import { FastShipAdapter } from '@/modules/carriers/fastship.adapter';
import { EcoDeliverAdapter } from '@/modules/carriers/ecodeliver.adapter';
import { RateQuoteRequest, RateQuoteResponse } from '@/modules/carriers/carrier-adapter.interface';

@Injectable()
export class RateEngineService {
  constructor(
    private fastShip: FastShipAdapter,
    private ecoDeliver: EcoDeliverAdapter,
  ) {}

  async compareRates(request: RateQuoteRequest): Promise<RateQuoteResponse[]> {
    // Fetch quotes in parallel across all registered carrier adapters
    const quotes = await Promise.all([
      this.fastShip.getRateQuote(request),
      this.ecoDeliver.getRateQuote(request),
    ]);

    // Sort quotes by cheapest rate first
    return quotes.sort((a, b) => a.rateUsd - b.rateUsd);
  }
}
