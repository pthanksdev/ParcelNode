import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@/core/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RatesModule } from '@/modules/rates/rates.module';
import { CarriersModule } from '@/modules/carriers/carriers.module';
import { ShipmentsModule } from '@/modules/shipments/shipments.module';
import { WebhooksModule } from '@/modules/webhooks/webhooks.module';
import { Web3Module } from '@/modules/web3/web3.module';
import { QueueModule } from '@/modules/queue/queue.module';
import { AdminModule } from '@/modules/admin/admin.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CarriersModule,
    RatesModule,
    ShipmentsModule,
    WebhooksModule,
    Web3Module,
    QueueModule,
    AdminModule,
  ],
})
export class AppModule {}
