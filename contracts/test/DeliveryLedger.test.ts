import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { DeliveryLedgerV1 } from "../typechain-types";

describe("DeliveryLedgerV1 Contract Tests", function () {
  let ledger: DeliveryLedgerV1;
  let owner: any;
  let unauthorizedUser: any;

  beforeEach(async function () {
    [owner, unauthorizedUser] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("DeliveryLedgerV1");
    ledger = (await upgrades.deployProxy(Factory, [owner.address], {
      kind: "uups",
      initializer: "initialize",
    })) as unknown as DeliveryLedgerV1;

    await ledger.waitForDeployment();
  });

  it("should initialize with correct owner", async function () {
    expect(await ledger.owner()).to.equal(owner.address);
  });

  it("should allow owner to submit a batch root", async function () {
    const fakeRoot = ethers.keccak256(ethers.toUtf8Bytes("batch-1-merkle-root"));
    const eventCount = 10;

    await expect(ledger.submitBatch(fakeRoot, eventCount))
      .to.emit(ledger, "BatchSubmitted")
      .withArgs(fakeRoot, (timestamp: any) => timestamp > 0, eventCount);

    expect(await ledger.submittedRoots(fakeRoot)).to.be.true;
  });

  it("should reject duplicate batch root submissions", async function () {
    const fakeRoot = ethers.keccak256(ethers.toUtf8Bytes("batch-duplicate-root"));
    await ledger.submitBatch(fakeRoot, 5);

    await expect(ledger.submitBatch(fakeRoot, 5)).to.be.revertedWith("Root already submitted");
  });

  it("should prevent non-owner from submitting batch roots", async function () {
    const fakeRoot = ethers.keccak256(ethers.toUtf8Bytes("unauthorized-batch"));
    
    await expect(
      ledger.connect(unauthorizedUser).submitBatch(fakeRoot, 5)
    ).to.be.revertedWithCustomError(ledger, "OwnableUnauthorizedAccount");
  });
});
