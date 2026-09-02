import { MerkleTreeService } from '@/modules/web3/merkle-tree.service';

describe('MerkleTreeService', () => {
  let service: MerkleTreeService;

  beforeEach(() => {
    service = new MerkleTreeService();
  });

  it('should compute deterministic Keccak-256 leaf hash', () => {
    const leaf = service.computeLeafHash({
      shipmentId: 'shipment-123',
      trackingId: 'FS-984210',
      status: 'DELIVERED',
      timestamp: new Date('2026-08-23T12:00:00Z'),
      dedupeKey: 'dedupe-key-1',
    });

    expect(leaf).toBeDefined();
    expect(leaf).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it('should build a valid Merkle tree root and proofs for array of leaves', () => {
    const leaf1 = service.computeLeafHash({
      shipmentId: 'shipment-1',
      trackingId: 'FS-100',
      status: 'PICKED_UP',
      timestamp: new Date('2026-08-23T10:00:00Z'),
      dedupeKey: 'key-1',
    });

    const leaf2 = service.computeLeafHash({
      shipmentId: 'shipment-2',
      trackingId: 'FS-101',
      status: 'IN_TRANSIT',
      timestamp: new Date('2026-08-23T11:00:00Z'),
      dedupeKey: 'key-2',
    });

    const { root, proofs } = service.buildTree([leaf1, leaf2]);

    expect(root).toBeDefined();
    expect(root).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(proofs.has(leaf1)).toBe(true);
    expect(proofs.has(leaf2)).toBe(true);
  });
});
