# 💊 TrueDose — Blockchain-Based Pharmaceutical Supply Chain & Medicine Verification

> **A decentralized, tamper-evident platform that records the journey of a medicine batch from manufacturer to pharmacy on an EVM blockchain, enabling instant public verification via QR code.**

---

## 📌 1. Problem Statement

In the traditional pharmaceutical supply chain, medicine batches pass through multiple independent organizations:
$$\text{Manufacturer} \longrightarrow \text{Distributor} \longrightarrow \text{Wholesaler} \longrightarrow \text{Pharmacy} \longrightarrow \text{Customer}$$

Traditional supply chain systems face critical vulnerabilities:
- **Centralized Databases:** Vulnerable to database alterations, unauthorized history edits, or single-point-of-failure tampering.
- **Counterfeit & Clone Medicines:** Fake batches printed with fabricated batch numbers infiltrate retail channels.
- **Expired Medicines:** Substandard or expired batches sold to consumers without real-time safety enforcement.
- **Unauthorized Transfers:** Intermediaries bypassing standard distribution checkpoints.
- **No Direct Consumer Verification:** Patients have no independent method to verify provenance.

---

## 💡 2. Solution: The TrueDose Blockchain Architecture

TrueDose solves these challenges by combining smart contracts on the Ethereum Virtual Machine (EVM) with a high-performance web verification interface:

```
                            [ PHYSICAL MEDICINE BOX ]
                                      │
                                 [ QR CODE ]
                                      │
                                      ▼
                          [ TRUEDOSE WEB VERIFIER ]
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              [ EXPRESS API ]                 [ EVM SMART CONTRACT ]
              Metadata, Profiles,             Batch ID, Current Custodian,
              Rapid Cache & Stats             Tamper-Evident History & State
```

### Storage Architecture (Hybrid Model)
- **On Blockchain (Solidity Smart Contract `PharmaSupplyChain.sol`):**
  - Batch ID, medicine name, dosage, volume
  - Current custodian Ethereum address & previous handlers
  - Immutable state (`Manufactured` $\to$ `Distributor` $\to$ `Wholesaler` $\to$ `Pharmacy` $\to$ `SoldToCustomer`)
  - Timestamps, transaction hashes, and recall orders
- **Off Blockchain (Fast Storage):**
  - Participant user profiles, contact details, licensing credentials
  - QR Code vector rendering
  - Analytical metrics

---

## 🛡️ 3. Smart Contract Enforced Rules

1. **Role-Gated Batch Creation:** Only approved Manufacturer addresses can invoke `createBatch()`.
2. **Strict Sequential Custody Transitions:**
   - $\text{Manufacturer} \to \text{Distributor}$ (`transferToDistributor`)
   - $\text{Distributor} \to \text{Wholesaler}$ (`transferToWholesaler`)
   - $\text{Wholesaler} \to \text{Pharmacy}$ (`transferToPharmacy`)
   - $\text{Pharmacy} \to \text{Customer}$ (`markAsSold`)
   - *Direct illegal jumps (e.g. Pharmacy transferring back to Manufacturer) are rejected on-chain.*
3. **Current Owner Guard:** Only the active custodian on record can authorize an onward transfer.
4. **Automated Expiry Locking:** Prevents custody transfer of expired batches and warns consumers.
5. **Emergency Regulatory Quarantine:** Regulators or Manufacturers can trigger a global `recallBatch()` order.

---

## ❓ 4. Viva / Examiner Defense: "Why didn't you just use MongoDB?"

| Evaluation Criteria | Traditional MongoDB / SQL | TrueDose Blockchain Smart Contract |
| :--- | :--- | :--- |
| **Trust Model** | Centralized (Controlled by one company or DBA). | **Trustless Consortium** (Shared cryptographic ledger between parties). |
| **History Immutability** | Database admins or attackers with credentials can `UPDATE` or `DELETE` rows secretly. | **Append-Only & Cryptographically Chained:** Past transactions cannot be altered retroactively. |
| **Business Logic Enforcement** | Application-level code can be bypassed or manipulated. | **Smart Contract Bytecode** runs autonomously on EVM nodes; rules cannot be bypassed. |
| **Non-Repudiation** | Any party can claim they never transferred or received a tainted batch. | **Cryptographic Digital Signatures:** Every transfer is signed with the sender's private key. |
| **Consumer Access** | Patients must trust the database owner's private API. | **Public Verification View:** Open ledger inspection without needing accounts or proprietary access. |

---

## 👥 5. Supply Chain Roles & Capabilities

- 👨‍💼 **Manufacturer (ABC Pharma Ltd.)**: Register new batch, generate printable packaging QR code, transfer to distributor, issue recall.
- 🚚 **Distributor (Apex Logistics)**: Accept batches from factory, log cold-chain transportation, transfer to regional wholesaler.
- 🏪 **Wholesaler (Metro Health Wholesalers)**: Receive shipments, verify lot integrity, distribute to retail pharmacies.
- 💊 **Pharmacy (HealthPlus Community Pharmacy)**: Receive stock, mark as dispensed to customer, generate verification receipts.
- 👤 **End Consumer**: Scan QR code with any camera or phone browser, inspect full provenance timeline, verify expiry and authenticity without needing crypto or wallet.
- 👨‍💻 **Regulator / Admin**: Audit global batches, monitor counterfeit scan attempts, inspect EVM smart contract explorer.

---

## 🚀 6. Quickstart Guide

### Prerequisites
- **Node.js** (v18 or v20+)
- **npm** (v9+)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd TrueDose

# Install all dependencies across contracts, server, and client
npm run install:all
```

### Compile & Deploy Smart Contract
```bash
# Compile Solidity contract with viaIR optimizer
npm run compile:contracts

# Deploy contract and seed demo batches to config
npm run deploy:contracts
```

### Launch the Platform
```bash
# Run both Backend API (:5000) and Frontend Client (:5173) concurrently:
npm run dev
```

Visit the application at:
- 🌐 **Web Application:** [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- 🔍 **Direct Batch API:** [http://localhost:5000/api/verify/PCM001](http://localhost:5000/api/verify/PCM001)

### 🧪 Automated Testing & Logical Error Invariant Suite
Execute the master automated testing suite covering all 50 smart contract and API logical error invariants:
```bash
# Run all 50 tests (EVM Smart Contract + REST API + State Machine):
npm test

# Run individual test suites:
npm run test:contracts   # 21 EVM smart contract invariants
npm run test:api         # 29 API & state machine invariants
```

---

## 🎯 7. Live Demonstration Walkthrough (1-Minute Script)

1. **Verify Genuine Medicine (`PCM001`):**
   - On the homepage [http://localhost:5173](http://localhost:5173), click the **`PCM001 (Genuine)`** pill or search `PCM001`.
   - Observe the **Genuine Verified** badge, celebratory confetti, medicine specifications, and the sequential supply-chain timeline with transaction hashes.
2. **Demonstrate Counterfeit Detection (`FAKE999`):**
   - Click the **`FAKE999 (Counterfeit)`** pill.
   - The platform checks the blockchain, finds no record, and triggers a **Critical Warning: Suspected Counterfeit Batch**.
3. **Demonstrate Expired Medicine Alert (`EXP902`):**
   - Click the **`EXP902 (Expired)`** pill.
   - The system checks the expiry date against current time and displays an **Expired Safety Alert**.
4. **Supply Chain Transfer Walkthrough:**
   - Click **Supply Chain Portal** in the top navigation.
   - Use the **Role Switcher** in the top-right to switch to **Manufacturer (ABC Pharma)**.
   - Click **Create New Batch** (or click **Quick Autofill** $\to$ *Commit Batch to Blockchain*).
   - Click **Transfer Batch** $\to$ Select *Apex Logistics (Distributor)* $\to$ *Execute Blockchain Transfer*.
   - Switch role to **Distributor** $\to$ Transfer to *Metro Wholesalers*.
   - Switch role to **Pharmacy** $\to$ Click **Dispense to Patient**.
   - Return to the Public Verification page and verify your new batch to watch its full live timeline!

---

## 📜 8. Tech Stack Summary

- **Smart Contract:** Solidity `^0.8.20`, Hardhat, EVM, Ethers.js
- **Backend:** Node.js, Express, JWT Authentication, QRCode generator
- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, HTML5-QRCode scanner, Canvas Confetti
- **Architectural Contribution:** Zero-crypto friction for consumers + on-chain cryptographic provenance + multi-tier anti-counterfeit protection.
