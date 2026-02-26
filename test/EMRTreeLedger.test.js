const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EMRTreeLedger", function () {
  let emrTreeLedger;
  let owner, patient1, patient2;

  beforeEach(async function () {
    [owner, patient1, patient2] = await ethers.getSigners();
    const EMRTreeLedger = await ethers.getContractFactory("EMRTreeLedger");
    emrTreeLedger = await EMRTreeLedger.deploy();
    await emrTreeLedger.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(emrTreeLedger.address).to.properAddress;
    });

    it("Should initialize with branch counter at 0", async function () {
      expect(await emrTreeLedger.branchCounter()).to.equal(0);
    });
  });

  describe("Genesis Block Creation", function () {
    it("Should create genesis block successfully", async function () {
      const metadata = "Initial EMR - Patient Visit 1";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_1"));

      await expect(emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash))
        .to.emit(emrTreeLedger, "BranchCreated")
        .withArgs(0, patient1.address, true)
        .to.emit(emrTreeLedger, "BlockCreated")
        .withArgs(0, patient1.address, recordHash, ethers.constants.HashZero);
    });

    it("Should fail to create duplicate genesis block", async function () {
      const metadata = "Initial EMR";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA"));

      await emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash);

      await expect(
        emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash)
      ).to.be.revertedWith("Genesis block already exists for this patient");
    });

    it("Should fail with empty record hash", async function () {
      const metadata = "Initial EMR";
      
      await expect(
        emrTreeLedger.connect(patient1).createGenesisBlock(metadata, ethers.constants.HashZero)
      ).to.be.revertedWith("Record hash cannot be empty");
    });

    it("Should track patient branches correctly", async function () {
      const metadata = "Initial EMR";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA"));

      await emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash);

      const branches = await emrTreeLedger.getPatientBranches(patient1.address);
      expect(branches.length).to.equal(1);
      expect(branches[0]).to.equal(0);
    });
  });

  describe("Collision Block Creation", function () {
    beforeEach(async function () {
      const metadata = "Initial EMR";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA"));
      await emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash);
    });

    it("Should create collision block successfully", async function () {
      const metadata = "Branch from visit 1";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));

      await expect(emrTreeLedger.connect(patient1).createCollisionBlock(0, 0, metadata, recordHash))
        .to.emit(emrTreeLedger, "BranchCreated")
        .withArgs(1, patient1.address, false);
    });

    it("Should fail if not branch owner", async function () {
      const metadata = "Unauthorized branch";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));

      await expect(
        emrTreeLedger.connect(patient2).createCollisionBlock(0, 0, metadata, recordHash)
      ).to.be.revertedWith("Only patient can update their records");
    });

    it("Should fail with invalid parent block index", async function () {
      const metadata = "Branch from visit 1";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));

      await expect(
        emrTreeLedger.connect(patient1).createCollisionBlock(0, 5, metadata, recordHash)
      ).to.be.revertedWith("Invalid parent block index");
    });

    it("Should create multiple branches from same parent", async function () {
      const metadata1 = "Branch 1 from genesis";
      const recordHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));
      
      const metadata2 = "Branch 2 from genesis";
      const recordHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_3"));

      await emrTreeLedger.connect(patient1).createCollisionBlock(0, 0, metadata1, recordHash1);
      await emrTreeLedger.connect(patient1).createCollisionBlock(0, 0, metadata2, recordHash2);

      const branches = await emrTreeLedger.getPatientBranches(patient1.address);
      expect(branches.length).to.equal(3); // Genesis + 2 collision branches
    });
  });

  describe("Add Block to Branch", function () {
    beforeEach(async function () {
      const metadata = "Initial EMR";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA"));
      await emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash);
    });

    it("Should add block to existing branch", async function () {
      const metadata = "Follow-up visit";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));

      await expect(emrTreeLedger.connect(patient1).addBlockToBranch(0, metadata, recordHash))
        .to.emit(emrTreeLedger, "BlockCreated")
        .withArgs(0, patient1.address, recordHash, await (await emrTreeLedger.getBlockDetails(0, 0)).blockHash);

      const branchLength = await emrTreeLedger.getBranchLength(0);
      expect(branchLength).to.equal(2);
    });

    it("Should fail if not branch owner", async function () {
      const metadata = "Unauthorized block";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));

      await expect(
        emrTreeLedger.connect(patient2).addBlockToBranch(0, metadata, recordHash)
      ).to.be.revertedWith("Only patient can update their records");
    });

    it("Should maintain correct prev hash references", async function () {
      const metadata1 = "Visit 2";
      const recordHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));
      
      const metadata2 = "Visit 3";
      const recordHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_3"));

      await emrTreeLedger.connect(patient1).addBlockToBranch(0, metadata1, recordHash1);
      await emrTreeLedger.connect(patient1).addBlockToBranch(0, metadata2, recordHash2);

      const block2 = await emrTreeLedger.getBlockDetails(0, 1);
      const block3 = await emrTreeLedger.getBlockDetails(0, 2);

      expect(block3.prevHash).to.equal(block2.blockHash);
    });
  });

  describe("Retrieve Branch Details", function () {
    beforeEach(async function () {
      const metadata = "Initial EMR";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA"));
      await emrTreeLedger.connect(patient1).createGenesisBlock(metadata, recordHash);
    });

    it("Should retrieve branch length correctly", async function () {
      const length = await emrTreeLedger.getBranchLength(0);
      expect(length).to.equal(1);

      const metadata = "Follow-up";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA_2"));
      await emrTreeLedger.connect(patient1).addBlockToBranch(0, metadata, recordHash);

      const newLength = await emrTreeLedger.getBranchLength(0);
      expect(newLength).to.equal(2);
    });

    it("Should retrieve block details correctly", async function () {
      const metadata = "Initial EMR";
      const recordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EMR_DATA"));

      const block = await emrTreeLedger.getBlockDetails(0, 0);
      expect(block.blockHash).to.equal(recordHash);
      expect(block.prevHash).to.equal(ethers.constants.HashZero);
      expect(block.metadata).to.equal(metadata);
    });

    it("Should retrieve branch patient correctly", async function () {
      const branchPatient = await emrTreeLedger.getBranchPatient(0);
      expect(branchPatient).to.equal(patient1.address);
    });

    it("Should fail for non-existent branch", async function () {
      await expect(
        emrTreeLedger.getBranchLength(999)
      ).to.be.revertedWith("Branch does not exist or is inactive");
    });

    it("Should fail for invalid block index", async function () {
      await expect(
        emrTreeLedger.getBlockDetails(0, 5)
      ).to.be.revertedWith("Block index out of bounds");
    });
  });

  describe("Multiple Patients", function () {
    it("Should handle multiple patients independently", async function () {
      const metadata1 = "Patient 1 Genesis";
      const recordHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PATIENT_1_DATA"));
      
      const metadata2 = "Patient 2 Genesis";
      const recordHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PATIENT_2_DATA"));

      await emrTreeLedger.connect(patient1).createGenesisBlock(metadata1, recordHash1);
      await emrTreeLedger.connect(patient2).createGenesisBlock(metadata2, recordHash2);

      const patient1Branches = await emrTreeLedger.getPatientBranches(patient1.address);
      const patient2Branches = await emrTreeLedger.getPatientBranches(patient2.address);

      expect(patient1Branches.length).to.equal(1);
      expect(patient2Branches.length).to.equal(1);
      expect(patient1Branches[0]).to.not.equal(patient2Branches[0]);
    });
  });

  describe("Tree Structure Validation", function () {
    it("Should create a complex tree structure", async function () {
      const genesisHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("GENESIS"));
      await emrTreeLedger.connect(patient1).createGenesisBlock("Genesis", genesisHash);

      const block1Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BLOCK_1"));
      await emrTreeLedger.connect(patient1).addBlockToBranch(0, "Block 1", block1Hash);

      const block2Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BLOCK_2"));
      await emrTreeLedger.connect(patient1).addBlockToBranch(0, "Block 2", block2Hash);

      const collision1Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COLLISION_1"));
      await emrTreeLedger.connect(patient1).createCollisionBlock(0, 1, "Collision 1", collision1Hash);

      const mainBranchLength = await emrTreeLedger.getBranchLength(0);
      const collisionBranchLength = await emrTreeLedger.getBranchLength(1);

      expect(mainBranchLength).to.equal(3);
      expect(collisionBranchLength).to.equal(1);

      const collisionBlock = await emrTreeLedger.getBlockDetails(1, 0);
      const parentBlock = await emrTreeLedger.getBlockDetails(0, 1);

      expect(collisionBlock.prevHash).to.equal(parentBlock.blockHash);
    });
  });
});