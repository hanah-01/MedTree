const hre = require("hardhat");

async function main() {
  const EMRTreeLedger = await hre.ethers.getContractFactory("EMRTreeLedger");
  const emrTreeLedger = await EMRTreeLedger.deploy();
  await emrTreeLedger.deployed();

  console.log("EMRTreeLedger deployed to:", emrTreeLedger.address);
  console.log("Deployment transaction hash:", emrTreeLedger.deployTransaction.hash);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Deployer balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  console.log("\n Contract Details:");
  console.log("   Branch Counter:", await emrTreeLedger.branchCounter());
  console.log("   1. Contract address:", emrTreeLedger.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });