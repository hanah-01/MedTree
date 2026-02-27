const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Factory = await hre.ethers.getContractFactory("EMRTreeLedger");
  const emr = await Factory.deploy();
  await emr.waitForDeployment();

  const address = await emr.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("EMRTreeLedger deployed to:", address);
  console.log("Deployed by:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Branch Counter:", await emr.branchCounter());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });