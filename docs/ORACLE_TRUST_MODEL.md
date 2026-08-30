# Multi-Signer Oracle Trust Model & Attestation Architecture

## The Oracle Problem in Logistics Blockchains

A smart contract cannot natively inspect physical reality or carrier API payloads. A naive blockchain shipping integration relies on a single backend server signing and submitting events. If that single server key is compromised or acts maliciously, false delivery records can be committed on-chain without checks.

ParcelNode mitigates the single-point-of-trust vulnerability using a **Multi-Signer ECDSA Attestation Pattern**.

---

## Architecture: 2-of-2 Signature Attestation

Before any Merkle batch root is eligible for transaction submission by the queue worker, it requires valid ECDSA signatures from **N-of-M independent attestor authorities**:

1. **Primary Operational Oracle (Server Key)**: Represents the ParcelNode backend event ingestion pipeline.
2. **Secondary Auditor / Carrier Attestor Key**: Represents an independent verification service or mock carrier attestation authority.

```
+---------------------+     +--------------------------+
| ParcelNode Server   |     | Secondary Auditor Key    |
| (Primary Signer)    |     | (Secondary Signer)       |
+----------+----------+     +------------+-------------+
           |                             |
           v                             v
   Sign(merkleRoot)              Sign(merkleRoot)
           |                             |
           +--------------+--------------+
                          |
                          v
           +------------------------------+
           | Batch Attestation Validator  |
           | (Checks ECDSA Signatures)    |
           +--------------+---------------+
                          |
             [ Signatures Valid? ]
             /                   \
           (Yes)                 (No)
            /                     \
           v                       v
Submit to DeliveryLedgerV1    Reject Batch Submission
```

---

## Cryptographic Payload Structure

Attestors sign an EIP-712 formatted message digest containing:
- `merkleRoot`: The computed 32-byte Merkle root.
- `eventCount`: Number of delivery records included.
- `timestamp`: Batch generation timestamp.
- `nonce` / `chainId`: Protection against cross-chain replay attacks.

---

## Honest Disclosure & Guarantees

- **What this guarantees**: The Merkle root committed on-chain was attested by multiple independent private keys, preventing single-key forge attacks. Once confirmed, historical delivery events cannot be retroactively altered, replaced, or deleted without failing cryptographic Merkle proof verification.
- **What this does NOT guarantee**: The on-chain root proves historical immutability of recorded events; it does not independently verify if a physical delivery driver actually dropped a box on a physical doorstep. Trust in physical ground truth still relies on valid carrier signature cryptography.
