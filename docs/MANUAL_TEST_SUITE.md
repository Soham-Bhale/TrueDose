# 🧪 LifeLedger: Comprehensive Manual Test Suite & Test Cases

> **Master End-to-End Verification Guide**  
> *Consortium Proof-of-Authority EVM Network • Retro Java Swing / AWT UI Workstation*  
> *Project: LifeLedger (v2.0.0 Production Release) | Author: Soham Bhale*

---

## 📋 Overview
This document contains the complete manual test suite (**45 test cases across 11 modules**) for testing all features, user roles, smart contract invariants, state transitions, cold-ischemia limits, and anti-trafficking rules in **LifeLedger**.

### How to Run the Environment Before Testing:
1. Open terminal in project root and run:
   ```cmd
   .\run.bat
   ```
   *(Or run `npm run dev`)*
2. Verify browser opens at: `http://localhost:5173`
3. Verify backend responds at: `http://localhost:5000/api/health` (returns `{"status":"online"}`)

---

## 📑 Summary of Test Modules

| Module ID | Test Module Name | Total Cases | Target System Components |
|---|---|:---:|---|
| **MOD-1** | Stakeholder Node & Role Switching | 4 | `Navbar.jsx`, `AuthContext.jsx`, `JComboBox` |
| **MOD-2** | Organ Procurement & Harvest Registration | 6 | `CreateBatchModal.jsx`, `LifeLedger.sol::harvestOrgan` |
| **MOD-3** | Chain-of-Custody Handoffs & Transit | 5 | `TransferModal.jsx`, `LifeLedger.sol::transferCustody` |
| **MOD-4** | National Allocation Clearance (NOTTO) | 4 | `DashboardPage.jsx`, Queue & HLA Matching |
| **MOD-5** | Operating Theater Reception & Implantation | 4 | `DashboardPage.jsx`, `LifeLedger.sol::completeTransplant` |
| **MOD-6** | Organ Provenance & Barcode Inspector | 6 | `VerifyPage.jsx`, `/api/verify/:organId` |
| **MOD-7** | Emergency Regulatory Quarantine Order | 5 | `ReportModal.jsx`, `LifeLedger.sol::quarantineOrgan` |
| **MOD-8** | IoT Cryo-Preservation Telemetry (2°C - 4°C) | 3 | Sensor nodes, thermal breach alerts |
| **MOD-9** | Printable Specimen Tags & Form 8 CIDs | 3 | `QRCodeModal.jsx`, `CertificateModal.jsx`, IPFS |
| **MOD-10** | Consortium PoA Ledger Explorer | 3 | `ExplorerPage.jsx`, validator nodes, block activity |
| **MOD-11** | Negative Invariant & Security Controls | 6 | Logical errors, permission reverts, double-allocation |
| **TOTAL** | **Complete System Test Coverage** | **45 Cases** | **100% Manual Feature Verification** |

---

## 🧪 Detailed Test Cases

### 🏢 Module 1: Stakeholder Node & Role Switching

#### TC-AUTH-01: Switch Active Role via JComboBox Dropdown
* **Objective:** Verify user can switch active consortium node from the top toolbar dropdown.
* **Prerequisites:** App running at `http://localhost:5173`.
* **Test Steps:**
  1. Click the **Active Node** dropdown (`JComboBox`) in the top-right toolbar.
  2. Select **"Organ Procurement Org (OPO)"**.
  3. Verify current active node updates to *Lilavati Trauma Surgical Center & OPO*.
  4. Select **"Medical Transit Logistics"**.
  5. Verify active node updates to *AeroMed Specialized Medical Air & Ground Logistics*.
* **Expected Result:** Header updates to show current node's name, public Ethereum address, and headline.
* **Status:** PASS / FAIL

#### TC-AUTH-02: Switch Role via Workstation Banner Buttons
* **Objective:** Verify role buttons in the top fieldset switch active context instantly.
* **Prerequisites:** On Dashboard page (`/`).
* **Test Steps:**
  1. Click **"Transplant Hospital"** button in the top role simulation bar.
  2. Observe workspace banner and permissions update to Apollo Multi-Specialty Surgical Center.
  3. Click **"Regulatory Admin"** button.
  4. Observe active investigations queue becomes visible.
* **Expected Result:** Selected button receives pressed `.swing-btn-active` style, and role permissions re-render accordingly.
* **Status:** PASS / FAIL

