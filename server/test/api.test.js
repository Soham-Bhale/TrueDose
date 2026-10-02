/**
 * TrueDose Backend API & Supply Chain State Machine Automated Test Suite
 * Tests all logical errors, authentication guards, role transitions,
 * counterfeit detections, and citizen incident reports.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Color helpers for terminal output
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Load express app
process.env.PORT = String(TEST_PORT);
const express = require('express');
const cors = require('cors');
const store = require('../src/services/store');
const blockchain = require('../src/services/blockchain');

const authRoutes = require('../src/routes/auth');
const batchRoutes = require('../src/routes/batches');
const verifyRoutes = require('../src/routes/verify');
const statsRoutes = require('../src/routes/stats');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/stats', statsRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'online' }));

let server;

// Helper to make HTTP requests
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const response = await fetch(url, fetchOptions);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return {
    status: response.status,
    headers: response.headers,
    body: data
  };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    failedCount++;
    console.log(`  ${red('✗')} ${message}`);
    throw new Error(message);
  } else {
    passedCount++;
    console.log(`  ${green('✓')} ${message}`);
  }
}

async function runTestSuite() {
  console.log(`\n${bold(cyan('========================================================================'))}`);
  console.log(`${bold(cyan('🧪 TrueDose Comprehensive Automated API & Logical Error Test Suite'))}`);
  console.log(`${bold(cyan('========================================================================'))}\n`);

  // Start server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`🚀 In-Memory Test Server running on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    console.log(`${bold(yellow('SECTION 1: System Health & Authentication Guards'))}`);
    // -------------------------------------------------------------

    // Test 1: Health Check
    let res = await request('/api/health');
    assert(res.status === 200 && res.body.status === 'online', 'Health endpoint returns 200 Online');

    // Test 2: Valid Login
    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'manufacturer@abcpharma.com', password: 'pharma123' }
    });
    assert(res.status === 200 && res.body.token, 'Manufacturer login returns valid JWT token and user profile');
    const manufacturerToken = res.body.token;

    // Test 3: LOGICAL ERROR - Login with wrong password
    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'manufacturer@abcpharma.com', password: 'WRONG_PASSWORD_XYZ' }
    });
    assert(res.status === 401, 'LOGICAL ERROR: Incorrect password rejected with 401 Unauthorized');

    // Test 4: LOGICAL ERROR - Login with nonexistent account
    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'hacker@malicious.com', password: 'password123' }
    });
    assert(res.status === 401, 'LOGICAL ERROR: Nonexistent user email rejected with 401 Unauthorized');

    // Test 5: Participants directory
    res = await request('/api/auth/participants');
    assert(res.status === 200 && res.body.participants.length >= 5, 'Consortium directory returns all approved participants');

    // -------------------------------------------------------------
    console.log(`\n${bold(yellow('SECTION 2: Batch Creation Invariants & Input Validation'))}`);
    // -------------------------------------------------------------

    const uniqueId = "TEST_" + Math.floor(Math.random() * 100000);

    // Test 6: Happy Path - Create Batch as Manufacturer
    res = await request('/api/batches', {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: {
        batchId: uniqueId,
        medicineName: 'Azithromycin Test',
        dosage: '500 mg',
        quantity: 3000,
        manufacturingDate: '2026-09-01',
        expiryDate: '2028-08-31',
        notes: 'QA Passed'
      }
    });
    assert(res.status === 201 && res.body.batch.batchId === uniqueId, 'Manufacturer creates valid batch with 201 Created and blockchain TxHash');

    // Test 7: LOGICAL ERROR - Missing required fields
    res = await request('/api/batches', {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: {
        batchId: 'INCOMPLETE_BATCH'
        // Missing medicineName, quantity, dates
      }
    });
    assert(res.status === 400, 'LOGICAL ERROR: Missing required fields rejected with 400 Bad Request');

    // Test 8: LOGICAL ERROR - Duplicate Batch ID collision
    res = await request('/api/batches', {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: {
        batchId: uniqueId, // Duplicate
        medicineName: 'Azithromycin Clone',
        dosage: '500 mg',
        quantity: 1000,
        manufacturingDate: '2026-09-01',
        expiryDate: '2028-08-31'
      }
    });
    assert(res.status === 409, 'LOGICAL ERROR: Duplicate Batch ID rejected with 409 Conflict');

    // Test 9: LOGICAL ERROR - Unauthorized role (e.g. Pharmacy) attempting to mint genesis batch
    res = await request('/api/batches', {
      method: 'POST',
      headers: { 'x-demo-role': 'pharmacy' },
      body: {
        batchId: 'PHARM_ILLEGAL_MINT',
        medicineName: 'Illegal Paracetamol',
        dosage: '500 mg',
        quantity: 500,
        manufacturingDate: '2026-09-01',
        expiryDate: '2028-08-31'
      }
    });
    assert(res.status === 403, 'LOGICAL ERROR: Non-manufacturer attempting to create batch rejected with 403 Forbidden');

    // -------------------------------------------------------------
    console.log(`\n${bold(yellow('SECTION 3: Supply Chain Transfer State Machine Rules'))}`);
    // -------------------------------------------------------------

    // Addresses from consortium
    const distAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    const wholeAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
    const pharmAddress = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

    // Test 10: LOGICAL ERROR - Transfer nonexistent batch
    res = await request('/api/batches/NONEXISTENT_999/transfer', {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: { toAddress: distAddress, notes: 'Invalid' }
    });
    assert(res.status === 404, 'LOGICAL ERROR: Transfer of nonexistent batch returns 404 Not Found');

    // Test 11: LOGICAL ERROR - Transfer without recipient address
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: { notes: 'Missing recipient' }
    });
    assert(res.status === 400, 'LOGICAL ERROR: Missing recipient address rejected with 400 Bad Request');

    // Test 12: LOGICAL ERROR - Non-owner attempts to transfer
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'distributor' }, // Distributor does not own it yet
      body: { toAddress: wholeAddress, notes: 'Unauthorized transfer attempt' }
    });
    assert(res.status === 403, 'LOGICAL ERROR: Non-owner attempting transfer rejected with 403 Forbidden');

    // Test 13: LOGICAL ERROR - Illegal sequence jump (Mfg trying to transfer directly to Pharmacy)
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: { toAddress: pharmAddress, notes: 'Illegal skip distributor' }
    });
    assert(res.status === 400, 'LOGICAL ERROR: Skipping Distributor (Manufacturer -> Pharmacy) rejected with 400 Rule Violation');

    // Test 14: Valid Step 1: Manufacturer -> Distributor
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'manufacturer' },
      body: { toAddress: distAddress, notes: 'Cold-chain Reefer #TC-402' }
    });
    assert(res.status === 200 && res.body.batch.stage === 'DistributorReceived', 'Step 1: Manufacturer successfully transfers to Distributor (Stage: DistributorReceived)');

    // Test 15: Valid Step 2: Distributor -> Wholesaler
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'distributor' },
      body: { toAddress: wholeAddress, notes: 'Regional warehouse dispatch' }
    });
    assert(res.status === 200 && res.body.batch.stage === 'WholesalerReceived', 'Step 2: Distributor successfully transfers to Wholesaler (Stage: WholesalerReceived)');

    // Test 16: Valid Step 3: Wholesaler -> Pharmacy
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'wholesaler' },
      body: { toAddress: pharmAddress, notes: 'Retail pharmacy delivery' }
    });
    assert(res.status === 200 && res.body.batch.stage === 'PharmacyReceived', 'Step 3: Wholesaler successfully transfers to Pharmacy (Stage: PharmacyReceived)');

    // -------------------------------------------------------------
    console.log(`\n${bold(yellow('SECTION 4: Dispensing to Customer & Pharmacy Sale Guards'))}`);
    // -------------------------------------------------------------

    // Test 17: LOGICAL ERROR - Non-pharmacy attempts to dispense
    res = await request(`/api/batches/${uniqueId}/sell`, {
      method: 'POST',
      headers: { 'x-demo-role': 'distributor' },
      body: { notes: 'Distributor trying to sell directly' }
    });
    assert(res.status === 403, 'LOGICAL ERROR: Non-pharmacy role attempting to sell rejected with 403 Forbidden');

    // Test 18: Valid Dispensing: Pharmacy marks as sold
    res = await request(`/api/batches/${uniqueId}/sell`, {
      method: 'POST',
      headers: { 'x-demo-role': 'pharmacy' },
      body: { notes: 'Dispensed to patient against prescription #RX-8801' }
    });
    assert(res.status === 200 && res.body.batch.stage === 'SoldToCustomer', 'Pharmacy dispenses batch to customer (Stage: SoldToCustomer, Verified on-chain)');

    // -------------------------------------------------------------
    console.log(`\n${bold(yellow('SECTION 5: Emergency Recall & Counterfeit Prevention'))}`);
    // -------------------------------------------------------------

    // Test 19: Emergency Recall by Admin
    res = await request(`/api/batches/${uniqueId}/recall`, {
      method: 'POST',
      headers: { 'x-demo-role': 'admin' },
      body: { reason: 'Quarantine order: Analytical impurity discovered' }
    });
    assert(res.status === 200 && res.body.batch.isRecalled === true, 'Admin successfully issues emergency recall (isRecalled: true, Stage: Recalled)');

    // Test 20: LOGICAL ERROR - Transferring a recalled batch must be rejected
    res = await request(`/api/batches/${uniqueId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'admin' },
      body: { toAddress: distAddress, notes: 'Attempting to move recalled batch' }
    });
    assert(res.status === 400 || res.status === 500, 'LOGICAL ERROR: Attempting to transfer recalled batch rejected');

    // Test 21: LOGICAL ERROR - Transferring an expired batch must be rejected
    res = await request(`/api/batches/EXP902/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'pharmacy' },
      body: { toAddress: distAddress, notes: 'Attempting to move expired medicine' }
    });
    assert(res.status === 400, 'LOGICAL ERROR: Attempting to transfer expired medicine rejected with 400');

    // -------------------------------------------------------------
    console.log(`\n${bold(yellow('SECTION 6: Public Verification & Anti-Counterfeit Endpoint'))}`);
    // -------------------------------------------------------------

    // Test 22: Valid Genuine Batch (PCM001)
    res = await request('/api/verify/PCM001');
    assert(res.status === 200 && res.body.exists === true && res.body.status === 'GENUINE_AUTHENTIC', 'Public verification of PCM001 returns 200 GENUINE_AUTHENTIC with blockchain proof');
    assert(res.body.qualityCertificate?.ipfsCID, 'Verification includes IPFS Quality Certificate CID');
    assert(res.body.telemetry?.temperatureStatus, 'Verification includes IoT Cold-Chain Telemetry');

    // Test 23: Expired Batch Detection (EXP902)
    res = await request('/api/verify/EXP902');
    assert(res.status === 200 && res.body.isExpired === true && res.body.status === 'EXPIRED', 'Public verification of EXP902 detects expired date and returns status: EXPIRED');

    // Test 24: Fake / Counterfeit Batch Detection (FAKE999)
    res = await request('/api/verify/FAKE999');
    assert(res.status === 404 && res.body.status === 'COUNTERFEIT_ALERT', 'Public verification of FAKE999 detects missing on-chain record and returns 404 COUNTERFEIT_ALERT');

    // -------------------------------------------------------------
    console.log(`\n${bold(yellow('SECTION 7: Citizen Incident Reporting & Regulatory Alerts'))}`);
    // -------------------------------------------------------------

    // Test 25: Submit Citizen Incident Report
    res = await request('/api/verify/report', {
      method: 'POST',
      body: {
        batchId: 'FAKE999',
        medicineName: 'Suspected Counterfeit Batch',
        storeName: 'Quick Meds Chemist',
        location: 'MG Road, Pune',
        description: 'Packaging QR failed on-chain check. Hologram was missing.',
        reporterContact: 'alert-citizen@gmail.com'
      }
    });
    assert(res.status === 201 && res.body.reportId.startsWith('REP-'), 'Citizen submits counterfeit report with 201 Created and case ID');
    const filedReportId = res.body.reportId;

    // Test 26: Regulator Dashboard Stats includes filed report
    res = await request('/api/stats');
    const foundReport = res.body.investigations?.find(r => r.id === filedReportId);
    assert(res.status === 200 && foundReport, 'Regulatory dashboard receives citizen alert in real-time');

    // Test 27: Regulator Dispatches Inspector (Status Update)
    res = await request(`/api/stats/reports/${filedReportId}`, {
      method: 'PATCH',
      body: { status: 'INSPECTOR_ON_SITE' }
    });
    assert(res.status === 200 && res.body.report.status === 'INSPECTOR_ON_SITE', 'Regulator updates investigation status to INSPECTOR_ON_SITE');

    // -------------------------------------------------------------
    console.log(`\n${bold(cyan('========================================================================'))}`);
    console.log(`${bold(green(`🎉 All ${passedCount} Automated Test Invariants Passed Successfully! (0 Failures)`))}`);
    console.log(`${bold(cyan('========================================================================'))}\n`);

  } catch (err) {
    console.error(`\n${bold(red(`❌ Test Suite Encountered Failure:`))} ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTestSuite();
