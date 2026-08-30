# Merkle Tree Batch Accumulator Architecture

## Overview
Submitting individual tracking events to the blockchain is unscalable and cost-prohibitive. ParcelNode implements a worker-driven **Merkle Tree Batch Accumulator** pattern using NestJS, BullMQ, Redis, and standard Keccak-256 cryptographic hashing.

---

## 1. Event Ingestion & Leaf Hashing

When a carrier webhook reports a package status transition to `DELIVERED`, ParcelNode processes the payload through an idempotent deduplication filter. Once stored, a deterministic **Leaf Hash** is calculated:

```typescript
leafHash = keccak256(
  abi.encodePacked(
    shipmentId,
    trackingId,
    status,
    timestampISO,
    dedupeKey
  )
)
```

Each `TrackingEvent` record in PostgreSQL stores its unique `leafHash` and enters a `chainStatus` state of `PENDING`.

---

## 2. Merkle Tree Construction

At scheduled intervals (or upon accumulating target batch thresholds), the worker process:
1. Queries all `TrackingEvent` records where `chainStatus = 'PENDING'`.
2. Sorts leaf hashes deterministically to ensure reproducible binary tree structure.
3. Constructs a balanced Merkle Tree by pairing adjacent nodes and computing parent hashes:

$$Parent = \text{keccak256}(\min(Node_A, Node_B) \parallel \max(Node_A, Node_B))$$

4. Generates the single root node: `merkleRoot`.
5. For each event, stores the exact Merkle Proof path array (`bytes32[] proof`) in the relational database.

---

## 3. On-Chain Submission & Client Verification Flow

```
[ Carrier Webhook ] ---> [ Ingest & Dedupe ] ---> [ Generate Leaf Hash ]
                                                            |
                                                            v
[ Client Proof Check ] <--- [ Submit Root On-Chain ] <--- [ Accumulate Merkle Tree ]
        |
        +---> Compute client-side leaf hash from shipment payload
        +---> Fetch saved proof array from API
        +---> Call DeliveryLedgerV1.verifyLeaf(root, leaf, proof)
```

Clients and merchants can independently execute client-side Merkle proof verification:
1. Re-compute the event leaf hash using public shipment payload data.
2. Traverse the Merkle proof against the on-chain published `merkleRoot`.
3. Receive cryptographic proof of authenticity (`true` / `false`) directly from the smart contract view call.
