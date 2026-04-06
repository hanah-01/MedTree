export const CONTRACT_ADDRESS = '0xD0237DC6E204A9B33eC8c3a3A1C6AAeF1C9F71a1';
export const ABI = [
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "patient",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "doctor",
                           "type":  "address"
                       }
                   ],
        "name":  "AccessGranted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "patient",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "doctor",
                           "type":  "address"
                       }
                   ],
        "name":  "AccessRevoked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "branchId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "patient",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "blockHash",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "prevHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "BlockCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "branchId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "patient",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isGenesis",
                           "type":  "bool"
                       }
                   ],
        "name":  "BranchCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "patient",
                           "type":  "address"
                       }
                   ],
        "name":  "PatientRegistered",
        "type":  "event"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_branchId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "_metadata",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "_recordHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "addBlockToBranch",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "authorizedDoctors",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "branchCounter",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "branches",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "branchId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "patient",
                            "type":  "address"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "active",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_parentBranchId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "_parentBlockIndex",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "_metadata",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "_recordHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "createCollisionBlock",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "_metadata",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "_recordHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "createGenesisBlock",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_branchId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "_blockIndex",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getBlockDetails",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "blockHash",
                            "type":  "bytes32"
                        },
                        {
                            "internalType":  "bytes32",
                            "name":  "prevHash",
                            "type":  "bytes32"
                        },
                        {
                            "internalType":  "string",
                            "name":  "metadata",
                            "type":  "string"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "timestamp",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_branchId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getBranchLength",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_branchId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getBranchPatient",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_patient",
                           "type":  "address"
                       }
                   ],
        "name":  "getPatientBranches",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "",
                            "type":  "uint256[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "doctor",
                           "type":  "address"
                       }
                   ],
        "name":  "grantAccess",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "hasGenesisBlock",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_patient",
                           "type":  "address"
                       }
                   ],
        "name":  "isPatientRegistered",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "patientBranches",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "doctor",
                           "type":  "address"
                       }
                   ],
        "name":  "revokeAccess",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
];
