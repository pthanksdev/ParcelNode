import { ethers, upgrades } from "hardhat";

async function main() {
  const proxyAddress = process.env.CONTRACT_ADDRESS;
  if (!proxyAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable required for upgrade");
  }

  console.log("Upgrading DeliveryLedger proxy at:", proxyAddress);

  const DeliveryLedgerV2 = await ethers.getContractFactory("DeliveryLedgerV2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, DeliveryLedgerV2);
  await upgraded.waitForDeployment();

  const version = await upgraded.version();
  console.log("DeliveryLedger proxy upgraded successfully to Version:", version);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
