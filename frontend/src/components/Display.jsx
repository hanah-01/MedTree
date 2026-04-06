import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function Header({ address, shortAddress, chainId, onConnect, onDisconnect, loading }) {
  const networkLabel =
    chainId === 1 ? "Mainnet"
    : chainId === 11155111 ? "Sepolia"
    : chainId === 421614 ? "Arbitrum Sepolia"
    : chainId === 80002 ? "Polygon Amoy"
    : chainId === 1337 ? "Localhost"
    : chainId ? `Chain ${chainId}`
    : null;

  const networkColor =
    chainId === 11155111 ? "badge-blue"
    : chainId === 421614 ? "badge-blue"
    : chainId === 80002 ? "badge-green"
    : chainId === 1337 ? "badge-yellow"
    : "badge-gray";

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

export function AnalyticsDashboard({ branches }) {
  if (!branches || branches.length === 0) return null;

  const totalBranches = branches.length;
  const totalBlocks = branches.reduce((acc, b) => acc + b.blocks.length, 0);

  let timeline = [];
  branches.forEach((b) => {
    b.blocks.forEach((blk) => {
      if (blk.timestamp) {
        timeline.push({ date: new Date(blk.timestamp * 1000).toLocaleDateString(), time: blk.timestamp });
      }
    });
  });

  timeline.sort((a, b) => a.time - b.time);
  let cumulative = 0;
  const chartData = timeline.map(entry => {
    cumulative += 1;
    return { name: entry.date, Records: cumulative };
  });

  return (
    <div className="analytics-dashboard fade-up">
      <div className="panel-header">
        <span className="panel-icon">📊</span>
        <div>
          <h2 className="panel-title">EMR Analytics Dashboard</h2>
          <p className="panel-sub">Visualize the growth and structure of your Medical Records.</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-title">Total Branches</div>
          <div className="stat-value">{totalBranches}</div>
          <div className="stat-desc">Divergent Treatment Paths</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-title">Total Records</div>
          <div className="stat-value">{totalBlocks}</div>
          <div className="stat-desc">Encrypted Health Blocks</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-title">Average Depth</div>
          <div className="stat-value">{(totalBlocks / totalBranches).toFixed(1)}</div>
          <div className="stat-desc">Blocks per Branch</div>
        </div>
      </div>

      <div className="chart-container glass" style={{ marginTop: '20px', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: 'var(--text-1)' }}>Tree Growth Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff' }} />
            <Line type="monotone" dataKey="Records" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