#### TC-AUTH-03: Switch Role via Classic JMenuBar (Stakeholder Menu)
* **Objective:** Verify switching node via top menu bar `Stakeholder Node` dropdown.
* **Test Steps:**
  1. Click **Stakeholder Node** in the classic menu bar.
  2. Select **"Regional Organ Allocation Directorate (NOTTO)"**.
* **Expected Result:** Active role changes to Authority with checkmark indicator next to NOTTO.
* **Status:** PASS / FAIL

#### TC-AUTH-04: Customer / Next-of-Kin Auditor Redirection
* **Objective:** Verify switching to Customer role automatically routes to public verification inspector.
* **Test Steps:**
  1. Click **"Public / Next-of-Kin Auditor"** in the role bar.
* **Expected Result:** Workstation automatically transitions to `/verify` page with read-only inspection access.
* **Status:** PASS / FAIL

---

### 🫀 Module 2: Organ Procurement & Harvest Registration

#### TC-HARV-01: Open Harvest Dialog via JToolBar Button
* **Objective:** Verify the "Harvest Organ" button opens the JDialog harvest modal.
* **Prerequisites:** Any role selected (e.g. OPO, Hospital, Admin).
* **Test Steps:**
  1. Click the green `[+ Harvest Organ]` button on the top toolbar.
* **Expected Result:** JDialog window titled `javax.swing.JDialog: Harvest & Register Donor Organ` pops up smoothly. If user was not in OPO role, app automatically switches them to OPO node.
* **Status:** PASS / FAIL

#### TC-HARV-02: Open Harvest Dialog via File Menu & Keyboard Shortcut
* **Objective:** Verify opening harvest modal via `File -> Harvest Organ Record...` or pressing `Ctrl+H` / `F2`.
* **Test Steps:**
  1. Click `File` in JMenuBar -> select `Harvest Organ Record... (Ctrl+H)`.
  2. Close the dialog.
  3. Press `Ctrl+H` (or `F2`) on the keyboard.
* **Expected Result:** Dialog opens in both cases without errors.
* **Status:** PASS / FAIL

#### TC-HARV-03: Harvest Kidney Specimen with 24h Safe Ischemia Limit
* **Objective:** Verify harvesting a kidney using the preset template.
* **Test Steps:**
  1. Open Harvest Organ dialog.
  2. Click `[Kidney (24h)]` fast template button.
  3. Verify fields populate:
     - Organ ID: `ORG-KID-XXXX`
     - Organ Type: `Kidney (Left)`
     - Blood Group: `O+`
     - Safe Ischemic Limit: `24 hrs`
     - Preservation: `University of Wisconsin (UW) Cold Solution`
     - Temperature: `2.4°C`
  4. Click `[OK - Sign & Register Harvest]`.
* **Expected Result:** Form submits, modal closes, and printable Cryo-Carrier Specimen Tag modal appears with QR barcode. Newly harvested organ appears at the top of the Organ Registry grid in `Harvested` stage.
* **Status:** PASS / FAIL

#### TC-HARV-04: Harvest Emergency Heart Specimen with 4h Safe Ischemia Limit
* **Objective:** Verify harvesting a thoracic heart graft under urgent 4-hour limit.
* **Test Steps:**
  1. Open Harvest Organ dialog.
  2. Click `[Heart (4h Urgent)]` fast template button.
  3. Verify Ischemic Limit is set to `4 hrs` and preservation to `Custodiol HTK Hypothermic Cardioplegia`.
  4. Click `[OK - Sign & Register Harvest]`.
* **Expected Result:** Heart is registered on blockchain; countdown clock displays ~4.0h remaining.
* **Status:** PASS / FAIL

#### TC-HARV-05: Harvest Liver Specimen with 12h Ischemia Limit
* **Objective:** Verify harvesting a whole cadaveric liver graft with 12h limit.
* **Test Steps:**
  1. Open Harvest Organ dialog.
  2. Click `[Liver (12h)]` template button.
  3. Click `[OK - Sign & Register Harvest]`.
* **Expected Result:** Liver is added to the ledger with stage `Harvested` and donor blood group `B+`.
* **Status:** PASS / FAIL

#### TC-HARV-06: Reject Duplicate Organ ID Collision
* **Objective:** Verify system prevents registering an organ ID that already exists.
* **Test Steps:**
  1. Open Harvest Organ dialog.
  2. Manually enter Organ Barcode ID: `ORG-KID-8041` (an existing organ ID).
  3. Click `[OK - Sign & Register Harvest]`.
* **Expected Result:** System rejects creation and displays error banner: `Organ ID 'ORG-KID-8041' already registered on ledger`.
* **Status:** PASS / FAIL

---

### 🚚 Module 3: Chain-of-Custody Handoffs & Transit

