export function Header({ address, shortAddress, chainId, onConnect, onDisconnect, loading }) {
  const networkLabel =
    chainId === 1 ? "Mainnet"
    : chainId === 11155111 ? "Sepolia"
    : chainId === 1337 ? "Localhost"
    : chainId ? `Chain ${chainId}`
    : null;

  const networkColor =
    chainId === 11155111 ? "badge-blue"
    : chainId === 1337 ? "badge-green"
    : "badge-yellow";

  return (
    <header className="app-header glass fade-up">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🌿</span>
          <div>
            <div className="logo-name gradient-text">MedTree</div>
            <div className="logo-sub">EMR Blockchain Ledger</div>
          </div>
        </div>
      </div>
      <div className="header-right">
        {networkLabel && (
          <span className={`badge ${networkColor}`}>
            <span className="dot" />
            {networkLabel}
          </span>
        )}
        {address ? (
          <div className="wallet-pill">
            <span className="wallet-icon">🦊</span>
            <span className="wallet-addr">{shortAddress}</span>
            <button className="btn btn-ghost btn-sm" onClick={onDisconnect} title="Disconnect">✕</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onConnect} disabled={loading}>
            {loading ? <><span className="spinner" /> Connecting…</> : <><span>🦊</span> Connect MetaMask</>}
          </button>
        )}
      </div>
    </header>
  );
}

export function ToastContainer({ toasts, dismiss }) {
  const icon = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}${t.exiting ? " exiting" : ""}`}
          onClick={() => dismiss(t.id)}
          style={{ cursor: "pointer" }}
        >
          <span className="toast-icon">{icon[t.type] ?? "💬"}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function BlockCard({ block, index }) {
  const date = block.timestamp ? new Date(block.timestamp * 1000).toLocaleString() : "—";
  const isGenesis = block.prevHash === "0x" + "0".repeat(64);

  return (
    <div className="block-card fade-up">
      <div className="block-card-header">
        <div className="block-index-badge">{isGenesis ? "🌱" : "📋"} Block {index}</div>
        <span className={`badge ${isGenesis ? "badge-green" : "badge-blue"}`}>
          {isGenesis ? "Genesis" : "Record"}
        </span>
      </div>
      <p className="block-metadata">{block.metadata}</p>
      <div className="block-hashes">
        <div>
          <span className="hash-label">Hash</span>
          <span className="hash">{block.blockHash.slice(0, 18)}…</span>
        </div>
        {!isGenesis && (
          <div>
            <span className="hash-label">Prev</span>
            <span className="hash">{block.prevHash.slice(0, 18)}…</span>
          </div>
        )}
      </div>
      <div className="block-timestamp">{date}</div>
    </div>
  );
}

export function BranchTree({ branches, onRefresh, loading }) {
  if (!branches || branches.length === 0) {
    return (
      <div className="glass panel empty-state fade-up">
        <span className="empty-icon">🌿</span>
        <p>No branches yet. Create your genesis block to start your EMR tree.</p>
      </div>
    );
  }

  return (
    <div className="branch-tree fade-up">
      <div className="branch-tree-header">
        <h2 className="section-title">
          <span>🌳</span> Your EMR Tree
          <span className="badge badge-blue" style={{ marginLeft: 10 }}>
            {branches.length} branch{branches.length !== 1 ? "es" : ""}
          </span>
        </h2>
        <button className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? <span className="spinner" /> : "↻"} Refresh
        </button>
      </div>
      <div className="branches-list">
        {branches.map((branch) => (
          <div key={branch.id} className="branch-container glass">
            <div className="branch-label">
              <span className="branch-icon">{branch.id === 0 ? "🌱" : "🔀"}</span>
              <span className="branch-name">Branch <strong>#{branch.id}</strong></span>
              <span className="badge badge-blue">{branch.blocks.length} block{branch.blocks.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="blocks-chain">
              {branch.blocks.map((block, i) => (
                <div key={i} className="block-chain-item">
                  <BlockCard block={block} index={i} />
                  {i < branch.blocks.length - 1 && (
                    <div className="chain-connector">
                      <div className="chain-line" />
                      <span className="chain-arrow">↓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
