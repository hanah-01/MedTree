import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./hooks/useWallet";
import { useContract } from "./hooks/useContract";
import { useToast, toast } from "./hooks/useToast";
import { Header, ToastContainer, BranchTree } from "./components/Display";
import { CreateGenesis, CreateCollision, AddBlock } from "./components/Forms";
import "./styles/globals.css";
import "./App.css";

const TABS = [
  { id: "tree",    label: "My EMR Tree",       icon: "🌳" },
  { id: "genesis", label: "New Patient",        icon: "🌱" },
  { id: "fork",    label: "Fork Branch",        icon: "🔀" },
  { id: "add",     label: "Add Record",         icon: "➕" },
];

export default function App() {
  const wallet        = useWallet();
  const { loading: contractLoading, createGenesisBlock, createCollisionBlock, addBlockToBranch, fetchPatientData } =
    useContract(wallet.signer, wallet.provider);
  const { toasts, dismiss } = useToast();

  const [tab,       setTab]       = useState("tree");
  const [patient,   setPatient]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!wallet.address || !wallet.provider) return;
    setRefreshing(true);
    try {
      const data = await fetchPatientData(wallet.address);
      setPatient(data);
    } catch (err) {
      toast("error", "Failed to load data: " + (err.reason ?? err.message));
    } finally {
      setRefreshing(false);
    }
  }, [wallet.address, wallet.provider, fetchPatientData]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenesis = async (metadata) => {
    try {
      await createGenesisBlock(metadata);
      toast("success", "Genesis block created! You are now registered as a patient.");
      await loadData();
      setTab("tree");
    } catch (err) {
      toast("error", err.reason ?? err.message ?? "Transaction failed");
    }
  };

  const handleFork = async (parentBranchId, parentBlockIndex, metadata) => {
    try {
      await createCollisionBlock(parentBranchId, parentBlockIndex, metadata);
      toast("success", `Fork branch created from Branch #${parentBranchId} Block #${parentBlockIndex}!`);
      await loadData();
      setTab("tree");
    } catch (err) {
      toast("error", err.reason ?? err.message ?? "Transaction failed");
    }
  };

  const handleAdd = async (branchId, metadata) => {
    try {
      await addBlockToBranch(branchId, metadata);
      toast("success", `Block added to Branch #${branchId}!`);
      await loadData();
      setTab("tree");
    } catch (err) {
      toast("error", err.reason ?? err.message ?? "Transaction failed");
    }
  };

  const isRegistered = patient?.registered ?? false;
  const branches     = patient?.branches ?? [];
  const isBusy       = contractLoading || refreshing;

  return (
    <div className="app">
      <Header
        address={wallet.address}
        shortAddress={wallet.shortAddress}
        chainId={wallet.chainId}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        loading={wallet.loading}
      />

      {!wallet.isConnected ? (
        <div className="landing fade-up">
          <div className="landing-content">
            <div className="landing-icon">🌿</div>
            <h1 className="landing-title">
              <span className="gradient-text">MedTree</span>
            </h1>
            <p className="landing-desc">
              A tree-based blockchain ledger for patient Electronic Medical Records.
              <br />
              Tree structure · Patient-controlled · Tamper-proof · Ethereum smart contract.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={wallet.connect}
              disabled={wallet.loading}
            >
              {wallet.loading
                ? <><span className="spinner" /> Connecting…</>
                : <><span>🦊</span> Connect MetaMask to Begin</>}
            </button>
            {wallet.error && <p className="error-msg">{wallet.error}</p>}

            <div className="feature-grid">
              {[
                { icon: "🌱", label: "Genesis Block",   desc: "Register once — your root EMR node" },
                { icon: "🔀", label: "Fork Branch",     desc: "Parallel records from any block" },
                { icon: "🔒", label: "Patient-owned",   desc: "Only your wallet can update your data" },
                { icon: "⛓️", label: "Immutable chain", desc: "Every record hash-linked on-chain" },
              ].map((f) => (
                <div key={f.label} className="feature-card glass">
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-label">{f.label}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard">
          <div className="status-bar fade-up">
            <span className="status-dot" style={{ background: isRegistered ? "var(--accent-2)" : "var(--accent-warn)" }} />
            <span>
              {isRegistered
                ? `Registered patient · ${branches.length} branch${branches.length !== 1 ? "es" : ""}`
                : "Not registered — create your genesis block to begin"}
            </span>
            <span className="status-addr">{wallet.shortAddress}</span>
          </div>

          <div className="tabs fade-up">
            {TABS.map((t) => {
              const isDisabled =
                !isRegistered && (t.id === "fork" || t.id === "add");
              return (
                <button
                  key={t.id}
                  className={`tab${tab === t.id ? " tab-active" : ""}${isDisabled ? " tab-disabled" : ""}`}
                  onClick={() => !isDisabled && setTab(t.id)}
                  title={isDisabled ? "Register first" : undefined}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              );
            })}
          </div>

          <div className="tab-content">
            {tab === "tree" && (
              <BranchTree branches={branches} onRefresh={loadData} loading={isBusy} />
            )}
            {tab === "genesis" && (
              <CreateGenesis onCreate={handleGenesis} loading={isBusy} />
            )}
            {tab === "fork" && isRegistered && (
              <CreateCollision branches={branches} onFork={handleFork} loading={isBusy} />
            )}
            {tab === "add" && isRegistered && (
              <AddBlock branches={branches} onAdd={handleAdd} loading={isBusy} />
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
