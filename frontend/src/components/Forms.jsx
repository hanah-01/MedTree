import { useState } from "react";

const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
    },
    body: formData
  });

  if (!res.ok) {
    throw new Error('Failed to upload to Pinata IPFS');
  }

  const data = await res.json();
  return data.IpfsHash; 
};

export function CreateGenesis({ onCreate, loading }) {
  const [metadata, setMetadata] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!metadata.trim()) return;
    
    let finalMetadata = metadata.trim();
    if (file) {
      setUploading(true);
      try {
        const cid = await uploadToPinata(file);
        finalMetadata += ` | IPFS CID: ${cid}`;
      } catch (err) {
        console.error(err);
        alert("IPFS Upload Failed. Check Pinata JWT in .env.local");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onCreate(finalMetadata);
    setMetadata("");
    setFile(null);
  };

  return (
    <div className="glass panel fade-up">
      <div className="panel-header">
        <span className="panel-icon">🌱</span>
        <div>
          <h2 className="panel-title">Create Genesis Block</h2>
          <p className="panel-sub">First visit — registers you as a patient and starts your EMR tree root.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="panel-form">
        <div className="input-group">
          <label className="input-label">Visit Description</label>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. Initial visit — Dr. Smith — general checkup, blood pressure normal"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label">Upload Medical Record (IPFS)</label>
          <input 
            type="file" 
            className="input" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>
        <button className="btn btn-primary w-full" type="submit" disabled={loading || uploading || !metadata.trim()}>
          {loading || uploading ? <><span className="spinner" /> {uploading ? "Uploading to IPFS…" : "Submitting…"}</> : <><span>⛓️</span> Create Genesis Block</>}
        </button>
      </form>
    </div>
  );
}

export function CreateCollision({ branches, onFork, loading }) {
  const [parentBranchId, setParentBranchId] = useState("");
  const [parentBlockIndex, setParentBlockIndex] = useState("");
  const [metadata, setMetadata] = useState("");

  const selectedBranch = branches.find((b) => String(b.id) === String(parentBranchId));

  const handleSubmit = (e) => {
    e.preventDefault();
    onFork(Number(parentBranchId), Number(parentBlockIndex), metadata.trim());
    setMetadata("");
    setParentBlockIndex("");
  };

  return (
    <div className="glass panel fade-up">
      <div className="panel-header">
        <span className="panel-icon">🔀</span>
        <div>
          <h2 className="panel-title">Create Collision Block</h2>
          <p className="panel-sub">Fork from any existing block — creates a new parallel branch (DAG node).</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="panel-form">
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Parent Branch</label>
            <select
              className="input"
              value={parentBranchId}
              onChange={(e) => { setParentBranchId(e.target.value); setParentBlockIndex(""); }}
              required
            >
              <option value="">Select branch…</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>Branch #{b.id} ({b.blocks.length} blocks)</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Fork from Block #</label>
            <select
              className="input"
              value={parentBlockIndex}
              onChange={(e) => setParentBlockIndex(e.target.value)}
              required
              disabled={!selectedBranch}
            >
              <option value="">Select block…</option>
              {selectedBranch?.blocks.map((_, i) => (
                <option key={i} value={i}>Block {i} — {selectedBranch.blocks[i].metadata.slice(0, 30)}…</option>
              ))}
            </select>
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">New Branch Description</label>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. Emergency dept visit — chest pain — referred to cardiology"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={loading || !parentBranchId || parentBlockIndex === "" || !metadata.trim()}
        >
          {loading ? <><span className="spinner" /> Submitting…</> : <><span>🔀</span> Fork Branch</>}
        </button>
      </form>
    </div>
  );
}

export function AddBlock({ branches, onAdd, loading }) {
  const [branchId, setBranchId] = useState("");
  const [metadata, setMetadata] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalMetadata = metadata.trim();

    if (file) {
      setUploading(true);
      try {
        const cid = await uploadToPinata(file);
        finalMetadata += ` | IPFS CID: ${cid}`;
      } catch (err) {
        console.error(err);
        alert("IPFS Upload Failed. Check Pinata JWT in .env.local");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onAdd(Number(branchId), finalMetadata);
    setMetadata("");
    setFile(null);
  };

  return (
    <div className="glass panel fade-up">
      <div className="panel-header">
        <span className="panel-icon">➕</span>
        <div>
          <h2 className="panel-title">Add Block to Branch</h2>
          <p className="panel-sub">Append a follow-up visit record to an existing branch.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="panel-form">
        <div className="input-group">
          <label className="input-label">Target Branch</label>
          <select
            className="input"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
          >
            <option value="">Select branch…</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>Branch #{b.id} — {b.blocks.length} block{b.blocks.length !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Visit Description</label>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. Follow-up — Lab results reviewed — prescribed medication"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label">Upload Medical File (IPFS)</label>
          <input 
            type="file" 
            className="input" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>
        <button
          className="btn btn-secondary w-full"
          type="submit"
          disabled={loading || uploading || !branchId || !metadata.trim()}
        >
          {loading || uploading ? <><span className="spinner" /> {uploading ? "Uploading to IPFS…" : "Submitting…"}</> : <><span>📝</span> Add Block</>}
        </button>
      </form>
    </div>
  );
}

export function DoctorAccessForm({ onGrant, onRevoke, loading }) {
  const [doctorAddr, setDoctorAddr] = useState("");

  const handleGrant = (e) => {
    e.preventDefault();
    onGrant(doctorAddr.trim());
    setDoctorAddr("");
  };

  const handleRevoke = (e) => {
    e.preventDefault();
    onRevoke(doctorAddr.trim());
    setDoctorAddr("");
  };

  return (
    <div className="glass panel fade-up">
      <div className="panel-header">
        <span className="panel-icon">⚕️</span>
        <div>
          <h2 className="panel-title">Manage Doctor Access</h2>
          <p className="panel-sub">Grant or revoke write-access to your MedTree branches for a specific doctor's address.</p>
        </div>
      </div>
      <form onSubmit={handleGrant} className="panel-form">
        <div className="input-group">
          <label className="input-label">Doctor Ethereum Address</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 0x123...abc"
            value={doctorAddr}
            onChange={(e) => setDoctorAddr(e.target.value)}
            required
            pattern="^0x[a-fA-F0-9]{40}$"
            title="Must be a valid Ethereum address"
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={loading || !doctorAddr}>
                {loading ? <span className="spinner" /> : <><span>✅</span> Grant Access</>}
            </button>
            <button className="btn btn-secondary w-full" type="button" onClick={handleRevoke} disabled={loading || !doctorAddr}>
                {loading ? <span className="spinner" /> : <><span>🚫</span> Revoke Access</>}
            </button>
        </div>
      </form>
    </div>
  );
}
