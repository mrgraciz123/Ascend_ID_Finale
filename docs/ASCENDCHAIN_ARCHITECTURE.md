# ASCENDCHAIN ARCHITECTURE DECISION DOCUMENT

> **NETWORKING SUITE**: AscendChain Infrastructure  
> **SPECIFICATION VERSION**: 1.0.0  
> **DATE**: September 6, 2026  

---

## 1. SELECTED ARCHITECTURE

### **AscendChain EVM Sovereign Chain Architecture**

AscendChain is architected as an EVM-compatible sovereign blockchain network using Proof-of-Authority (PoA) consensus and standard Ethereum JSON-RPC specifications (EIP-1474 / EIP-1193).

### **Why This Architecture Was Selected**
1. **Full EVM Compatibility**: Enables native execution of Solidity smart contracts (`contracts/CredentialRegistry.sol`), standard ECDSA signatures (secp256k1), and standard EVM tooling (`viem`, `hardhat`, `ethers`).
2. **Determinism & Finality**: Single-block instant/timed finality eliminates chain reorganizations for cryptographic credential anchoring.
3. **Zero Gas Friction**: Custom network configuration allows zero or gas-optimized credential anchoring transactions managed by authorized institutional issuers.
4. **Independent Identity**: Does not rely on public testnets (Base Sepolia, Ethereum Goerli, Polygon Amoy) or external third-party chains.
5. **Clear Scaling & Upgrade Path**: Devnet runs as a local node process; Testnet/Mainnet upgrades smoothly to a multi-node Besu/Geth private PoA consensus or an OP Stack Layer 2 rollup.

---

## 2. CONSENSUS & BLOCK PRODUCTION

- **Devnet Consensus Model**: Single-validator Proof-of-Authority (PoA) with automated block production on transaction submission or fixed block intervals (1 second).
- **Testnet/Mainnet Consensus Model**: Multi-validator QBFT (Quorum Byzantine Fault Tolerant) / IBFT 2.0 consensus among verified university and government validator nodes.
- **Block Time**: 1 second (Devnet) / 2 seconds (Mainnet).
- **Finality**: 1 block deterministic finality upon validator signature.

---

## 3. NODE INFRASTRUCTURE

- **Primary Validator Node**: Responsible for state transitions, block building, transaction execution, and signing blocks.
- **RPC Gateway Node**: Exposes HTTP and WebSocket JSON-RPC interfaces for client DApps, verifier portals, and administrative tooling.
- **Storage**: RocksDB / LevelDB persistent state tree.

---

## 4. RPC & CLIENT CONNECTIVITY

Clients interact with AscendChain via standard HTTP JSON-RPC 2.0 methods:
- `eth_chainId`: Returns `0x343a` (13370 decimal)
- `eth_blockNumber`: Returns current hex block height
- `eth_getBlockByNumber`: Returns block data and transactions
- `eth_sendRawTransaction`: Submits signed EIP-155 / EIP-1559 transactions
- `eth_getTransactionReceipt`: Retrieves transaction confirmation receipts
- `eth_call`: Executes read-only contract state queries

**Default Devnet RPC Endpoint**: `http://127.0.0.1:8545` (configured locally via AscendChain node process).

---

## 5. CHAIN IDENTIFICATION & NETWORK ENVIRONMENTS

| Environment | Chain Name | Chain ID (Dec) | Chain ID (Hex) | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **Devnet** | `AscendChain Devnet` | `13370` | `0x343a` | Local standalone blockchain node for development & testing |
| **Testnet** | `AscendChain Testnet` | `13371` | `0x343b` | Multi-validator staging environment for institutional integration |
| **Mainnet** | `AscendChain Mainnet` | `13377` | `0x3441` | Production sovereign credential registry ledger |

---

## 6. ON-CHAIN DATA POLICY & PRIVACY

**STRICT ZERO PII RULE**: No Personal Identifiable Information (PII) is stored on AscendChain.

### Allowed On-Chain Data:
- Cryptographic SHA-256 metadata hashes (`bytes32`)
- Credential UUID strings (`string`)
- Issuer wallet addresses (`address`)
- Issuance block timestamps (`uint256`)
- Revocation status (`bool`) and revocation reason hash/string

---

## 7. KEY MANAGEMENT & SECURITY MODEL

- **Signer Wallet**: Server-side ECDSA wallet (private key provided via `ASCENDCHAIN_PRIVATE_KEY` environment variable).
- **Client Security**: Private keys are strictly confined to server-side issuance scripts and Node API handlers. Keys are never exposed in browser bundles or public env vars.
