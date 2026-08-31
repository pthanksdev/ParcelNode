# ParcelNode — Full Build Plan (Enterprise Scope)

**Concept:** Open-source, multi-carrier shipping API aggregator and merchant dashboard bridging Web2 SaaS with Web3 immutability. Full rate quoting, label generation, tracking, webhook orchestration, and a properly-designed blockchain audit layer — built to enterprise standard, not demo standard.

**Timeline:** 8-10 weeks solo, part-time-adjusted. No hard deadline, so depth takes priority over speed at every decision point below.

---

## Decisions (locked — full scope)

| Area | Decision | Reason |
|---|---|---|
| Chain | Sepolia (Ethereum testnet) | Best tooling/docs/faucets; standard EVM signal |
| Chain-write pattern | Async via Redis/BullMQ, worker-driven | Webhook path stays fast and idempotent regardless of chain latency |
| Oracle trust model | **Multi-signer attestation**, not single-server write | Single server "acting as oracle" is a known weak point — see below |
| Contract | **Upgradeable (UUPS proxy)**, versioned | Demonstrates you understand upgrade patterns and their risks, not just a static contract |
| Backend framework | NestJS | At full scope, Nest's module/DI structure pays for itself — testability, clear boundaries, guards for auth |
| Auth | Full multi-merchant JWT auth, scoped data access | This is now a real requirement, not a mock |
| Carriers | Adapter-pattern abstraction with 2 mock implementations, built as if a 3rd (real) carrier could be dropped in | Proves you understand the integration boundary, not just that you can hardcode JSON |
| Testing | Unit + integration + e2e, target 80%+ coverage on services/queue/oracle logic | This is the part that gets read in code review |
| CI/CD | GitHub Actions: lint, test, build, Docker image push | Standard expectation at "enterprise-grade" |
| Observability | Structured logging (pino), Sentry-style error tracking, Prometheus metrics on queue depth + chain confirmation latency | Ops maturity signal |
| Infra | Docker Compose for local; document (not necessarily build) a path to k8s/ECS | Full build ≠ full infra team — document the extension path rather than building a cluster you won't maintain |

---

## The Oracle-Trust Problem — Actually Solved This Time

At lean scope, this was a paragraph acknowledging the limitation. At full scope, you build the mitigation:

- **Multi-signer attestation**: instead of one server signing and submitting `logDelivery`, require signatures from N of M independent "carrier confirmation" sources (in your simulation: the mock carrier's webhook signature + your server's signature + a timestamp oracle) before a batch is submitted.
- **Batched merkle roots**: rather than one on-chain transaction per delivery event, accumulate events into a merkle tree over a short window (e.g. 10 minutes), submit only the root on-chain, and let anyone verify an individual delivery via merkle proof against that root. This is dramatically more gas-efficient and is the actual pattern real supply-chain chain-of-custody systems use.
- Document explicitly in the README: what this design does and doesn't guarantee (it proves the record wasn't altered after the batch was committed; it does not by itself prove the original carrier data was truthful — that still depends on carrier signature validity).

This is the single highest-value piece of "full scope" for interview purposes — it's the part that separates "used ethers.js" from "understands what blockchain is and isn't good for."

---

## Phase 0 — Design & Spine (Week 1)

- Write the three rationale paragraphs (chain vs hash-chained log, oracle-trust model + your mitigation, chain choice) — now backed by an actual design doc for the merkle-batch approach, not just prose.
- Design the full DB schema (below) including auth tables and adapter metadata.
- Design the contract interface: `submitBatch(bytes32 merkleRoot, uint256 timestamp)`, `verifyDelivery(bytes32[] proof, bytes32 leaf)`.
- Set up repo structure, monorepo tooling (pnpm workspaces or Turborepo), CI skeleton (lint + build only, tests come later).

## Phase 1 — Backend Core (Weeks 2-3)

1. NestJS modules: `AuthModule`, `MerchantsModule`, `RatesModule`, `ShipmentsModule`, `WebhooksModule`, `QueueModule`, `Web3Module`.
2. Full Prisma schema + migrations (below).
3. Auth: JWT issue/refresh, bcrypt password hashing, merchant-scoped guards on every route touching shipment data.
4. Carrier adapter interface (`CarrierAdapter`) with `FastShipAdapter` and `EcoDeliverAdapter` mock implementations — built so a real adapter could implement the same interface with zero changes elsewhere.
5. Rate engine, shipment creation, webhook ingestion with dedupe key.
6. Unit tests for all of the above as you go — not bolted on later.

