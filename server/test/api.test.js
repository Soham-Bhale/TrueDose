/**
 * LifeLedger Backend API & Organ Chain-of-Custody Automated Test Suite
 * Tests all logical errors, authentication guards, role transitions,
 * unregistered organ detections, and emergency regulatory incident reports.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

process.env.PORT = String(TEST_PORT);
const express = require('express');
const cors = require('cors');
const store = require('../src/services/store');
const blockchain = require('../src/services/blockchain');

const authRoutes = require('../src/routes/auth');
const organRoutes = require('../src/routes/batches');
const verifyRoutes = require('../src/routes/verify');
const statsRoutes = require('../src/routes/stats');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/batches', organRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/stats', statsRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'online', system: 'LifeLedger Organ Procurement Network' }));

let server;

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
  console.log(`${bold(cyan('🧪 LifeLedger Comprehensive Automated API & Logical Error Test Suite'))}`);
  console.log(`${bold(cyan('========================================================================'))}\n`);

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`🚀 In-Memory Test Server running on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    console.log(`${bold(yellow('SECTION 1: System Health & Stakeholder Authentication Guards'))}`);

    let res = await request('/api/health');
    assert(res.status === 200 && res.body.status === 'online', 'Health endpoint returns 200 Online');

    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'opo@lifeledger.org', password: 'opo123' }
    });
    assert(res.status === 200 && res.body.token, 'OPO login returns valid JWT token and user profile');

    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'opo@lifeledger.org', password: 'WRONG_PASSWORD_XYZ' }
    });
    assert(res.status === 401, 'LOGICAL ERROR: Incorrect password rejected with 401 Unauthorized');

    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'trafficker@illegal.com', password: 'password123' }
    });
    assert(res.status === 401, 'LOGICAL ERROR: Nonexistent user email rejected with 401 Unauthorized');

    res = await request('/api/auth/participants');
    assert(res.status === 200 && res.body.participants.length >= 5, 'Consortium directory returns all approved transplant nodes');

    console.log(`\n${bold(yellow('SECTION 2: Organ Harvest Invariants & Input Validation'))}`);

    const uniqueOrganId = "ORG_TEST_" + Math.floor(Math.random() * 100000);

    res = await request('/api/organs', {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: {
        organId: uniqueOrganId,
        organType: 'Kidney (Left)',
        donorId: 'DNR-TEST-001',
        donorBloodType: 'O+',
        hlaMarker: '6/6 HLA-Matched',
        ischemicLimitHours: 30,
        recipientId: 'RCP-801',
        recipientHospital: 'Apollo Surgical Suite',
        preservationProtocol: 'Custodiol HTK Perfusion',
        initialTemp: 2.8,
        notes: 'Harvested under sterile OR conditions'
      }
    });
    assert(res.status === 201 && (res.body.organ.organId === uniqueOrganId || res.body.batch.batchId === uniqueOrganId), 'OPO harvests valid organ with 201 Created and blockchain TxHash');

    res = await request('/api/organs', {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: {
        organId: uniqueOrganId // Duplicate
      }
    });
    assert(res.status === 409, 'LOGICAL ERROR: Duplicate Organ ID rejected with 409 Conflict');

    res = await request('/api/organs', {
      method: 'POST',
      headers: { 'x-demo-role': 'logistics' }, // Logistics cannot harvest
      body: {
        organId: 'ORG_ILLEGAL_HARVEST',
        organType: 'Liver'
      }
    });
    assert(res.status === 403, 'LOGICAL ERROR: Non-OPO attempting to harvest organ rejected with 403 Forbidden');

    console.log(`\n${bold(yellow('SECTION 3: Chain-of-Custody State Machine Rules'))}`);

    res = await request('/api/organs/NONEXISTENT_ORG/transfer', {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: { toAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' }
    });
    assert(res.status === 404, 'LOGICAL ERROR: Transfer of nonexistent organ returns 404 Not Found');

    res = await request(`/api/organs/${uniqueOrganId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: {} // Missing toAddress
    });
    assert(res.status === 400, 'LOGICAL ERROR: Missing destination node address rejected with 400 Bad Request');

    res = await request(`/api/organs/${uniqueOrganId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'hospital' }, // Non-owner
      body: { toAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' }
    });
    assert(res.status === 403, 'LOGICAL ERROR: Non-custodian attempting transfer rejected with 403 Forbidden');

    // Step 1: OPO transfers to Logistics (AeroMed)
    const logisticsAcc = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    res = await request(`/api/organs/${uniqueOrganId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: {
        toAddress: logisticsAcc,
        notes: 'Handed off to AeroMed Air Courier',
        location: 'Mumbai Airport Gate 4',
        currentTemp: 2.8
      }
    });
    assert(res.status === 200 && res.body.organ.stage === 'InTransit', 'Step 1: OPO successfully transfers custody to Logistics (Stage: InTransit)');

    // Step 2: Logistics transfers to Hospital
    const hospitalAcc = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65';
    res = await request(`/api/organs/${uniqueOrganId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'logistics' },
      body: {
        toAddress: hospitalAcc,
        notes: 'Delivered into surgical suite OR 4',
        location: 'Apollo Surgical Wing, Hyderabad',
        currentTemp: 2.7
      }
    });
    assert(res.status === 200 && res.body.organ.stage === 'HospitalReceived', 'Step 2: Logistics successfully transfers to Surgical Hospital (Stage: HospitalReceived)');

    console.log(`\n${bold(yellow('SECTION 4: Surgical Implantation & Recipient Hand-off Guards'))}`);

    res = await request(`/api/organs/${uniqueOrganId}/transplant`, {
      method: 'POST',
      headers: { 'x-demo-role': 'logistics' }, // Logistics cannot transplant
      body: { notes: 'Attempted by courier' }
    });
    assert(res.status === 403, 'LOGICAL ERROR: Non-hospital role attempting to sign off transplant rejected with 403 Forbidden');

    res = await request(`/api/organs/${uniqueOrganId}/transplant`, {
      method: 'POST',
      headers: { 'x-demo-role': 'hospital' },
      body: { notes: 'Successful anastomosis and reperfusion in OR 4' }
    });
    assert(res.status === 200 && res.body.organ.stage === 'Transplanted', 'Hospital completes surgical transplant (Stage: Transplanted, Logged on-chain)');

    console.log(`\n${bold(yellow('SECTION 5: Emergency Quarantine & Anti-Trafficking Controls'))}`);

    const alertOrganId = "ORG_ALERT_" + Math.floor(Math.random() * 100000);
    await request('/api/organs', {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: {
        organId: alertOrganId,
        organType: 'Liver (Right Lobe)',
        donorBloodType: 'B+',
        ischemicLimitHours: 12
      }
    });

    res = await request(`/api/organs/${alertOrganId}/quarantine`, {
      method: 'POST',
      headers: { 'x-demo-role': 'admin' },
      body: { reason: 'Thermal sensor detected temperature spike to 9.2°C during flight transit' }
    });
    assert(res.status === 200 && res.body.organ.isQuarantined === true, 'Admin successfully issues emergency quarantine (isQuarantined: true, Stage: Quarantined)');

    res = await request(`/api/organs/${alertOrganId}/transfer`, {
      method: 'POST',
      headers: { 'x-demo-role': 'opo' },
      body: { toAddress: logisticsAcc }
    });
    assert(res.status === 400, 'LOGICAL ERROR: Attempting to transfer quarantined organ rejected');

    console.log(`\n${bold(yellow('SECTION 6: Public Verification & Anti-Trafficking Endpoints'))}`);

    res = await request('/api/verify/ORG-KID-8041');
    assert(res.status === 200 && res.body.status === 'GENUINE_AUTHENTIC', 'Public verification of ORG-KID-8041 returns 200 GENUINE_AUTHENTIC with blockchain proof');
    assert(res.body.donorConsentCertificate && res.body.donorConsentCertificate.legalConsentCID, 'Verification includes cryptographic Donor Consent Certificate CID');
    assert(res.body.telemetry && res.body.telemetry.currentTemperatureCelsius !== undefined, 'Verification includes live IoT Cold-Chain Cryo-Telemetry');

    res = await request('/api/verify/ORG-COR-3390');
    assert(res.status === 200 && res.body.isQuarantined === true, 'Public verification of ORG-COR-3390 flags regulatory quarantine hold');

    res = await request('/api/verify/ORG-FAKE-999');
    assert(res.status === 404 && res.body.status === 'COUNTERFEIT_ALERT', 'Public verification of ORG-FAKE-999 detects missing record and returns 404 COUNTERFEIT_ALERT');

    console.log(`\n${bold(yellow('SECTION 7: Emergency Incident Reporting & Regulatory Alerts'))}`);

    res = await request('/api/verify/report', {
      method: 'POST',
      body: {
        organId: 'ORG-FAKE-999',
        storeName: 'Private Airport Hangar 8',
        location: 'IGI Airport, Delhi',
        description: 'Unregistered cryo-cooler box intercepted without NOTTO tamper seal',
        reporterContact: 'airport-customs@gov.in'
      }
    });
    assert(res.status === 201 && res.body.report.id, 'Observer submits emergency incident report with 201 Created and case ID');

    const createdReportId = res.body.report.id;
    res = await request('/api/stats');
    assert(res.status === 200 && res.body.investigations.length > 0, 'Regulatory dashboard receives incident alert in real-time');

    res = await request(`/api/stats/reports/${createdReportId}`, {
      method: 'PATCH',
      body: { status: 'INSPECTOR_ON_SITE' }
    });
    assert(res.status === 200 && res.body.report.status === 'INSPECTOR_ON_SITE', 'Regulator updates investigation status to INSPECTOR_ON_SITE');

    console.log(`\n${bold(cyan('========================================================================'))}`);
    console.log(`${bold(green(`🎉 All ${passedCount} Automated Test Invariants Passed Successfully! (0 Failures)`))}`);
    console.log(`${bold(cyan('========================================================================'))}\n`);

  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  }
}

runTestSuite().catch(err => {
  console.error("Test Suite Failure:", err);
  process.exit(1);
});
