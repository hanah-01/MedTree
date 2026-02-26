const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
  const EMRTreeLedger = await hre.ethers.getContractFactory("EMRTreeLedger");
  const contract = await EMRTreeLedger.attach(CONTRACT_ADDRESS);
  
  const [patient1, patient2] = await hre.ethers.getSigners();
  console.log(" Patient 1 Address:", patient1.address);
  console.log(" Patient 2 Address:", patient2.address);
  console.log();

  try {
    const metadata1 = "Initial EMR - First Hospital Visit - Dr. Smith";
    const recordHash1 = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("EMR_DATA_PATIENT1_VISIT1")
    );
    
    const tx1 = await contract.connect(patient1).createGenesisBlock(metadata1, recordHash1);
    const receipt1 = await tx1.wait();

    const metadata2 = "Follow-up Visit - Lab Results - Dr. Johnson";
    const recordHash2 = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("EMR_DATA_PATIENT1_VISIT2")
    );
    
    const tx2 = await contract.connect(patient1).addBlockToBranch(0, metadata2, recordHash2);
    const receipt2 = await tx2.wait();

    const metadata3 = "Emergency Visit - Different Department";
    const recordHash3 = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("EMR_DATA_PATIENT1_EMERGENCY")
    );
    
    const tx3 = await contract.connect(patient1).createCollisionBlock(0, 0, metadata3, recordHash3);
    const receipt3 = await tx3.wait();
    const branches = await contract.getPatientBranches(patient1.address);
    
    for (let i = 0; i < branches.length; i++) {
      const branchId = branches[i];
      const branchLength = await contract.getBranchLength(branchId);
      for (let j = 0; j < branchLength; j++) {
        const block = await contract.getBlockDetails(branchId, j);
        console.log(`   Branch ${branchId}, Block ${j}:`, block);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
