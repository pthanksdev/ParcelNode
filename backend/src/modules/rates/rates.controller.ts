import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RateEngineService } from '@/modules/rates/rate-engine.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RateQuoteRequest } from '@/modules/carriers/carrier-adapter.interface';

@Controller('api/rates')
export class RatesController {
  constructor(private rateEngine: RateEngineService) {}

  @UseGuards(JwtAuthGuard)
  @Post('quote')
  async getQuotes(@Body() body: RateQuoteRequest) {
    return this.rateEngine.compareRates(body);
  }
}
