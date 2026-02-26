// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract EMRTreeLedger {
    struct Block {
        bytes32 blockHash;
        bytes32 prevHash;
        string metadata;
        uint256 timestamp;
    }
    struct Branch {
        uint256 branchId;
        address patient;
        Block[] blocks;
        bool active;
    }
    mapping(address => uint256[]) public patientBranches;
    mapping(uint256 => Branch) public branches;
    uint256 public branchCounter; 
    mapping(address => bool) public hasGenesisBlock;
    
    event BranchCreated(
        uint256 indexed branchId,
        address indexed patient,
        bool isGenesis
    );
    
    event BlockCreated(
        uint256 indexed branchId,
        address indexed patient,
        bytes32 blockHash,
        bytes32 prevHash
    );
    
    modifier onlyPatient(uint256 _branchId) {
        require(
            branches[_branchId].patient == msg.sender,
            "Only patient can update their records"
        );
        _;
    }

    modifier branchExists(uint256 _branchId) {
        require(branches[_branchId].active, "Branch does not exist or is inactive");
        _;
    }

    function createGenesisBlock(
        string memory _metadata,
        bytes32 _recordHash
    ) external returns (uint256) {
        require(!hasGenesisBlock[msg.sender], "Genesis block already exists for this patient");
        require(_recordHash != bytes32(0), "Record hash cannot be empty");
        
        uint256 newBranchId = branchCounter++;
        Branch storage newBranch = branches[newBranchId];
        newBranch.branchId = newBranchId;
        newBranch.patient = msg.sender;
        newBranch.active = true;
        
        Block memory genesisBlock = Block({
            blockHash: _recordHash,
            prevHash: bytes32(0),
            metadata: _metadata,
            timestamp: block.timestamp
        });
        
        newBranch.blocks.push(genesisBlock);
        patientBranches[msg.sender].push(newBranchId);
        hasGenesisBlock[msg.sender] = true;
        
        emit BranchCreated(newBranchId, msg.sender, true);
        emit BlockCreated(newBranchId, msg.sender, _recordHash, bytes32(0));
        
        return newBranchId;
    }
    
    function createCollisionBlock(
        uint256 _parentBranchId,
        uint256 _parentBlockIndex,
        string memory _metadata,
        bytes32 _recordHash
    ) external branchExists(_parentBranchId) onlyPatient(_parentBranchId) returns (uint256) {
        require(_recordHash != bytes32(0), "Record hash cannot be empty");
        
        Branch storage parentBranch = branches[_parentBranchId];
        require(_parentBlockIndex < parentBranch.blocks.length, "Invalid parent block index");
        
        bytes32 parentHash = parentBranch.blocks[_parentBlockIndex].blockHash;
        
        uint256 newBranchId = branchCounter++;
        Branch storage newBranch = branches[newBranchId];
        newBranch.branchId = newBranchId;
        newBranch.patient = msg.sender;
        newBranch.active = true;
        
        Block memory collisionBlock = Block({
            blockHash: _recordHash,
            prevHash: parentHash,
            metadata: _metadata,
            timestamp: block.timestamp
        });
        
        newBranch.blocks.push(collisionBlock);
        patientBranches[msg.sender].push(newBranchId);
        
        emit BranchCreated(newBranchId, msg.sender, false);
        emit BlockCreated(newBranchId, msg.sender, _recordHash, parentHash);
        
        return newBranchId;
    }

    function addBlockToBranch(
        uint256 _branchId,
        string memory _metadata,
        bytes32 _recordHash
    ) external branchExists(_branchId) onlyPatient(_branchId) {
        require(_recordHash != bytes32(0), "Record hash cannot be empty");
        
        Branch storage branch = branches[_branchId];
        bytes32 prevHash = branch.blocks[branch.blocks.length - 1].blockHash;
        
        Block memory newBlock = Block({
            blockHash: _recordHash,
            prevHash: prevHash,
            metadata: _metadata,
            timestamp: block.timestamp
        });
        
        branch.blocks.push(newBlock);
        
        emit BlockCreated(_branchId, msg.sender, _recordHash, prevHash);
    }
    
    function getPatientBranches(address _patient) external view returns (uint256[] memory) {
        return patientBranches[_patient];
    }
    
    function getBranchLength(uint256 _branchId) external view branchExists(_branchId) returns (uint256) {
        return branches[_branchId].blocks.length;
    }
    
    function getBlockDetails(
        uint256 _branchId,
        uint256 _blockIndex
    ) 
        external 
        view 
        branchExists(_branchId) 
        returns (
            bytes32 blockHash,
            bytes32 prevHash,
            string memory metadata,
            uint256 timestamp
        ) 
    {
        Branch storage branch = branches[_branchId];
        require(_blockIndex < branch.blocks.length, "Block index out of bounds");
        
        Block memory b = branch.blocks[_blockIndex];
        return (b.blockHash, b.prevHash, b.metadata, b.timestamp);
    }
    
    function getBranchPatient(uint256 _branchId) external view branchExists(_branchId) returns (address) {
        return branches[_branchId].patient;
    }
}