#### TC-TRAN-01: Transfer Custody from OPO to Logistics (Air Ambulance)
* **Objective:** Verify OPO transferring custody to AeroMed Logistics.
* **Prerequisites:** Role set to OPO; select an organ in `Harvested` stage.
* **Test Steps:**
  1. Find the harvested organ in the registry grid.
  2. Click the `[Transfer]` (Truck) button on that row.
  3. Verify `TransferModal` opens with organ details pre-loaded.
  4. Select Receiving Entity: `[Medical Transit Logistics] AeroMed Specialized Medical Air & Ground Logistics`.
  5. Check Transfer Point: `Air Ambulance Terminal 1D, Cryo-Bay 4`.
  6. Temperature: `2.4°C`.
  7. Click `[OK - Sign Medical Handoff]`.
* **Expected Result:** Transaction succeeds. Organ stage transitions to `InTransit (CRYO)`. Custodian updates to *AeroMed Specialized Organ Logistics*.
* **Status:** PASS / FAIL

#### TC-TRAN-02: Non-Custodian Transfer Prevention (Unauthorized Handoff)
* **Objective:** Verify a non-custodian cannot transfer an organ held by another entity.
* **Test Steps:**
  1. Switch role to **Transplant Hospital**.
  2. Notice the `[Transfer]` button is hidden or disabled for organs currently held by AeroMed or OPO.
* **Expected Result:** UI restricts transfer action exclusively to the current cryptographic custodian.
* **Status:** PASS / FAIL

#### TC-TRAN-03: Record Live Cryo-Temperature during Transit Checkpoint
* **Objective:** Verify temperature sensor reading is recorded on custody handoff.
* **Test Steps:**
  1. As AeroMed Logistics, open Transfer Modal for an in-transit organ.
  2. Enter temperature `3.1°C` and location `Green Corridor Checkpoint #2 (Highway Expy)`.
  3. Submit handoff to Allocation Authority.
* **Expected Result:** Milestone logs temperature `3.1°C` and shows unbroken seal integrity.
* **Status:** PASS / FAIL

#### TC-TRAN-04: Timeline Audit Record Creation
* **Objective:** Verify that each custody handoff appends a permanent record in the history array.
* **Test Steps:**
  1. Click `[Inspect]` (Eye) on the organ transferred in TC-TRAN-01.
  2. Scroll to `Immutable Chain-of-Custody Ledger`.
* **Expected Result:** Shows sequential milestones: (1) Harvested -> (2) InTransit with Ethereum transaction hash, timestamp, location, and releasing surgeon/carrier notes.
* **Status:** PASS / FAIL

#### TC-TRAN-05: Copy Transaction Hash to Clipboard
* **Objective:** Verify clicking `[Copy]` on any milestone copies the 66-character TxHash.
* **Test Steps:**
  1. In the custody timeline, click `[Copy]` next to `TxHash: 0x89e21...`.
  2. Paste into any text editor.
* **Expected Result:** Button text changes to `Copied` for 2 seconds; clipboard contains valid hex TxHash starting with `0x`.
* **Status:** PASS / FAIL

---

### 🏛️ Module 4: National Allocation Clearance (NOTTO)

#### TC-ALLOC-01: Clearance of Recipient Queue by Allocation Authority
* **Objective:** Verify NOTTO Authority reviewing HLA matching and clearing organ destination.
* **Prerequisites:** Role set to Allocation Authority (`authority`).
* **Test Steps:**
  1. Locate in-transit organ in registry.
  2. Click `[Transfer]`.
  3. Select Receiving Entity: `[Transplant Hospital] Apollo Multi-Specialty Transplant Surgical Center`.
  4. Enter Milestone: `NOTTO National Allocation Clearance — Recipient Prioritization Verified`.
  5. Click `[OK - Sign Medical Handoff]`.
* **Expected Result:** Organ stage advances to `AllocationCleared` (or `HospitalReceived`).
* **Status:** PASS / FAIL

#### TC-ALLOC-02: Verify HLA Histocompatibility Match
* **Objective:** Verify HLA matching markers are displayed in the organ spec card.
* **Test Steps:**
  1. Open Provenance Inspector for `ORG-KID-8041`.
  2. Check `Donor Blood & HLA` panel.
* **Expected Result:** Displays `O+` with `6/6 HLA-Matched (A*02, B*44, DRB1*04)`.
* **Status:** PASS / FAIL

#### TC-ALLOC-03: Allocation Authority Complete Registry View
* **Objective:** Verify Allocation Authority has complete visibility across all consortium organs.
* **Test Steps:**
  1. In Authority role, inspect total count of organs displayed in table.
