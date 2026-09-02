import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { DeliveryLedgerV1 } from "../typechain-types";

// Helper function to pair hashes deterministically
function hashPair(a: string, b: string): string {
  const bufA = ethers.getBytes(a);
  const bufB = ethers.getBytes(b);

  if (a.toLowerCase() <= b.toLowerCase()) {
    return ethers.keccak256(ethers.concat([bufA, bufB]));
  } else {
    return ethers.keccak256(ethers.concat([bufB, bufA]));
  }
}

describe("DeliveryLedgerV1 Merkle Proof Verification", function () {
  let ledger: DeliveryLedgerV1;
  let owner: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("DeliveryLedgerV1");
    ledger = (await upgrades.deployProxy(Factory, [owner.address], {
      kind: "uups",
      initializer: "initialize",
    })) as unknown as DeliveryLedgerV1;

    await ledger.waitForDeployment();
  });

  it("should verify a valid 2-leaf Merkle proof on-chain", async function () {
    // Generate two leaf hashes
    const leafA = ethers.keccak256(ethers.toUtf8Bytes("event-shipment-001-delivered"));
    const leafB = ethers.keccak256(ethers.toUtf8Bytes("event-shipment-002-delivered"));

    // Calculate Merkle root
    const root = hashPair(leafA, leafB);

    // Submit root on-chain
    await ledger.submitBatch(root, 2);

    // Proof for Leaf A is sibling Leaf B
    const isValidA = await ledger.verifyLeaf(root, leafA, [leafB]);
    expect(isValidA).to.be.true;

    // Proof for Leaf B is sibling Leaf A
    const isValidB = await ledger.verifyLeaf(root, leafB, [leafA]);
    expect(isValidB).to.be.true;
  });

  it("should reject an invalid leaf or tampered proof", async function () {
    const leafA = ethers.keccak256(ethers.toUtf8Bytes("valid-event"));
    const leafB = ethers.keccak256(ethers.toUtf8Bytes("sibling-event"));
    const root = hashPair(leafA, leafB);

    await ledger.submitBatch(root, 2);

    const fakeLeaf = ethers.keccak256(ethers.toUtf8Bytes("tampered-event"));
    const isValid = await ledger.verifyLeaf(root, fakeLeaf, [leafB]);
    expect(isValid).to.be.false;
  });
});