## Phase 2 — Web3 Layer (Weeks 4-5)

1. Write and test the upgradeable contract (Hardhat + OpenZeppelin UUPS) locally first.
2. Implement the merkle-batch accumulator: a scheduled job collects confirmed `DELIVERED` events in a window, builds the tree, submits the root.
3. Multi-signer attestation logic — even simulated (your server + a second "attestor" key you control), the code path should genuinely require both signatures before a batch is eligible for submission.
4. Deploy proxy + implementation to Sepolia. Document the deploy process (script, not manual clicking).
5. Worker: submit batch, handle confirmation, write `tx_hash` + merkle proof back to each `TrackingEvent`.
6. Integration tests against a local Hardhat node (not live testnet, for speed and determinism) plus a documented manual verification against real Sepolia.

## Phase 3 — Frontend (Weeks 6-7)

1. Next.js App Router, full auth flow (login/session), merchant-scoped dashboard.
2. Shipments table: filtering, sorting, pagination — this is now a real data-heavy table, not a static list.
3. Tracking timeline with chain status (`NONE / PENDING / BATCHED / CONFIRMED / FAILED`) and, on confirmed, a merkle-proof verification widget (client-side proof check against the on-chain root, not just a link out) plus the Sepolia explorer link.
4. Basic merchant settings page (tests the auth-scoping end to end).

## Phase 4 — Hardening (Week 8)

1. e2e tests (Playwright) for the full flow: login → create shipment → simulate webhook → wait for batch → verify on dashboard.
2. Observability: pino structured logs, Sentry, Prometheus metrics (queue depth, batch size, confirmation latency) with a basic Grafana dashboard config checked into the repo.
3. GitHub Actions: lint → test → build → Docker build/push on merge to main.
4. Load-test the webhook endpoint (k6 or autocannon) to confirm idempotency holds under concurrent duplicate delivery.

## Phase 5 — Packaging (Weeks 9-10, buffer)

1. Docker Compose for full local stack (API, worker, frontend, Postgres, Redis, and optionally a local Hardhat node for demo mode).
2. README: architecture diagram, the Phase 0 rationale docs, setup instructions, explicit "what's simulated vs real" section (carriers are mocked; chain is real testnet; multi-signer is simulated with two keys you control — say so).
3. Recorded walkthrough: happy path + the merkle-proof verification + a deliberately-triggered failure (duplicate webhook, worker crash-restart) to show resilience live.
4. This buffer week absorbs whatever ran long — expect at least one of Phases 1-4 to.

---

# Project Structure

```
parcelnode/
├── docker-compose.yml
├── docker-compose.hardhat.yml       # optional local chain for demo/dev
├── .github/
│   └── workflows/
│       └── ci.yml
├── turbo.json                       # or pnpm-workspace.yaml
├── .env.example
├── README.md
│
├── contracts/
│   ├── contracts/
│   │   ├── DeliveryLedgerV1.sol     # UUPS-upgradeable implementation
│   │   └── DeliveryLedgerProxy.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── upgrade.ts
│   ├── test/
│   │   ├── DeliveryLedger.test.ts
│   │   └── MerkleVerification.test.ts
│   └── hardhat.config.ts
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── guards/
│   │   │       └── merchant-scoped.guard.ts
│   │   ├── merchants/
│   │   │   └── merchants.module.ts
│   │   ├── rates/
│   │   │   ├── rates.module.ts
│   │   │   ├── rates.controller.ts
│   │   │   └── rate-engine.service.ts
│   │   ├── carriers/
│   │   │   ├── carrier-adapter.interface.ts
│   │   │   ├── fastship.adapter.ts
│   │   │   └── ecodeliver.adapter.ts
│   │   ├── shipments/
│   │   │   ├── shipments.module.ts
│   │   │   ├── shipments.controller.ts
│   │   │   └── shipments.service.ts
│   │   ├── webhooks/
│   │   │   ├── webhooks.module.ts
│   │   │   ├── webhooks.controller.ts
│   │   │   └── dedupe.service.ts
│   │   ├── queue/
│   │   │   ├── queue.module.ts
│   │   │   ├── batch-accumulator.processor.ts  # scheduled: builds merkle batches
│   │   │   └── chain-submit.processor.ts        # worker: submits batch, writes tx_hash
│   │   ├── web3/
│   │   │   ├── web3.module.ts
│   │   │   ├── contract.service.ts
│   │   │   ├── merkle-tree.service.ts
│   │   │   └── attestation.service.ts           # multi-signer logic
│   │   ├── observability/
│   │   │   ├── logger.ts
│   │   │   └── metrics.ts
│   │   └── prisma/
│   │       └── prisma.service.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # shipments table
│   │   │   └── shipments/[id]/page.tsx   # timeline + merkle verification
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ShipmentsTable.tsx
│   │   ├── TrackingTimeline.tsx
│   │   ├── ChainStatusBadge.tsx
│   │   ├── MerkleProofVerifier.tsx       # client-side proof check
│   │   └── ExplorerLink.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── e2e/
│   │   └── full-flow.spec.ts             # Playwright
│   └── Dockerfile
│
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│       └── dashboard.json
│
└── docs/
    ├── PHASE0_RATIONALE.md
    ├── MERKLE_BATCH_DESIGN.md
    ├── ORACLE_TRUST_MODEL.md
    └── ARCHITECTURE.png
```

