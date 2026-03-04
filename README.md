# 🌿 MedTree — Blockchain EMR Ledger

A tree-based blockchain ledger for patient Electronic Medical Records (EMR) built on Ethereum. Patients own their data — only their wallet can create, fork, or extend their medical record branches.

## Architecture

```
Patient Wallet ──► Smart Contract (EMRTreeLedger.sol)
                        │
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
| **Patient-Owned** | Only the patient's wallet can modify their records |
| **On-Chain Integrity** | Every block is hash-linked; metadata + hash stored on-chain |
| **React Frontend** | Dark glassmorphism UI with MetaMask integration |

## Tech Stack

- **Smart Contract** — Solidity 0.8.27, Hardhat v2
- **Testing** — Chai, Hardhat Network, ethers v6
- **Frontend** — React 18, Vite 5, ethers.js 6
- **Wallet** — MetaMask

## Project Structure

```
EMR/
├── contracts/
│   └── EMRTreeLedger.sol        # Core smart contract
├── scripts/
│   └── interact.js             
│   └── EMRTreeLedger.test.js   
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.css             
│       │   ├── Display.jsx      
│       ├── hooks/
│       │   ├── useWallet.js     # MetaMask connection
│       │   ├── useContract.js   # Contract read/write
│       ├── styles/
│       └── utils/
│           └── abi.js           # Contract ABI + address
├── hardhat.config.js
```
## Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension

## Quick Start

### 1. Install Dependencies

```bash
npm install

cd frontend && npm install && cd ..

```

### 2. Compile the Smart Contract



```bash

npm run compile

```

### 3. Run Tests



```



Expected output: **22 passing** tests covering deployment, genesis blocks, collision blocks, branch operations, multi-patient isolation, and DAG structure.

### 4. Start Local Blockchain



```bash
npm run node
```

This starts a Hardhat node at `http://127.0.0.1:8545` (Chain ID 1337) with 20 pre-funded test accounts. Keep this terminal open.



### 5. Deploy the Contract


Open a **new terminal**:


```bash
npm run deploy
```

Copy the printed contract address (e.g. `0x5FbDB2...`).

### 6. Configure the Frontend

Open `frontend/src/utils/abi.js` and replace the zero address with your deployed address:

```js
export const CONTRACT_ADDRESS = "0xPASTE_YOUR_ADDRESS_HERE";
```

### 7. Start the Frontend

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 8. Connect MetaMask

1. Open MetaMask → **Settings → Networks → Add Network**
2. Fill in:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
3. **Import Account** → paste a private key from the `npm run node` terminal output
4. Click **Connect MetaMask** in the app

You're ready — create your genesis block and start building your EMR tree.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile the Solidity contract |
| `npm test` | Run all 22 unit tests with gas report |
| `npm run node` | Start a local Hardhat blockchain |
| `npm run deploy` | Deploy to localhost |
| `npm run dev` | Start the frontend dev server |
| `npm run build` | Build the frontend for production |

## Smart Contract API

### Write Functions

| Function | Description |
|----------|-------------|
| `createGenesisBlock(metadata, recordHash)` | Register patient + create root branch |
| `createCollisionBlock(parentBranchId, parentBlockIndex, metadata, recordHash)` | Fork from any block |
| `addBlockToBranch(branchId, metadata, recordHash)` | Append to existing branch |

### Read Functions

| Function | Description |
|----------|-------------|
| `getPatientBranches(address)` | Get all branch IDs for a patient |
| `getBranchLength(branchId)` | Number of blocks in a branch |
| `getBlockDetails(branchId, blockIndex)` | Full block data |
| `getBranchPatient(branchId)` | Branch owner address |
| `isPatientRegistered(address)` | Check if patient exists |

## Gas Report

| Method | Avg Gas |
|--------|---------|
| `createGenesisBlock` | ~236K |
| `createCollisionBlock` | ~246K |
| `addBlockToBranch` | ~126K |
| **Deployment** | ~1M (1.7% of block limit) |

## License

MIT
