import { Module } from '@nestjs/common';
import { AdminController } from '@/modules/admin/admin.controller';
import { PrismaModule } from '@/core/database/prisma.module';
import { Web3Module } from '@/modules/web3/web3.module';

@Module({
  imports: [PrismaModule, Web3Module],
  controllers: [AdminController],
})
export class AdminModule {}