* **Expected Result:** Authority sees all organs regardless of custodian (Lilavati, AeroMed, Apollo, etc.).
* **Status:** PASS / FAIL

#### TC-ALLOC-04: Filter Organs by Active Stage Tabs
* **Objective:** Verify filter tabs at the top of the grid filter rows properly.
* **Test Steps:**
  1. Click `In Transit (Cryo)`. Verify only in-transit organs display.
  2. Click `Grafted / Transplanted`. Verify only completed transplants display.
  3. Click `Quarantined`. Verify quarantined organs display.
  4. Click `All Records`. Verify all organs display.
* **Expected Result:** Table updates instantly to match selected stage filter.
* **Status:** PASS / FAIL

---

### 🏥 Module 5: Operating Theater Reception & Implantation

#### TC-SURG-01: Hospital Operating Room Organ Reception
* **Objective:** Verify surgical hospital receives organ in OR suite.
* **Prerequisites:** Role set to **Transplant Hospital** (`hospital`).
* **Test Steps:**
  1. Locate an organ transferred to Apollo Hospital.
  2. Verify stage displays `IN SURGICAL SUITE` (`HospitalReceived`).
* **Expected Result:** Row action buttons display `[Implant]` (Heart) and `[Inspect]`.
* **Status:** PASS / FAIL

#### TC-SURG-02: Complete Surgical Implantation (Graft Reperfusion)
* **Objective:** Verify hospital surgeon signs off successful transplant.
* **Test Steps:**
  1. Click `[Implant]` (Heart) button on the organ row.
  2. A prompt asks for OR Confirmation & Anastomosis Reperfusion Notes.
  3. Keep default notes: *"Successful anastomosis completed. Immediate vascular perfusion confirmed in OR 4."*
  4. Click OK.
* **Expected Result:** Browser alert confirms: `SURGICAL IMPLANTATION LOGGED ON BLOCKCHAIN: Organ ORG-XXX grafted into verified recipient`. Organ stage updates permanently to `TRANSPLANTED (GRAFTED)`.
* **Status:** PASS / FAIL

#### TC-SURG-03: Double-Allocation / Re-Transfer Prevention
* **Objective:** Verify transplanted organ cannot be transferred again.
* **Test Steps:**
  1. Locate the transplanted organ in the grid.
  2. Observe action buttons.
* **Expected Result:** `[Transfer]` button is removed. Organ is permanently archived as transplanted.
* **Status:** PASS / FAIL

#### TC-SURG-04: Non-Hospital Transplant Sign-Off Rejection
* **Objective:** Verify non-hospital roles (e.g. Logistics or Customer) cannot sign off transplant.
* **Test Steps:**
  1. Switch role to **Medical Transit Logistics**.
  2. Observe available buttons on rows.
* **Expected Result:** The `[Implant]` button is not rendered for non-hospital stakeholders.
* **Status:** PASS / FAIL

---

### 🔍 Module 6: Organ Provenance & Barcode Inspector

#### TC-VERIF-01: Interrogate Legitimate Organ (`ORG-KID-8041`)
* **Objective:** Verify public interrogation of a valid kidney.
* **Test Steps:**
  1. Navigate to `Provenance` (`/verify`).
  2. Enter or click preset `ORG-KID-8041`.
  3. Click `[Interrogate Ledger]`.
* **Expected Result:** Status badge renders `GENUINE_AUTHENTIC` in green. Confetti animation triggers. Displays donor blood type, remaining ischemia clock, probe temp (2.8°C), and full custody timeline.
* **Status:** PASS / FAIL

#### TC-VERIF-02: Interrogate Critical Heart Specimen (`ORG-HRT-2094`)
* **Objective:** Verify interrogation of emergency heart under active air transit.
* **Test Steps:**
  1. Click preset `ORG-HRT-2094`.
* **Expected Result:** Displays `Heart (Whole)`, Ischemic Limit: `4h safe`, Air Ambulance transit milestone, and Custodiol micro-perfusion protocol.
* **Status:** PASS / FAIL

#### TC-VERIF-03: Interrogate Quarantined Cornea Specimen (`ORG-COR-3390`)
* **Objective:** Verify interrogation of a quarantined organ.
* **Test Steps:**
  1. Click preset `ORG-COR-3390`.
* **Expected Result:** Status badge renders `QUARANTINED` in red. Displays notice: *"Do not transplant. Maintain biosafety quarantine until cleared by NOTTO."*
* **Status:** PASS / FAIL

