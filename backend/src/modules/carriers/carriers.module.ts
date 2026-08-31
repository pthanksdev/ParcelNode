import { Module } from '@nestjs/common';
import { FastShipAdapter } from '@/modules/carriers/fastship.adapter';
import { EcoDeliverAdapter } from '@/modules/carriers/ecodeliver.adapter';

@Module({
  providers: [FastShipAdapter, EcoDeliverAdapter],
  exports: [FastShipAdapter, EcoDeliverAdapter],
})
export class CarriersModule {}
