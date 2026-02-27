const { expect } = require("chai");
const { ethers } = require("hardhat");

const hash = (str) => ethers.keccak256(ethers.toUtf8Bytes(str));
const ZERO  = ethers.ZeroHash;

describe("EMRTreeLedger", function () {
  let emr;
  let owner, patient1, patient2;

  beforeEach(async function () {
    [owner, patient1, patient2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EMRTreeLedger");
    emr = await Factory.deploy();
    await emr.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy to a valid address", async function () {
      expect(await emr.getAddress()).to.match(/^0x[0-9a-fA-F]{40}$/);
    });

    it("should start with branchCounter = 0", async function () {
      expect(await emr.branchCounter()).to.equal(0n);
    });
  });

  describe("Genesis Block Creation", function () {
    it("should create genesis block and emit both events", async function () {
      const meta = "Initial EMR - Patient Visit 1";
      const rh   = hash("EMR_DATA_1");

      await expect(emr.connect(patient1).createGenesisBlock(meta, rh))
        .to.emit(emr, "PatientRegistered").withArgs(patient1.address)
        .to.emit(emr, "BranchCreated").withArgs(0n, patient1.address, true)
        .to.emit(emr, "BlockCreated").withArgs(0n, patient1.address, rh, ZERO);
    });

    it("should mark patient as registered", async function () {
      const rh = hash("EMR_DATA");
      await emr.connect(patient1).createGenesisBlock("Init", rh);
      expect(await emr.isPatientRegistered(patient1.address)).to.be.true;
    });

    it("should revert on duplicate genesis block", async function () {
      const rh = hash("EMR_DATA");
      await emr.connect(patient1).createGenesisBlock("Init", rh);
      await expect(
        emr.connect(patient1).createGenesisBlock("Init again", rh)
      ).to.be.revertedWith("Genesis block already exists for this patient");
    });

    it("should revert with empty record hash", async function () {
      await expect(
        emr.connect(patient1).createGenesisBlock("Init", ZERO)
      ).to.be.revertedWith("Record hash cannot be empty");
    });

    it("should track branch IDs per patient", async function () {
      const rh = hash("EMR_DATA");
      await emr.connect(patient1).createGenesisBlock("Init", rh);
      const brs = await emr.getPatientBranches(patient1.address);
      expect(brs.length).to.equal(1);
      expect(brs[0]).to.equal(0n);
    });
  });

  describe("Collision Block Creation", function () {
    beforeEach(async function () {
      await emr.connect(patient1).createGenesisBlock("Genesis", hash("G"));
    });

    it("should create a collision branch and emit events", async function () {
      const rh = hash("COLL_1");
      await expect(emr.connect(patient1).createCollisionBlock(0n, 0n, "Fork A", rh))
        .to.emit(emr, "BranchCreated").withArgs(1n, patient1.address, false)
        .to.emit(emr, "BlockCreated").withArgs(1n, patient1.address, rh, hash("G"));
    });

    it("should link prevHash to the parent block hash", async function () {
      const rh = hash("COLL_1");
      await emr.connect(patient1).createCollisionBlock(0n, 0n, "Fork A", rh);
      const block = await emr.getBlockDetails(1n, 0n);
      expect(block.prevHash).to.equal(hash("G"));
    });

    it("should revert when called by non-owner", async function () {
      await expect(
        emr.connect(patient2).createCollisionBlock(0n, 0n, "Hack", hash("H"))
      ).to.be.revertedWith("Only patient can update their records");
    });

    it("should revert with invalid parent block index", async function () {
      await expect(
        emr.connect(patient1).createCollisionBlock(0n, 99n, "Bad", hash("B"))
      ).to.be.revertedWith("Invalid parent block index");
    });

    it("should allow multiple forks from the same parent", async function () {
      await emr.connect(patient1).createCollisionBlock(0n, 0n, "Fork A", hash("A"));
      await emr.connect(patient1).createCollisionBlock(0n, 0n, "Fork B", hash("B"));
      const brs = await emr.getPatientBranches(patient1.address);
      expect(brs.length).to.equal(3); // genesis + 2 forks
    });
  });

  describe("addBlockToBranch", function () {
    beforeEach(async function () {
      await emr.connect(patient1).createGenesisBlock("Genesis", hash("G"));
    });

    it("should append a block and increase branch length", async function () {
      await emr.connect(patient1).addBlockToBranch(0n, "Visit 2", hash("V2"));
      expect(await emr.getBranchLength(0n)).to.equal(2n);
    });

    it("should correctly chain prevHash references", async function () {
      await emr.connect(patient1).addBlockToBranch(0n, "Visit 2", hash("V2"));
      await emr.connect(patient1).addBlockToBranch(0n, "Visit 3", hash("V3"));
      const b1 = await emr.getBlockDetails(0n, 1n);
      const b2 = await emr.getBlockDetails(0n, 2n);
      expect(b2.prevHash).to.equal(b1.blockHash);
    });

    it("should revert when called by non-owner", async function () {
      await expect(
        emr.connect(patient2).addBlockToBranch(0n, "Hack", hash("H"))
      ).to.be.revertedWith("Only patient can update their records");
    });

    it("should revert with empty hash", async function () {
      await expect(
        emr.connect(patient1).addBlockToBranch(0n, "Bad", ZERO)
      ).to.be.revertedWith("Record hash cannot be empty");
    });
  });

  describe("Read Functions", function () {
    beforeEach(async function () {
      await emr.connect(patient1).createGenesisBlock("Genesis", hash("G"));
    });

    it("should retrieve correct block details", async function () {
      const block = await emr.getBlockDetails(0n, 0n);
      expect(block.blockHash).to.equal(hash("G"));
      expect(block.prevHash).to.equal(ZERO);
      expect(block.metadata).to.equal("Genesis");
    });

    it("should return correct branch patient", async function () {
      expect(await emr.getBranchPatient(0n)).to.equal(patient1.address);
    });

    it("should revert getBranchLength on non-existent branch", async function () {
      await expect(emr.getBranchLength(999n)).to.be.revertedWith(
        "Branch does not exist or is inactive"
      );
    });

    it("should revert getBlockDetails on out-of-bounds index", async function () {
      await expect(emr.getBlockDetails(0n, 99n)).to.be.revertedWith(
        "Block index out of bounds"
      );
    });
  });

  describe("Multiple Patients", function () {
    it("should isolate branches per patient", async function () {
      await emr.connect(patient1).createGenesisBlock("P1 Genesis", hash("P1"));
      await emr.connect(patient2).createGenesisBlock("P2 Genesis", hash("P2"));

      const p1brs = await emr.getPatientBranches(patient1.address);
      const p2brs = await emr.getPatientBranches(patient2.address);

      expect(p1brs.length).to.equal(1);
      expect(p2brs.length).to.equal(1);
      expect(p1brs[0]).to.not.equal(p2brs[0]);
    });
  });

  describe("Tree Structure (DAG)", function () {
    it("should build and validate a 2-level tree", async function () {
      await emr.connect(patient1).createGenesisBlock("Genesis", hash("G"));
      await emr.connect(patient1).addBlockToBranch(0n, "Visit 1", hash("V1"));
      await emr.connect(patient1).addBlockToBranch(0n, "Visit 2", hash("V2"));

      // Fork from block[1] of branch 0
      await emr.connect(patient1).createCollisionBlock(0n, 1n, "Emergency Dept", hash("E"));

      // Branch 0: 3 blocks
      expect(await emr.getBranchLength(0n)).to.equal(3n);
      // Branch 1: 1 block (fork)
      expect(await emr.getBranchLength(1n)).to.equal(1n);

      // Fork block prevHash should equal block[1] of branch 0
      const forkBlock   = await emr.getBlockDetails(1n, 0n);
      const parentBlock = await emr.getBlockDetails(0n, 1n);
      expect(forkBlock.prevHash).to.equal(parentBlock.blockHash);
    });
  });
});
