const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
  const Factory = await hre.ethers.getContractFactory("EMRTreeLedger");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const [patient1, patient2] = await hre.ethers.getSigners();
  console.log("Patient 1:", patient1.address);
  console.log("Patient 2:", patient2.address);

  const hash = (str) => hre.ethers.keccak256(hre.ethers.toUtf8Bytes(str));

  const tx1 = await contract.connect(patient1).createGenesisBlock("Initial EMR - Dr. Smith", hash("VISIT1"));
  await tx1.wait();

  const tx2 = await contract.connect(patient1).addBlockToBranch(0, "Follow-up - Lab Results", hash("VISIT2"));
  await tx2.wait();

  const tx3 = await contract.connect(patient1).createCollisionBlock(0, 0, "Emergency Dept", hash("EMERGENCY"));
  await tx3.wait();

  const branchIds = await contract.getPatientBranches(patient1.address);
  for (const id of branchIds) {
    const len = await contract.getBranchLength(id);
    for (let j = 0; j < len; j++) {
      const block = await contract.getBlockDetails(id, j);
      console.log(`Branch ${id}, Block ${j}:`, block);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