#### TC-VERIF-04: Interrogate Non-Existent / Counterfeit Organ (`ORG-FAKE-999`)
* **Objective:** Verify system detects unregistered organs and flags counterfeit/trafficking alert.
* **Test Steps:**
  1. Click preset `ORG-FAKE-999` (or type an invalid barcode ID).
  2. Click `[Interrogate Ledger]`.
* **Expected Result:** Screen displays bold red alert: `UNREGISTERED ORGAN / TRAFFICKING ALERT`. Recommends: *"Do not accept or transplant this specimen. Immediately notify NOTTO and hospital legal compliance."* Includes button to report violation.
* **Status:** PASS / FAIL

#### TC-VERIF-05: Real-Time Cold Ischemia Window Countdown Calculation
* **Objective:** Verify dynamic calculation of remaining cold-ischemia hours.
* **Test Steps:**
  1. Interrogate `ORG-KID-8041`.
  2. Examine `Cold Ischemia Clock` pane.
* **Expected Result:** Displays numeric remaining hours (e.g. `19.8h safe window`) and limit (`24h safe`).
* **Status:** PASS / FAIL

#### TC-VERIF-06: Barcode Search Input Trimming & Case Insensitivity
* **Objective:** Verify search handles lowercase and trailing whitespace.
* **Test Steps:**
  1. In the search box, enter `   org-kid-8041   `.
  2. Press Enter or click Interrogate.
* **Expected Result:** Input is auto-uppercased and trimmed; successfully returns `ORG-KID-8041`.
* **Status:** PASS / FAIL

---

### 🚨 Module 7: Emergency Regulatory Quarantine & Anti-Trafficking Alerts

#### TC-QUAR-01: Issue Regulatory Quarantine from Dashboard
* **Objective:** Verify Admin or Authority issuing immediate emergency quarantine.
* **Prerequisites:** Role set to **Regulatory Admin** (`admin`).
* **Test Steps:**
  1. Find an active organ in registry grid.
  2. Click the red `[Hold]` (ShieldAlert) button.
  3. Prompt asks for biosafety violation reason. Keep or enter: *"Thermal sensor breach: Container temp exceeded 8.0°C"*.
  4. Click OK.
* **Expected Result:** Browser alert confirms quarantine issued. Organ stage immediately changes to `QUARANTINED` with red badge.
* **Status:** PASS / FAIL

#### TC-QUAR-02: Quarantine Enforcement (Transfer Blocked)
* **Objective:** Verify quarantined organ cannot be transferred.
* **Test Steps:**
  1. Inspect the row of the newly quarantined organ.
* **Expected Result:** `[Transfer]` button is disabled/hidden. Smart contract rejects any transfer attempt.
* **Status:** PASS / FAIL

#### TC-QUAR-03: Quarantine Enforcement (Implantation Blocked)
* **Objective:** Verify quarantined organ cannot be implanted by surgical hospital.
* **Test Steps:**
  1. Switch role to Transplant Hospital.
  2. Attempt to find the quarantined organ.
* **Expected Result:** Implantation is prohibited on-chain.
* **Status:** PASS / FAIL

#### TC-QUAR-04: File Emergency Whistleblower Incident Report
* **Objective:** Verify submitting an emergency report via ReportModal.
* **Test Steps:**
  1. On VerifyPage, click `[Flag Incident]` (ShieldAlert) button.
  2. Verify `JDialog: Regulatory Incident & Anti-Trafficking Alert` opens.
  3. Select Violation Category: `Cold-Chain Thermal Excursion (> 8°C)`.
  4. Enter facility name: `Apollo ICU Receiving Bay`.
  5. Click `[OK - Dispatch Regulatory Alert]`.
* **Expected Result:** Report registers with unique Case ID (e.g. `REP-XXXX`). A prompt allows immediate transition to Admin Workstation to quarantine the specimen.
* **Status:** PASS / FAIL

#### TC-QUAR-05: Update Investigation Case Status in Regulatory Directorate
* **Objective:** Verify Admin can update investigation status from active queue.
* **Prerequisites:** Role set to Regulatory Admin.
* **Test Steps:**
  1. In the `Active Anti-Trafficking Investigations` panel on Dashboard, locate the case.
  2. Click `[Dispatch Inspector]`. Verify status changes to `INSPECTOR_DISPATCHED`.
  3. Click `[Quarantine Container]`. Verify status changes to `ORGAN_QUARANTINED`.
  4. Click `[Resolve Case]`. Verify case is resolved.
