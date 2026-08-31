import { Module } from '@nestjs/common';
import { RatesController } from '@/modules/rates/rates.controller';
import { RateEngineService } from '@/modules/rates/rate-engine.service';
import { CarriersModule } from '@/modules/carriers/carriers.module';

@Module({
  imports: [CarriersModule],
  controllers: [RatesController],
  providers: [RateEngineService],
  exports: [RateEngineService],
})
export class RatesModule {}
