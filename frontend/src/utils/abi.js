export const CONTRACT_ADDRESS = "0xA7f2EC8eF9293e3003919797Bd4998Db0ba33CB7";

export const ABI = [
  "event PatientRegistered(address indexed patient)",
  "event BranchCreated(uint256 indexed branchId, address indexed patient, bool isGenesis)",
  "event BlockCreated(uint256 indexed branchId, address indexed patient, bytes32 blockHash, bytes32 prevHash)",

  "function branchCounter() view returns (uint256)",
  "function hasGenesisBlock(address) view returns (bool)",
  "function isPatientRegistered(address _patient) view returns (bool)",
  "function getPatientBranches(address _patient) view returns (uint256[])",
  "function getBranchLength(uint256 _branchId) view returns (uint256)",
  "function getBranchPatient(uint256 _branchId) view returns (address)",
  "function getBlockDetails(uint256 _branchId, uint256 _blockIndex) view returns (bytes32 blockHash, bytes32 prevHash, string metadata, uint256 timestamp)",

  "function createGenesisBlock(string _metadata, bytes32 _recordHash) returns (uint256)",
  "function createCollisionBlock(uint256 _parentBranchId, uint256 _parentBlockIndex, string _metadata, bytes32 _recordHash) returns (uint256)",
  "function addBlockToBranch(uint256 _branchId, string _metadata, bytes32 _recordHash)",
];