* **Expected Result:** Investigation statuses update in real time without page reload.
* **Status:** PASS / FAIL

---

### 🌡️ Module 8: IoT Cold-Chain Cryo-Preservation Telemetry (2°C - 4°C)

#### TC-IOT-01: Real-Time Telemetry Probe Display
* **Objective:** Verify telemetry panel on VerifyPage renders live sensor readings.
* **Test Steps:**
  1. Interrogate `ORG-KID-8041`.
  2. Inspect `Real-Time Hypothermic Cryo-Preservation IoT Telemetry` fieldset.
* **Expected Result:** Displays:
  - Probe Temp: `2.8°C`
  - Safe Range: `2.0°C - 4.0°C` (green)
  - Seal Integrity: `UNBROKEN` (blue)
  - Continuous Perfusion Flow: `45 mL/min`
* **Status:** PASS / FAIL

#### TC-IOT-02: Sensor Node ID Display
* **Objective:** Verify each organ displays its assigned IoT Cryo-Carrier sensor node ID.
* **Test Steps:**
  1. Inspect the telemetry subtext.
* **Expected Result:** Displays sensor identifier: `Sensor Node ID: IOT-CRYO-8041`.
* **Status:** PASS / FAIL

#### TC-IOT-03: Preservation Protocol Indicator
* **Objective:** Verify specific medical perfusion solution is documented.
* **Test Steps:**
  1. Check protocol line for `ORG-KID-8041` vs `ORG-HRT-2094`.
* **Expected Result:** Displays `Custodiol HTK Hypothermic Perfusion` for kidney and `Celsior Micro-Perfusion Preservation` for heart.
* **Status:** PASS / FAIL

---

### 🏷️ Module 9: Printable Specimen Tags & Form 8 Legal Certificates

#### TC-PRINT-01: Generate Printable Specimen RFID/QR Tag
* **Objective:** Verify QRCodeModal generates high-resolution QR code and printable label.
* **Test Steps:**
  1. In Dashboard, click `[Tag]` (QrCode) on any organ row.
  2. Verify dialog opens with:
     - Warning header: `CRITICAL HUMAN ORGAN SPECIMEN`
     - Organ ID, Blood Group badge (e.g. `O+`), Priority `1A`
     - Scannable QR code image
     - Ischemia window maximum
  3. Click `[Print Carrier Tag]`.
* **Expected Result:** System print preview triggers showing styled shipping tag.
* **Status:** PASS / FAIL

#### TC-PRINT-02: Copy Verification URL to Clipboard
* **Objective:** Verify `[Copy Verify URL]` copies valid web link.
* **Test Steps:**
  1. In QRCodeModal, click `[Copy Verify URL]`.
  2. Paste into browser address bar.
* **Expected Result:** URL is `http://localhost:5173/verify/ORG-KID-8041`. Navigates directly to the organ.
* **Status:** PASS / FAIL

#### TC-PRINT-03: Render Verified Form 8 Deceased Donor Certificate
* **Objective:** Verify CertificateModal displays the statutory legal certificate.
* **Test Steps:**
  1. Click `[Form 8]` on any organ row.
  2. Verify dialog renders official paper certificate:
     - Header: `LEGAL FORM 8 • NOTTO ACCREDITED GRAFT CLEARANCE`
     - Title: `Organ Donor Consent & Clinical Viability Certificate`
     - Neurological Brain-Death: `24-Hour Reflex Test Confirmed`
     - Serology Panel: `HIV, HBV, HCV, Syphilis: ALL NON-REACTIVE`
     - IPFS CID multihash: `QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco`
     - Procuring Surgeon signature and date
* **Expected Result:** Certificate renders authentically with stamp and watermark; print button works.
* **Status:** PASS / FAIL

---

### 🌐 Module 10: Consortium PoA Distributed Ledger Explorer

#### TC-EXPL-01: Interrogate PoA Consortium Validator Nodes
* **Objective:** Verify ExplorerPage displays all approved consortium nodes and validator statuses.
* **Test Steps:**
  1. Navigate to `Consortium` (`/explorer`).
  2. Inspect `Approved Medical Stakeholder Nodes` table.
* **Expected Result:** Lists all 5 consortium nodes (NOTTO Admin, Lilavati OPO, AeroMed Logistics, NOTTO Allocation, Apollo Hospital) with their Ethereum addresses and green `VALIDATOR ONLINE` badges.
* **Status:** PASS / FAIL

#### TC-EXPL-02: Live Block & Network Statistics Cards
* **Objective:** Verify top stats cards display contract address, network name, and organ count.
* **Test Steps:**
  1. Check stats panes at top of ExplorerPage.
