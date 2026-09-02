import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

export interface MerkleProofResult {
  root: string;
  leaf: string;
  proof: string[];
}

@Injectable()
export class MerkleTreeService {
  /**
   * Computes deterministic Keccak-256 leaf hash for a tracking event
   */
  computeLeafHash(event: {
    shipmentId: string;
    trackingId: string;
    status: string;
    timestamp: Date | string;
    dedupeKey: string;
  }): string {
    const timestampIso = new Date(event.timestamp).toISOString();
    return ethers.solidityPackedKeccak256(
      ['string', 'string', 'string', 'string', 'string'],
      [event.shipmentId, event.trackingId, event.status, timestampIso, event.dedupeKey]
    );
  }

  /**
   * Builds a balanced Merkle Tree from an array of leaf hashes and returns the root & proofs
   */
  buildTree(leafHashes: string[]): { root: string; proofs: Map<string, string[]> } {
    if (leafHashes.length === 0) {
      throw new Error('Cannot build Merkle Tree from empty leaf array');
    }

    // Sort leaves to guarantee deterministic structure across platforms
    const sortedLeaves = [...leafHashes].sort();
    let currentLevel = [...sortedLeaves];
    const levels: string[][] = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          nextLevel.push(this.hashPair(currentLevel[i], currentLevel[i + 1]));
        } else {
          // Odd leaf duplication for balanced tree
          nextLevel.push(currentLevel[i]);
        }
      }

      currentLevel = nextLevel;
      levels.push(currentLevel);
    }

    const root = currentLevel[0];
    const proofs = new Map<string, string[]>();

    // Generate individual proof path for each leaf
    for (const leaf of sortedLeaves) {
      const proof: string[] = [];
      let index = sortedLeaves.indexOf(leaf);

      for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex++) {
        const level = levels[levelIndex];
        const isRightNode = index % 2 === 1;
        const pairIndex = isRightNode ? index - 1 : index + 1;

        if (pairIndex < level.length) {
          proof.push(level[pairIndex]);
        }

        index = Math.floor(index / 2);
      }

      proofs.set(leaf, proof);
    }

    return { root, proofs };
  }

  /**
   * Pairwise Keccak-256 hash helper function matching Solidity smart contract logic
   */
  private hashPair(a: string, b: string): string {
    const bufA = ethers.getBytes(a);
    const bufB = ethers.getBytes(b);

    if (a.toLowerCase() <= b.toLowerCase()) {
      return ethers.keccak256(ethers.concat([bufA, bufB]));
    } else {
      return ethers.keccak256(ethers.concat([bufB, bufA]));
    }
  }
}
