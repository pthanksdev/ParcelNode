import { Module } from '@nestjs/common';
import { ShipmentsController } from '@/modules/shipments/shipments.controller';
import { ShipmentsService } from '@/modules/shipments/shipments.service';
import { CarriersModule } from '@/modules/carriers/carriers.module';
import { Web3Module } from '@/modules/web3/web3.module';

@Module({
  imports: [CarriersModule, Web3Module],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
