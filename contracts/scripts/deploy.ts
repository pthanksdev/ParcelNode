import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("----------------------------------------------------");
  console.log("Deploying DeliveryLedgerV1 with deployer:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const DeliveryLedger = await ethers.getContractFactory("DeliveryLedgerV1");
  
  // Deploy as UUPS proxy
  const proxy = await upgrades.deployProxy(DeliveryLedger, [deployer.address], {
    kind: "uups",
    initializer: "initialize",
  });

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("DeliveryLedger Proxy deployed successfully to:", proxyAddress);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
