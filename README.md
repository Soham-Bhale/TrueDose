# 🫀 LifeLedger — Decentralized Organ Procurement & Transplant Custody Network

> **An enterprise blockchain network built for Organ Procurement Organizations (OPOs), specialized cold-chain air-ambulances, national allocation clearinghouses (NOTTO/UNOS), and surgical transplant centers. Enforces non-repudiable donor consent, real-time cold-ischemia telemetry, and anti-trafficking rules with an authentic retro Java Swing desktop workstation interface.**

---

### 📑 Official System Documentation & Engineering Report
* 📄 **[Download Complete System Architecture & UI Specification Report (PDF)](LifeLedger_System_Architecture_and_UI_Specification_Report.pdf)** *(12-Page Exhaustive Engineering PDF with 3D Visual UI Button Directory & Wireframes)*
* 📖 **[Read Online UI Specification & Button Directory](docs/UI_AND_WORKFLOW_SPECIFICATION.md)** *(Exhaustive button-by-button operational manual)*
* 🧪 **[Comprehensive Manual Test Suite & Test Cases (45 Cases)](docs/MANUAL_TEST_SUITE.md)** *(Detailed step-by-step instructions for manual testing across 11 modules)*
* 🏛️ **[System Architecture Diagram](docs/diagram_architecture.png)**
* 🔄 **[Organ Custody Lifecycle Workflow Diagram](docs/diagram_workflow.png)**
* 🔘 **[Visual UI Button & Control Directory Showcase](docs/diagram_ui_buttons_showcase.png)**
* 📐 **[Workstation Screen Layout Wireframes](docs/diagram_ui_screens_wireframe.png)**

---

## 📌 1. Domain Problem Statement

Every year, thousands of donor organs (Kidneys, Hearts, Livers, Lungs, Corneas) are lost or compromised due to supply-chain failures and lack of trust between independent medical entities:
$$\text{OPO Harvest} \longrightarrow \text{Air-Ambulance Logistics} \longrightarrow \text{Allocation Clearance} \longrightarrow \text{Hospital Surgical Suite} \longrightarrow \text{Transplantation}$$

### Critical Vulnerabilities in Traditional Centralized Systems:
- **Zero-Trust Multi-Stakeholder Ecosystem:** OPOs, private airlines, state traffic police (green corridors), competing hospital networks, and national regulators do not trust each other's centralized databases.
- **Cold-Ischemia Window Expiration:** Donor organs suffer irreversibly from cellular death after harvest:
  - *Heart:* $\le$ 4 hours (STAT Emergency)
  - *Lung:* $\le$ 8 hours
  - *Liver:* $\le$ 12 hours
  - *Kidney:* $\le$ 24–30 hours
  - *Cornea:* $\le$ 48 hours
- **Black-Market Organ Trafficking & Paper Forgery:** Illicit organs or falsified donor consent documents (e.g., Form 8 brain-death certificates) infiltrate commercial hospitals without cryptographic verification.
- **Thermal Excursions:** Failure of hypothermic perfusion canisters ($> 8^\circ\text{C}$) during transport often goes unnoticed until graft rejection occurs in the operating theater.

---

## 💡 2. Solution: The LifeLedger Consortium Architecture

LifeLedger enforces immutable provenance, cold-ischemia tracking, and anti-trafficking rules via a Proof-of-Authority (PoA) Ethereum Virtual Machine (EVM) smart contract paired with an authentic Java Swing / AWT retro medical desktop interface.

```
                    [ DECEASED DONOR FORM 8 CONSENT ]
                                  │
                                  ▼
                   [ OPO HARVEST: LifeLedger.sol ]
              (Locks Donor Hash, Blood Group & Ischemia Timer)
                                  │
                                  ▼
                  [ CRYO-LOGISTICS AIR-AMBULANCE ]
               (Real-Time IoT Temperature: 2°C - 4°C)
                                  │
                                  ▼
                 [ NATIONAL ALLOCATION CLEARINGHOUSE ]
               (HLA Matching & Queue Integrity Clearance)
                                  │
                                  ▼
                  [ HOSPITAL SURGICAL THEATER (OR) ]
             (Implantation Sign-Off / Reperfusion Verified)
```

---

## 🖥️ 3. Authentic Retro Java Swing / AWT User Interface

