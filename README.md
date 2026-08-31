# ParcelNode — Enterprise Multi-Carrier Shipping & Web3 Audit Ledger

[![CI/CD Pipeline](https://github.com/parcelnode/parcelnode/actions/workflows/ci.yml/badge.svg)](https://github.com/parcelnode/parcelnode/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-lightgrey.svg)](https://soliditylang.org/)
[![EVM Sepolia](https://img.shields.io/badge/EVM-Sepolia%20Testnet-purple.svg)](https://sepolia.etherscan.io)

**ParcelNode** is a production-ready enterprise multi-carrier shipping API aggregator and merchant portal that bridges traditional Web2 logistics operations with Ethereum smart contract immutability. Built using NestJS, Next.js App Router, Prisma ORM, BullMQ queue workers, and UUPS Upgradeable Smart Contracts.

---

## Executive Summary & Core Value Proposition

In traditional e-commerce logistics, package delivery disputes between merchants, carriers, and buyers cost millions annually due to lost tracking histories, modified database records, or unverified claims.

**ParcelNode solves this trust deficit by:**
1. **Aggregating Carriers**: Providing unified rate calculation and shipment creation across multiple carriers (*FastShip*, *EcoDeliver*, and expandable to FedEx, UPS, DHL).
2. **Cryptographic Proofs**: Computing deterministic Keccak-256 Merkle tree leaves for every verified package delivery.
3. **On-Chain Immutability**: Anchoring batch Merkle roots onto the Ethereum blockchain via UUPS upgradeable smart contracts (`DeliveryLedgerV1.sol`).
4. **Independent Verification**: Allowing merchants and buyers to download and verify cryptographic proofs client-side without trusting centralized databases.

---

## Platform User Roles & Workflow

```
                                 +------------------------+
                                 |  Next.js Merchant Portal|
                                 |  (App Router + Ethers) |
                                 +-----------+------------+
                                             |
                                  REST API & | Client Merkle Proof
                                  JWT Auth   | Verification
                                             v
+-----------------------+        +-----------+------------+        +-----------------------+
| Mock Carrier Webhooks | ---->  | NestJS Enterprise API  | <----> | PostgreSQL DB         |
| (FastShip/EcoDeliver) |        | (Auth, Rates, Carrier) |        | (Prisma ORM)          |
+-----------------------+        +-----------+------------+        +-----------------------+
                                             |
                                    BullMQ   | Worker Trigger
                                    Queue    v
                                 +-----------+------------+
                                 |  Merkle Accumulator    |
                                 |  & System Attestations |
                                 +-----------+------------+
                                             |
                                   Ethers.js | submitBatch()
                                             v
                                 +-----------+------------+
                                 | DeliveryLedgerV1 Proxy |
                                 | (Sepolia EVM Contract) |
                                 +------------------------+
```

### 1. Merchants (Store Owners & Sellers)
- **Account Dashboard**: Log in securely using JWT tokens to view real-time shipping analytics, active orders, and revenue metrics.
- **Shipment Management**: Create orders, dispatch shipments, compare live carrier rates, and track progress.
- **Webhook Integration**: Receive real-time push notifications at custom HTTP webhook endpoints.
- **Proof Downloads**: Download JSON cryptographic Merkle proofs for delivered packages to settle disputes.

### 2. End Recipients (Customers / Buyers)
- **Frictionless Public Tracking**: Access public tracking pages (`/track/:trackingId`) with **zero login or registration required**.
- **Live Status & Visual Timelines**: View real-time location history, status changes (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`), and carrier details.
- **On-Chain Audit Badge**: View verified green badges demonstrating that package delivery was anchored on Ethereum.

### 3. Super Admin (Platform Operator)
- **Merchant Governance**: Monitor all registered merchants, view shipment volumes, and manage merchant account statuses (`ACTIVE` or `SUSPENDED`).
- **Batch Management & Overrides**: Manually trigger Merkle tree accumulation cycles on demand.
- **Circuit Breaker**: Pause or resume global blockchain batch submissions during gas spikes or network congestion.
- **Persistent Audit Logging**: Track every administrative operation with immutable audit records.

---

## Full-Stack Modular Architecture

Both the **Frontend** and **Backend** follow Domain-Driven Design (DDD) principles with absolute `@/*` import path aliases.

### Frontend Domain Layout (`frontend/`)

```
frontend/
├── app/                             # Next.js 14 App Router Pages & Layouts
│   ├── (auth)/                      # Authentication Routes
│   │   ├── login/page.tsx           # Merchant Login Page
│   │   └── register/page.tsx        # Merchant Registration Page
│   ├── admin/page.tsx               # Platform Super Admin Governance Panel
│   ├── batches/page.tsx             # Web3 Merkle Tree Batches Audit Explorer
│   ├── dashboard/                   # Merchant Core Portal
│   │   ├── page.tsx                 # Analytics & KPI Overview
│   │   └── shipments/               # Shipment CRUD Management
│   │       ├── create/page.tsx      # Dispatch New Shipment & Rate Engine Compare
│   │       └── [id]/page.tsx        # Shipment Details & Merkle Verification
│   ├── playground/page.tsx          # Interactive Merkle Tree Visualizer & Simulator
│   ├── settings/page.tsx            # API Keys, Webhook URL & Security Settings
│   ├── track/[trackingId]/page.tsx  # Unauthenticated Public Package Tracking Page
│   ├── layout.tsx                   # Root Shell, Responsive Navbar & Footer
│   ├── page.tsx                     # Public Marketing Landing Page
│   └── globals.css                  # Design System Tokens, Glassmorphism & Theme Styles
├── components/                      # Domain Components (barrel exported via index.ts)
│   ├── admin/                       # Super Admin Governance Tabs & Circuit Breakers
│   ├── layout/                      # Navbar, Footer, Mobile Drawer & Hero Sections
│   ├── settings/                    # Merchant Webhook & Security Settings
│   ├── shipments/                   # Shipment Tables, Tracking Timelines & Status Badges
│   ├── ui/                          # Reusable Cards, Buttons, Inputs & Modals
│   ├── web3/                        # Merkle Tree Visualizer, Explorer Links & Proof Badges
│   └── index.ts                     # Barrel Exporter for clean `@/components` imports
└── lib/                             # Utility Functions & API Services
    ├── api.ts                       # Axios HTTP REST Client
    ├── auth.ts                      # JWT Token & Auth Context Helpers
    ├── types.ts                     # TypeScript Data Models & DTOs
    └── utils.ts                     # Shared Formatting & Crypto Helpers
```

### Backend Domain Layout (`backend/`)

```
backend/
├── prisma/                          # Database Schema & Migrations
│   └── schema.prisma                # Merchants, Orders, Shipments, Batches, AuditLogs
└── src/
    ├── app.module.ts                # NestJS Root Application Module
    ├── main.ts                      # Bootstrap File with OpenAPI / Swagger Setup
    ├── core/                        # Global Platform Infrastructure Services
    │   ├── database/                # Prisma ORM Database Module & Service
    │   │   ├── prisma.module.ts
    │   │   └── prisma.service.ts
    │   └── observability/           # Telemetry, Structured Logger & Prometheus Metrics
    │       ├── logger.ts
    │       └── metrics.ts
    └── modules/                     # Domain Feature Modules
        ├── admin/                   # Platform Super Admin Governance REST API
        ├── auth/                    # Merchant Auth, JWT Strategy & Password Hashing
        ├── carriers/                # Carrier Integration Adapters (FastShip, EcoDeliver)
        ├── queue/                   # Cron & BullMQ Batch Accumulator & Chain Worker
        ├── rates/                   # Dynamic Carrier Rate Comparison Engine
        ├── shipments/               # Orders & Shipment CRUD API Controllers
        ├── web3/                    # Merkle Tree Service, Attestations & Contract Service
        └── webhooks/                # Carrier Webhook Ingestion & HMAC Guards
```

---

## Web3 Cryptography & Merkle Tree Batching

### Leaf Hash Formula
Every `DELIVERED` tracking event is hashed into a 32-byte leaf digest using Solidity-compatible Keccak-256:

$$\text{Leaf} = \text{Keccak256}(\text{shipmentId}, \text{trackingId}, \text{status}, \text{timestampIso}, \text{dedupeKey})$$

### Merkle Tree Construction
1. Leaf hashes are sorted lexicographically to ensure deterministic tree structure.
2. Pairwise Keccak-256 hashing is applied layer-by-layer to generate the Merkle Root.
3. ECDSA signature attestation is generated over `(merkleRoot, eventCount)` using the `SYSTEM_SIGNER_PRIVATE_KEY`.
4. The Merkle root is submitted on-chain via `DeliveryLedgerV1.submitBatch(merkleRoot, eventCount)`.

---

## REST API Specifications

The backend provides interactive OpenAPI / Swagger documentation at `http://localhost:3001/api/docs`.

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new Merchant account |
| `/api/auth/login` | `POST` | Public | Authenticate merchant and return JWT Bearer token |
| `/api/rates/quote` | `POST` | JWT | Compare shipping rates across carrier adapters |
| `/api/shipments` | `GET` / `POST` | JWT | List or create merchant shipments |
| `/api/shipments/:id` | `GET` / `PATCH` / `DELETE` | JWT | Get details, update, or cancel shipment |
| `/api/shipments/track/:trackingId` | `GET` | **Public** | Unauthenticated recipient tracking |
| `/api/shipments/:id/merkle-proof` | `GET` | JWT | Download JSON Merkle proof for verified delivery |
| `/api/web3/batches` | `GET` | Public | List all on-chain Merkle batches |
| `/api/webhooks/carrier` | `POST` | HMAC | Carrier webhook ingestion endpoint |
| `/api/admin/merchants` | `GET` / `PATCH` | Admin | Manage merchant accounts and webhooks |
| `/api/admin/circuit-breaker` | `POST` | Admin | Toggle global blockchain submission pause |
| `/api/admin/force-batch` | `POST` | Admin | Trigger manual Merkle batch accumulation |
| `/api/admin/audit-logs` | `GET` | Admin | View immutable administrative audit trail |

---

## Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parcelnode?schema=public"

# Auth
JWT_SECRET="super_secret_jwt_key_change_in_production_12345!"

# Web3 & Smart Contracts
ETH_RPC_URL="http://localhost:8545"
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
SYSTEM_SIGNER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Webhooks
CARRIER_WEBHOOK_SECRET="parcelnode_secret_key"

# Server Port
PORT=3001
```

---

## Quick Start & Local Execution

### 1. Start Infrastructure Containers
```bash
docker-compose up -d
```

### 2. Deploy Smart Contracts (Local EVM Chain)
```bash
cd contracts
npm install
npm run compile
npm run deploy:local
```

### 3. Setup Backend Database & Start API
```bash
cd ../backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### 4. Start Merchant Frontend Portal
```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Automated Testing

### Smart Contract Tests
```bash
cd contracts && npm test
```

### Backend Unit & Cryptographic Test Suite
```bash
cd backend && npm test
```

### Frontend Production Build Verification
```bash
cd frontend && npm run build
```

### Order of Execution Summary
 ```mermaid
    graph TD
    A[1. Push code to GitHub] --> B[2. Create Render Postgres DB]
    B --> C[3. Deploy Smart Contract to Sepolia]
    C --> D[4. Create Render Web Service for backend/]
    D --> E[5. Deploy Vercel App for frontend/]
    E --> F[🎉 Live Application Ready!]
```
---

## License & Open Source

This repository is open source and available under the [MIT License](LICENSE).
