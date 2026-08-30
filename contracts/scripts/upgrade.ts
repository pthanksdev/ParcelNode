import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function main() {
  const proxyAddress = process.env.CONTRACT_ADDRESS;
  if (!proxyAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable must be specified for contract upgrade");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Upgrading DeliveryLedger proxy at:", proxyAddress, "with account:", deployer.address);

  // Upgrade implementation to V2 using contract factory
  const DeliveryLedgerV2 = await ethers.getContractFactory("DeliveryLedgerV2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, DeliveryLedgerV2);

  await upgraded.waitForDeployment();
  console.log("DeliveryLedger successfully upgraded to V2 at proxy address:", await upgraded.getAddress());
}

main().catch((error) => {
  console.error("Upgrade failed:", error);
  process.exitCode = 1;
});