## Database Schema (Prisma, full scope)

```prisma
model Merchant {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique
  passwordHash String
  orders       Order[]
  createdAt    DateTime   @default(now())
}

model Order {
  id          String     @id @default(uuid())
  merchant    Merchant   @relation(fields: [merchantId], references: [id])
  merchantId  String
  item        String
  weightKg    Float
  destination String
  shipment    Shipment?
  createdAt   DateTime   @default(now())
}

model Shipment {
  id             String          @id @default(uuid())
  order          Order           @relation(fields: [orderId], references: [id])
  orderId        String          @unique
  carrier        String
  trackingId     String          @unique
  status         String
  trackingEvents TrackingEvent[]
  createdAt      DateTime        @default(now())
}

model TrackingEvent {
  id          String    @id @default(uuid())
  shipment    Shipment  @relation(fields: [shipmentId], references: [id])
  shipmentId  String
  status      String
  location    String
  timestamp   DateTime
  dedupeKey   String    @unique
  batch       Batch?    @relation(fields: [batchId], references: [id])
  batchId     String?
  leafHash    String?   # this event's leaf in the merkle tree
  chainStatus String    @default("NONE")  # NONE | PENDING | BATCHED | CONFIRMED | FAILED
  createdAt   DateTime  @default(now())
}

model Batch {
  id             String          @id @default(uuid())
  merkleRoot     String
  txHash         String?
  submittedAt    DateTime?
  confirmedAt    DateTime?
  attestation1   String?         # signature 1 (server)
  attestation2   String?         # signature 2 (secondary attestor)
  status         String          @default("ACCUMULATING") # ACCUMULATING | SUBMITTED | CONFIRMED | FAILED
  events         TrackingEvent[]
  createdAt      DateTime        @default(now())
}
```

## Contract Interface (full scope)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract DeliveryLedgerV1 is OwnableUpgradeable, UUPSUpgradeable {
    event BatchSubmitted(bytes32 merkleRoot, uint256 timestamp, uint256 eventCount);

    mapping(bytes32 => bool) public submittedRoots;

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function submitBatch(bytes32 merkleRoot, uint256 eventCount) external onlyOwner {
        require(!submittedRoots[merkleRoot], "Root already submitted");
        submittedRoots[merkleRoot] = true;
        emit BatchSubmitted(merkleRoot, block.timestamp, eventCount);
    }

    function verifyLeaf(bytes32 root, bytes32 leaf, bytes32[] calldata proof) external view returns (bool) {
        require(submittedRoots[root], "Unknown root");
        // standard merkle proof verification against `root`
        bytes32 computed = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computed = computed < proof[i]
                ? keccak256(abi.encodePacked(computed, proof[i]))
                : keccak256(abi.encodePacked(proof[i], computed));
        }
        return computed == root;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

---

## What's Genuinely Hard Here (be honest with yourself about these)

- **UUPS upgrade patterns** have real footguns (storage layout collisions between versions). Budget time to actually understand this, not just copy OpenZeppelin boilerplate.
- **Merkle batch timing** — deciding window size trades off gas cost vs confirmation latency. Worth being able to explain the tradeoff, not just implement one value.
- **Multi-signer "simulation"** — be explicit in docs that with two keys you personally control, this demonstrates the *pattern* correctly but isn't a real trust improvement until the second signer is an independent party (e.g. a real second carrier or auditor). Don't oversell this in the interview — the honest framing is more impressive than the inflated one.
- **This is genuinely an 8-10 week project.** If Week 5 arrives and you're still in Phase 1, that's a signal to cut back toward the lean plan, not to compress remaining phases.
