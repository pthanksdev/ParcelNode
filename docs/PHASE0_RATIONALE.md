# ParcelNode Architectural Rationale & Design Philosophy

## 1. Public Blockchain vs. Hash-Chained Database Log

When building an enterprise audit trail for shipping event verification, software architects often consider two primary approaches:
1. **Hash-chained local log database** (e.g. append-only Merkle DAG in PostgreSQL or AWS QLDB).
2. **Public Ethereum Blockchain (Sepolia Testnet / Mainnet)**.

### Tradeoff Analysis
- **Tamper Evident vs. Tamper Proof**: A local hash-chained log is *tamper-evident* internally, but if the database administrator or system host updates historical records and rewrites the hash chain, external auditors cannot prove retrofits occurred without prior off-site signatures.
- **Independent Verifiability**: By publishing commitments to a public EVM smart contract (`DeliveryLedgerV1`), ParcelNode transfers finality and state immutability to an independent decentralized network. Merchants can independently verify package delivery receipts on-chain without trusting ParcelNode's internal servers.
- **Cost & Latency Neutralization**: Directly executing an on-chain transaction per shipping update incurs unacceptable gas overhead and network latency. ParcelNode resolves this via **Merkle Tree Accumulation**, aggregating thousands of delivery records into a single `bytes32` root commitment on-chain.

---

## 2. Upgradeability Pattern: UUPS Proxy (`DeliveryLedgerV1`)

Smart contract logic deployed to Ethereum is immutable by default. However, enterprise audit requirements require contract upgrades for security fixes, standard evolution, and optimization.

ParcelNode employs the **UUPS (Universal Upgradeable Proxy Standard - ERC-1822)** pattern over Transparent Proxies for the following reasons:
- **Gas Efficiency**: The upgrade logic resides inside the implementation contract rather than the proxy contract, eliminating unnecessary delegatecall routing overhead on standard function calls (`submitBatch` and `verifyLeaf`).
- **Storage Collision Protection**: OpenZeppelin's UUPS base contracts enforce storage layout compatibility during upgrades, safeguarding state variables (such as `mapping(bytes32 => bool) public submittedRoots`) across contract iterations.
- **Permissioned Authorization**: Upgrade authorization is locked to `onlyOwner` via the `_authorizeUpgrade` internal function.

---

## 3. Blockchain Selection: Ethereum Sepolia Testnet

ParcelNode targets **Sepolia** (Ethereum Testnet) for initial deployment and staging:
- **EVM Standard Parity**: Identical opcode behavior, gas calculations, and standard tooling (Hardhat, Ethers, Viem, OpenZeppelin) to Ethereum Mainnet and Arbitrum/Optimism L2 networks.
- **Faucets & Tooling Reliability**: Superior RPC stability, block explorer indexing (Etherscan, Blockscout), and faucet availability compared to legacy testnets (Goerli, Ropsten).
