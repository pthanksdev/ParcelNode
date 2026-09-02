import { Module } from '@nestjs/common';
import { MerkleTreeService } from '@/modules/web3/merkle-tree.service';
import { AttestationService } from '@/modules/web3/attestation.service';
import { ContractService } from '@/modules/web3/contract.service';
import { Web3Controller } from '@/modules/web3/web3.controller';
import { PrismaModule } from '@/core/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [Web3Controller],
  providers: [MerkleTreeService, AttestationService, ContractService],
  exports: [MerkleTreeService, AttestationService, ContractService],
})
export class Web3Module {}