* **Expected Result:** Displays:
  - Smart Contract: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (LifeLedger.sol)
  - Consortium Network: `Hardhat / Local EVM (ID: 31337)`
  - PoA Consensus: `Active`
  - Validated Organs count matching registry
* **Status:** PASS / FAIL

#### TC-EXPL-03: Cryptographic Query Audit Log
* **Objective:** Verify verification queries appear in the recent ledger pings table.
* **Test Steps:**
  1. Inspect `Recent Cryptographic Verification Queries & Telemetry Pings` table.
* **Expected Result:** Displays recent verifications with verification ID, organ record, timestamp, device user-agent, and `GENUINE_AUTHENTIC` status.
* **Status:** PASS / FAIL

---

### 🛡️ Module 11: Negative Invariant & Security Controls

#### TC-ERR-01: Prevent Zero Ischemia Limit on Harvest
* **Objective:** Verify smart contract rejects harvest if ischemicLimitHours is 0.
* **Test Steps:**
  1. Open Harvest modal.
  2. Change Ischemic Limit to `0`.
  3. Attempt to submit.
* **Expected Result:** Form validation and smart contract reject input with `Ischemic limit must be greater than zero`.
* **Status:** PASS / FAIL

#### TC-ERR-02: Prevent Transfer to Non-Existent Address
* **Objective:** Verify custody transfer fails if destination address is invalid or empty.
* **Test Steps:**
  1. Attempt custody transfer with blank destination.
* **Expected Result:** Error rejected with `Destination node address 'toAddress' is required`.
* **Status:** PASS / FAIL

#### TC-ERR-03: Application Crash Resilience (ErrorBoundary Verification)
* **Objective:** Verify that simulated exceptions render the retro Java crash dialog instead of a white screen.
* **Test Steps:**
  1. In browser console, trigger an error or load invalid URL parameter.
* **Expected Result:** App displays `java.lang.RuntimeException: Workspace Render Exception` dialog with `[Reload JVM Process]` and `[Return to Organ Registry]` buttons. No blank white screen.
* **Status:** PASS / FAIL

#### TC-ERR-04: Automated Invariant Test Suite Execution (npm test)
* **Objective:** Verify all 41 automated contract & API invariants pass in terminal.
* **Test Steps:**
  1. In terminal, run: `npm test`
* **Expected Result:** Stage 1 (Solidity): 16/16 passed. Stage 2 (API & State Machine): 25/25 passed. 41 total passed in ~6 seconds.
* **Status:** PASS / FAIL

#### TC-ERR-05: JStatusBar Diagnostic Links
* **Objective:** Verify footer links open API health and sample organ JSON.
* **Test Steps:**
  1. Click `[API Health]` link in bottom status bar. Verify opens `{"status":"online"}`.
  2. Click `[REST JSON]` link. Verify opens raw JSON payload for `ORG-KID-8041`.
* **Expected Result:** Both endpoints respond with HTTP 200 and valid JSON.
* **Status:** PASS / FAIL

#### TC-ERR-06: Defense Manual [F1] Modal Accessibility
* **Objective:** Verify pressing F1 opens presentation guide from any page.
* **Test Steps:**
  1. Press F1 (or click `[Defense Guide [F1]]` button).
* **Expected Result:** Opens 4-tab viva defense dialog containing: (1) 1-Minute Live Demo Flow, (2) Why Blockchain vs MongoDB?, (3) Smart Contract Invariants, (4) Consortium Architecture.
* **Status:** PASS / FAIL

---

*LifeLedger Manual Test Suite • 45 Verified Invariants • October 2026 Production Build*


### ⚡ Module 12: Radial Quick-Action Command Wheel

#### TC-WHEEL-01: Toggle Radial Quick-Action Wheel via Tab Key & Q Key
* **Objective:** Verify pressing `Tab` or `Q` anywhere in the app displays the radial command wheel overlay.
* **Test Steps:**
  1. From any screen (Dashboard, Verify, or Explorer), press `Tab` or click `Action Wheel [Tab]` in the top navbar.
  2. Verify circular 8-octant radial HUD opens with darkened backdrop and glassmorphism styling.
  3. Press `Tab` or `Esc` again to close.
  4. Press `Q` (when not typing in a text field). Verify wheel opens again.
* **Expected Result:** Wheel opens and closes instantly with smooth focus trap prevention.
* **Status:** PASS / FAIL

