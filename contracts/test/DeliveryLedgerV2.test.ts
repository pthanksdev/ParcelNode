import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("DeliveryLedgerV2 Proxy Upgrade", function () {
  it("should deploy V1, upgrade to V2, preserve state, and support pause/revocation", async function () {
    const [owner] = await ethers.getSigners();

    // 1. Deploy V1 Proxy
    const DeliveryLedgerV1 = await ethers.getContractFactory("DeliveryLedgerV1");
    const proxyV1 = await upgrades.deployProxy(DeliveryLedgerV1, [owner.address], {
      initializer: "initialize",
      kind: "uups",
    });
    await proxyV1.waitForDeployment();
    const proxyAddress = await proxyV1.getAddress();

    // Submit root in V1
    const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("batch-v1-root"));
    await proxyV1.submitBatch(merkleRoot, 5);

    expect(await proxyV1.submittedRoots(merkleRoot)).to.be.true;

    // 2. Upgrade Proxy to V2
    const DeliveryLedgerV2 = await ethers.getContractFactory("DeliveryLedgerV2");
    const proxyV2 = await upgrades.upgradeProxy(proxyAddress, DeliveryLedgerV2);

    expect(await proxyV2.version()).to.equal("2.0.0");
    // Verify state preservation
    expect(await proxyV2.submittedRoots(merkleRoot)).to.be.true;

    // 3. Test V2 Batch Revocation
    await proxyV2.revokeBatch(merkleRoot, "Data audit error");
    expect(await proxyV2.revokedRoots(merkleRoot)).to.be.true;

    // 4. Test Emergency Pause Circuit Breaker
    await proxyV2.pause();
    const newRoot = ethers.keccak256(ethers.toUtf8Bytes("batch-v2-root"));
    await expect(proxyV2.submitBatch(newRoot, 3)).to.be.reverted;
  });
});
