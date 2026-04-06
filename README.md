# 🌿 MedTree — Blockchain EMR Ledger

A tree-based blockchain ledger for patient Electronic Medical Records (EMR) built on Ethereum and EVM-compatible Layer-2 chains. Patients own their data — only their wallet or authorized doctors can create, fork, or extend their medical record branches.

## Architecture

```
Patient Wallet 
     or         ──► Smart Contract (EMRTreeLedger.sol)
Doctor Wallet           │
                   ┌────┴────┐
                   │  Branch  │  ← Genesis block (first visit)
                   │   #0     │
                   └────┬────┘
                   ┌────┴────┐
                   │ Block 1  │  ← Follow-up visit (addBlockToBranch)
                   └────┬────┘
              ┌─────────┴─────────┐
         ┌────┴────┐         ┌────┴────┐
         │ Block 2  │         │ Branch  │  ← Fork / collision block
         │ (main)   │         │   #1    │     (createCollisionBlock)
         └─────────┘         └─────────┘
```

Each patient's records form a **directed acyclic graph (DAG)**: a main branch with the ability to fork at any block, creating parallel branches for different departments, specialists, or emergency visits.

## Features

| Feature | Description |
|---------|-------------|
| **Genesis Block** | Registers a patient and creates their root EMR branch |
| **Collision Block** | Forks from any existing block to create a parallel branch |
| **Add Block** | Appends a follow-up record to an existing branch |
| **Doctor Access Control** | Grant/revoke write-permissions for distinct doctor Ethereum addresses |
| **IPFS Integration** | Upload files (PDFs, images) seamlessly via Pinata. Only the cryptographic CID pointer is stored on-chain |
| **Analytics Dashboard** | Visualizes key health metrics, total divergent paths, and tree growth via a Recharts dashboard |
| **Multi-Chain Interoperability** | Configured for deployment & UI support on Sepolia, Arbitrum Sepolia, and Polygon Amoy |

## Tech Stack

- **Smart Contract** — Solidity 0.8.27, Hardhat v2
- **Testing** — Chai, Hardhat Network, ethers v6
- **Frontend** — React 18, Vite 5, ethers.js 6, Recharts (Analytics)
- **Storage** — IPFS via Pinata REST API
- **Wallet** — MetaMask

## Quick Start

### 1. Install Dependencies

`ash
npm install
cd frontend && npm install && cd ..
`

### 2. Configure Environment Variables

Create a .env file in the root for smart contract deployment:
`env
SEPOLIA_RPC_URL=https://your-rpc-url
SEPOLIA_PRIVATE_KEY=your-private-key
`

Create a .env.local inside the rontend/ folder for IPFS integration:
`env
VITE_PINATA_JWT=your_pinata_jwt_token_here
`

### 3. Deploy the Contract (Sepolia Testnet)

`ash
npx hardhat run scripts/deploy.js --network sepolia
`

### 4. Configure the Frontend ABI

Copy the printed contract address from deployment into rontend/src/utils/abi.js:
`js
export const CONTRACT_ADDRESS = '0xPASTE_YOUR_ADDRESS_HERE';
`

### 5. Start the Frontend

`ash
cd frontend
npm run dev
`

Open http://localhost:5173 in your browser, connect MetaMask to Sepolia, and begin interacting with MedTree!