const express = require('express');
const router = express.Router();
const store = require('../services/store');
const blockchain = require('../services/blockchain');

// GET /api/stats
router.get('/', (req, res) => {
  const batches = store.getBatches();
  const users = store.getUsers();
  const verifications = store.getVerifications();
  const reports = store.getReports();
  const contractConfig = blockchain.getContractInfo();

  const totalBatches = batches.length;
  const recalledBatches = batches.filter(b => b.isRecalled).length;
  const soldBatches = batches.filter(b => b.stage === 'SoldToCustomer').length;
  const inTransitBatches = batches.filter(b => b.stage !== 'Manufactured' && b.stage !== 'SoldToCustomer' && !b.isRecalled).length;
  const manufacturedBatches = batches.filter(b => b.stage === 'Manufactured').length;

  const totalVerifications = verifications.length;
  const authenticVerifications = verifications.filter(v => v.result === 'GENUINE_AUTHENTIC').length;
  const expiredVerifications = verifications.filter(v => v.result === 'EXPIRED' || v.result === 'EXPIRING_SOON').length;
  const counterfeitAlerts = verifications.filter(v => v.result === 'COUNTERFEIT_ALERT').length;

  const roleCounts = {
    manufacturer: users.filter(u => u.role === 'manufacturer').length,
    distributor: users.filter(u => u.role === 'distributor').length,
    wholesaler: users.filter(u => u.role === 'wholesaler').length,
    pharmacy: users.filter(u => u.role === 'pharmacy').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  res.json({
    batches: {
      total: totalBatches,
      manufactured: manufacturedBatches,
      inTransit: inTransitBatches,
      dispensed: soldBatches,
      recalled: recalledBatches
    },
    scans: {
      total: totalVerifications,
      authentic: authenticVerifications,
      expired: expiredVerifications,
      counterfeitAlerts: counterfeitAlerts
    },
    network: {
      smartContractAddress: contractConfig ? contractConfig.address : "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      chainId: contractConfig ? contractConfig.chainId : 1337,
      networkName: contractConfig ? contractConfig.network : "Hardhat / EVM",
      isLiveNode: blockchain.isNodeRunning(),
      consensusType: "Proof of Authority (PoA) Consortium"
    },
    participants: roleCounts,
    recentVerifications: verifications.slice(0, 10),
    investigations: reports
  });
});

// PATCH /api/stats/reports/:id - Update investigation status
router.patch('/reports/:id', (req, res) => {
  const { status } = req.body;
  const updated = store.updateReportStatus(req.params.id, status || "INVESTIGATOR_ON_SITE");
  if (!updated) {
    return res.status(404).json({ error: "Report not found" });
  }
  res.json({ message: "Investigation updated", report: updated });
});

module.exports = router;
