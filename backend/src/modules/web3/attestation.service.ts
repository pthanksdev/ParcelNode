import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class AttestationService {
  private readonly logger = new Logger(AttestationService.name);

  private readonly systemSignerWallet: ethers.Wallet;

  constructor() {
    if (process.env.NODE_ENV === 'production' && !process.env.SYSTEM_SIGNER_PRIVATE_KEY) {
      throw new Error('SYSTEM_SIGNER_PRIVATE_KEY environment variable is required in production');
    }

    const key = process.env.SYSTEM_SIGNER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    this.systemSignerWallet = new ethers.Wallet(key);

    this.logger.log(`Initialized System Committer Signer: ${this.systemSignerWallet.address}`);
  }

  /**
   * Generates ECDSA signature attestation over a batch Merkle root digest using system committer key
   */
  async generateBatchAttestations(merkleRoot: string, eventCount: number): Promise<{
    attestation1: string;
    attestation2: string;
  }> {
    const messageHash = ethers.solidityPackedKeccak256(
      ['bytes32', 'uint256'],
      [merkleRoot, eventCount]
    );

    const binaryHash = ethers.getBytes(messageHash);

    const attestation1 = await this.systemSignerWallet.signMessage(binaryHash);
    const attestation2 = attestation1; // Single system committer signature

    return { attestation1, attestation2 };
  }

  /**
   * Validates system committer ECDSA attestation for a given Merkle root
   */
  verifyAttestations(
    merkleRoot: string,
    eventCount: number,
    attestation1: string,
    attestation2: string
  ): boolean {
    try {
      const messageHash = ethers.solidityPackedKeccak256(
        ['bytes32', 'uint256'],
        [merkleRoot, eventCount]
      );
      const binaryHash = ethers.getBytes(messageHash);

      const recoveredAddr = ethers.verifyMessage(binaryHash, attestation1);
      return recoveredAddr.toLowerCase() === this.systemSignerWallet.address.toLowerCase();
    } catch (err) {
      this.logger.error('Failed to verify batch attestations:', err);
      return false;
    }
  }

  getSystemSignerAddress(): string {
    return this.systemSignerWallet.address;
  }
}
