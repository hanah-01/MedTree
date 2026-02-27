import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [address, setAddress]     = useState(null);
  const [provider, setProvider]   = useState(null);
  const [signer,   setSigner]     = useState(null);
  const [chainId,  setChainId]    = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);

  const isMetaMask = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
  const connect = useCallback(async () => {
    if (!isMetaMask) {
      setError("MetaMask not detected. Please install it from metamask.io");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer   = await _provider.getSigner();
      const _address  = await _signer.getAddress();
      const _network  = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(Number(_network.chainId));
    } catch (err) {
      setError(err.message ?? "Connection rejected");
    } finally {
      setLoading(false);
    }
  }, [isMetaMask]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accounts) => {
      if (accounts.length === 0) disconnect();
      else setAddress(accounts[0]);
    };

    const handleChain = (id) => setChainId(parseInt(id, 16));

    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged",    handleChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged",    handleChain);
    };
  }, [disconnect]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => { if (accounts.length > 0) connect(); })
      .catch(() => {});
  }, [connect]);

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return {
    address, shortAddress, provider, signer, chainId,
    loading, error, isMetaMask,
    connect, disconnect,
    isConnected: !!address,
  };
}
