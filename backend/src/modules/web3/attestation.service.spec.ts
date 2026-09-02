import { AttestationService } from '@/modules/web3/attestation.service';

describe('AttestationService', () => {
  let service: AttestationService;

  beforeEach(() => {
    service = new AttestationService();
  });

  it('should generate and verify batch attestations', async () => {
    const merkleRoot = '0x4f8e91a0b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6';
    const eventCount = 10;

    const { attestation1, attestation2 } = await service.generateBatchAttestations(
      merkleRoot,
      eventCount
    );

    expect(attestation1).toBeDefined();
    expect(attestation2).toBeDefined();

    const isValid = service.verifyAttestations(
      merkleRoot,
      eventCount,
      attestation1,
      attestation2
    );

    expect(isValid).toBe(true);
  });
});
