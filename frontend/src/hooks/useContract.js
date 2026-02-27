import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "../utils/abi";

const toHash = (str) => ethers.keccak256(ethers.toUtf8Bytes(str));

export function useContract(signer, provider) {
  const [loading, setLoading] = useState(false);

  const getContract = useCallback(
    (signerOrProvider) =>
      new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider ?? provider),
    [provider]
  );

  const createGenesisBlock = useCallback(
    async (metadata) => {
      setLoading(true);
      try {
        const contract = getContract(signer);
        const recordHash = toHash(metadata + Date.now());
        const tx = await contract.createGenesisBlock(metadata, recordHash);
        const receipt = await tx.wait();
        return { success: true, tx, receipt, recordHash };
      } finally {
        setLoading(false);
      }
    },
    [signer, getContract]
  );

  const createCollisionBlock = useCallback(
    async (parentBranchId, parentBlockIndex, metadata) => {
      setLoading(true);
      try {
        const contract = getContract(signer);
        const recordHash = toHash(metadata + Date.now());
        const tx = await contract.createCollisionBlock(
          parentBranchId,
          parentBlockIndex,
          metadata,
          recordHash
        );
        const receipt = await tx.wait();
        return { success: true, tx, receipt, recordHash };
      } finally {
        setLoading(false);
      }
    },
    [signer, getContract]
  );

  const addBlockToBranch = useCallback(
    async (branchId, metadata) => {
      setLoading(true);
      try {
        const contract = getContract(signer);
        const recordHash = toHash(metadata + Date.now());
        const tx = await contract.addBlockToBranch(branchId, metadata, recordHash);
        const receipt = await tx.wait();
        return { success: true, tx, receipt, recordHash };
      } finally {
        setLoading(false);
      }
    },
    [signer, getContract]
  );

  const fetchPatientData = useCallback(
    async (address) => {
      const contract = getContract();
      if (!contract) return null;

      const isReg = await contract.isPatientRegistered(address);
      if (!isReg) return { registered: false, branches: [] };

      const branchIds = await contract.getPatientBranches(address);
      const branches  = await Promise.all(
        branchIds.map(async (id) => {
          const len    = await contract.getBranchLength(id);
          const blocks = await Promise.all(
            Array.from({ length: Number(len) }, (_, i) =>
              contract.getBlockDetails(id, i).then((b) => ({
                blockHash: b.blockHash,
                prevHash:  b.prevHash,
                metadata:  b.metadata,
                timestamp: Number(b.timestamp),
              }))
            )
          );
          return { id: Number(id), blocks };
        })
      );

      return { registered: true, branches };
    },
    [getContract]
  );

  return {
    loading,
    createGenesisBlock,
    createCollisionBlock,
    addBlockToBranch,
    fetchPatientData,
  };
}