#### TC-WHEEL-02: Floating Quick-Launcher Button Trigger
* **Objective:** Verify mouse users can click the bottom-right `ACTION WHEEL [TAB]` HUD button.
* **Test Steps:**
  1. Click the glowing amber `[ACTION WHEEL [TAB]]` button in bottom-right corner.
  2. Verify radial wheel displays with audio chirp.
* **Expected Result:** Wheel opens centered on screen.
* **Status:** PASS / FAIL

#### TC-WHEEL-03: Radial Angle Mouse Tracking & Slice Selection
* **Objective:** Verify mouse movement dynamically highlights wedges based on circular angle `Math.atan2`.
* **Test Steps:**
  1. Move mouse in a circle around the wheel center.
  2. Verify the corresponding wedge highlights with golden-amber glow and audio tick.
  3. Verify center reticle updates with slot number, role, icon, and action description.
* **Expected Result:** Responsive 360-degree radial tracking selecting slots 1 through 8.
* **Status:** PASS / FAIL

#### TC-WHEEL-04: Numeric Direct Select Keys [1-8]
* **Objective:** Verify pressing keys `1` to `8` directly executes the corresponding action.
* **Test Steps:**
  1. Open wheel with `Tab`.
  2. Press key `7` (Visual Block Chain).
* **Expected Result:** Wheel closes and immediately navigates to `Visual Block Chain` page.
* **Status:** PASS / FAIL

---

### ⛓️ Module 13: Visual Blockchain Architecture & Simulator

#### TC-VIS-01: Cryptographic Block Chaining & Hash Inspection
* **Objective:** Verify sequential blocks link via `currentHash` -> `prevHash`.
* **Test Steps:**
  1. Open `Visual Block Chain` (Shortcut `F5` or click `Visual Block Chain` in toolbar).
  2. Observe Genesis Block (#000), Block #001, Block #002, Block #003.
  3. Hover over Block #001's current hash ribbon.
* **Expected Result:** Block #001's hash and Block #002's previous hash highlight simultaneously with green checkmark: `prevHash Match verified`.
* **Status:** PASS / FAIL

#### TC-VIS-02: Data Tamper & Cryptographic Avalanche Simulation
* **Objective:** Verify altering data in Block #1 breaks subsequent block hashes and triggers consensus rejection.
* **Test Steps:**
  1. On Block #001, click `[Simulate Data Tamper]`.
  2. Observe Block #001 recalculates hash via real Web Crypto SHA-256.
  3. Observe link connector turns bright red with `CRYPTOGRAPHIC LINK BROKEN! Hash mismatch rejected by PoA Consensus`.
  4. Observe subsequent blocks show `CONSENSUS REJECTED`.
  5. Click `[Restore Blockchain Integrity]`.
* **Expected Result:** Ledger restores to clean, cryptographically valid state.
* **Status:** PASS / FAIL

#### TC-VIS-03: Interactive PoA Block Minting Simulator
* **Objective:** Verify bundling Mempool transactions into a brand-new mined block.
* **Test Steps:**
  1. Switch to `Mint Next Block` tab.
  2. Review 3 pending transactions in Mempool queue.
  3. Click `[Mint Block #4 (PoA Consensus)]`.
  4. Watch 4-stage animation: (1) Bundling, (2) Merkle tree calculation, (3) Multi-node PoA signatures, (4) SHA-256 chaining.
* **Expected Result:** Progress bar animates to 100%, confetti triggers, and new Block #004 is appended to the chain.
* **Status:** PASS / FAIL

#### TC-VIS-04: Proof-of-Authority Consortium Node Topology
* **Objective:** Verify inspection of the 4 authorized stakeholder validator nodes.
* **Test Steps:**
  1. Switch to `Validator Nodes (PoA)` tab.
  2. Inspect Lilavati OPO, AeroMed Transit, NOTTO Central, and Apollo Hospital nodes.
* **Expected Result:** Displays public Ethereum addresses, 25% consensus weights, and live peer latency (~14ms).
* **Status:** PASS / FAIL

#### TC-VIS-05: Simplified Organ Preservation & Safety Status
* **Objective:** Verify organ details show simple, clean preservation status instead of complex IoT probe jargon.
* **Test Steps:**
  1. Open `Organ Verification Inspector` (Shortcut `F3`).
  2. Query `ORG-KID-8041`.
  3. Inspect `Organ Storage & Preservation Condition` card.
* **Expected Result:** Displays clean: Current Temp `2.8°C (Normal)`, Safe Time Left `19.2h (Active Window)`, Container Seal `INTACT (Tamper-Proof)`. No complex sensor probe telemetry clutter.
* **Status:** PASS / FAIL