The web interface is intentionally styled after classic enterprise medical Java desktop software (Swing Look & Feel / Windows Classic):
- **`JMenuBar`:** File, View, Nodes, Help with keyboard access mnemonics (`Alt+F`, `Alt+H`).
- **`JToolBar`:** Beveled 3D buttons (`swing-raised` & `swing-sunken`), quick preset switchers, and active consortium node switcher (`JComboBox`).
- **`JTable` Grid:** Compact table rows, `#0A246A` selected row highlights, column headers, and live stage badges.
- **`JDialog` Modals:** Raised window title bars with standard close buttons (`[X]`), titled borders (`fieldset`/`legend`), and prompt action bars.
- **`JStatusBar`:** Bottom status strip reporting PoA node health, connected contract address, and JVM heap simulation (`48MB / 128MB`).

---

## 🛡️ 4. Smart Contract Enforced Invariants (`LifeLedger.sol`)

1. **Role-Gated Organ Harvest:** Only registered `OPO_ROLE` accounts can record an organ harvest.
2. **Cold Ischemia Safeguards:** Organ registration strictly requires non-zero `ischemicLimitHours`.
3. **Medical Chain-of-Custody:** Only the current verified custodian can execute `transferCustody()`.
4. **Surgical Implantation Guard:** Only authorized `HOSPITAL_ROLE` surgeons can execute `completeTransplant()`.
5. **Consortium Anti-Trafficking Freeze:** Any authorized regulatory node (`ADMIN_ROLE` or `AUTHORITY_ROLE`) can instantly place an organ under emergency quarantine, blocking all downstream transfers and surgical procedures consortium-wide.
6. **Double-Allocation Prevention:** A transplanted organ cannot be transferred again or duplicated.

---

## 🧪 5. Automated Testing & Verification Suite

LifeLedger includes a comprehensive master automated test suite verifying **41 critical invariants**:

| Test Stage | Invariants | Description |
|---|:---:|---|
| **Stage 1: Hardhat Solidity Invariants** | **16/16 Passed** | Role authorization, zero-address guards, custody transfer reverts, emergency quarantine, counterfeit detection |
| **Stage 2: Express REST & State Machine** | **25/25 Passed** | Auth tokens, harvest validation, cold-ischemia telemetry, donor consent CID proof, trafficking alert dispatch |
| **Total Automated Invariants** | **41/41 Passed** | **100% Invariant Verification (0 Failures)** |

Run the entire suite with one command:
```bash
npm test
```

---

## 🚀 6. Quick Start & Launch

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Option A: One-Click Windows Batch File
Double-click or run:
```cmd
run.bat
```
*Checks dependencies, compiles contracts, deploys the local PoA EVM network, runs the 41-invariant automated audit, and opens both the backend API and frontend workstation.*

### Option B: Manual Setup
```bash
# 1. Install root dependencies
npm install

# 2. Deploy smart contract & export ABIs
npm run deploy:contracts

# 3. Run master automated audit
npm test

# 4. Start backend and client concurrently
npm run dev
```

- **Frontend Workstation:** `http://localhost:5173`
- **Backend REST API:** `http://localhost:5000`
- **API Health Check:** `http://localhost:5000/api/health`
- **Sample Organ JSON:** `http://localhost:5000/api/verify/ORG-KID-8041`

---

## 👥 7. Consortium Stakeholders (Demo Accounts)

| Node Entity | Role | Ethereum Address | Responsibilities |
|---|---|---|---|
| **NOTTO / UNOS** | `admin` | `0xf39Fd6...` | Regulatory oversight, national anti-trafficking enforcement, emergency quarantine |
| **Lilavati Trauma OPO** | `opo` | `0x709979...` | Organ harvest, Form 8 donor consent verification, cold-ischemia lock |
| **AeroMed Air-Ambulance** | `logistics` | `0x3C44Cd...` | Green-corridor flight, cryo-carrier telemetry (2°C - 4°C), transit handoff |
| **Regional Allocation Directorate** | `authority` | `0x90F79b...` | Recipient queue prioritization, HLA compatibility clearance |
| **Apollo Transplant Hospital** | `hospital` | `0x15d34A...` | Surgical suite reception, OR implantation sign-off, reperfusion confirmation |
| **Public / Next-of-Kin Auditor** | `customer` | — | Independent QR code inspection and donor consent proof |

---

## 📄 License
This project is open-source under the MIT License.
