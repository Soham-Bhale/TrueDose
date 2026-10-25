const express = require('express');
const router = express.Router();
const store = require('../services/store');
const blockchain = require('../services/blockchain');

// GET /api/stats
router.get('/', (req, res) => {
  const organs = store.getOrgans();
  const users = store.getUsers();
  const verifications = store.getVerifications();
  const reports = store.getReports();
  const contractConfig = blockchain.getContractInfo();

  const totalOrgans = organs.length;
  const quarantinedOrgans = organs.filter(o => o.isQuarantined || o.isRecalled).length;
  const transplantedOrgans = organs.filter(o => o.stage === 'Transplanted' || o.stage === 'SoldToCustomer').length;
  const inTransitOrgans = organs.filter(o => o.stage === 'InTransit' || o.stage === 'DistributorReceived').length;
  const harvestedOrgans = organs.filter(o => o.stage === 'Harvested' || o.stage === 'Manufactured').length;
  const hospitalReceivedOrgans = organs.filter(o => o.stage === 'HospitalReceived' || o.stage === 'PharmacyReceived').length;

  const totalVerifications = verifications.length;
  const authenticVerifications = verifications.filter(v => v.result === 'GENUINE_AUTHENTIC').length;
  const quarantinedAlerts = verifications.filter(v => v.result === 'QUARANTINED' || v.result === 'ISCHEMIA_BREACHED').length;
  const counterfeitAlerts = verifications.filter(v => v.result === 'COUNTERFEIT_ALERT').length;

  const roleCounts = {
    opo: users.filter(u => u.role === 'opo' || u.role === 'manufacturer').length,
    logistics: users.filter(u => u.role === 'logistics' || u.role === 'distributor').length,
    authority: users.filter(u => u.role === 'authority' || u.role === 'wholesaler').length,
    hospital: users.filter(u => u.role === 'hospital' || u.role === 'pharmacy').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  res.json({
    organs: {
      total: totalOrgans,
      harvested: harvestedOrgans,
      inTransit: inTransitOrgans,
      hospitalReceived: hospitalReceivedOrgans,
      transplanted: transplantedOrgans,
      quarantined: quarantinedOrgans
    },
    batches: { // alias for client compatibility
      total: totalOrgans,
      manufactured: harvestedOrgans,
      inTransit: inTransitOrgans,
      dispensed: transplantedOrgans,
      recalled: quarantinedOrgans
    },
    scans: {
      total: totalVerifications,
      authentic: authenticVerifications,
      expired: quarantinedAlerts,
      counterfeitAlerts: counterfeitAlerts
    },
    network: {
      smartContractAddress: contractConfig ? contractConfig.address : "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      chainId: contractConfig ? contractConfig.chainId : 1337,
      networkName: contractConfig ? contractConfig.network : "Hardhat / EVM",
      isLiveNode: blockchain.isNodeRunning(),
      consensusType: "Proof of Authority (PoA) Medical Consortium"
    },
    participants: roleCounts,
    recentVerifications: verifications.slice(0, 10),
    investigations: reports
  });
});

// PATCH /api/stats/reports/:id - Update investigation status
router.patch('/reports/:id', (req, res) => {
  const { status } = req.body;
  const updated = store.updateReportStatus(req.params.id, status || "INSPECTOR_DISPATCHED");
  if (!updated) {
    return res.status(404).json({ error: "Investigation alert not found" });
  }
  res.json({ message: "Investigation alert status updated", report: updated });
});

module.exports = router;
