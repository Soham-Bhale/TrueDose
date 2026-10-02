const express = require('express');
const router = express.Router();
const blockchain = require('../services/blockchain');

// GET /api/verify/:batchId - Public medicine authenticity verification
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId || batchId.trim() === '') {
      return res.status(400).json({ error: "Batch ID parameter is required" });
    }

    const verificationResult = await blockchain.verifyBatch(batchId.trim().toUpperCase());

    // If batch doesn't exist on chain / database
    if (!verificationResult.exists) {
      return res.status(404).json({
        exists: false,
        batchId: batchId,
        status: "COUNTERFEIT_ALERT",
        alertTitle: "Batch Not Found / Suspected Counterfeit",
        alertDescription: "This batch ID is not registered on the TrueDose blockchain. The product may be unauthorized, duplicated, or counterfeit.",
        recommendation: "DO NOT CONSUME THIS MEDICINE. Return it to your pharmacy and file a report with your local drug regulatory authority.",
        verified: false,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      ...verificationResult,
      verifiedAt: new Date().toISOString(),
      blockchainNetwork: "TrueDose EVM Ledger (EIP-155:1337)",
      tamperEvident: true
    });
  } catch (err) {
    res.status(500).json({
      error: "Verification service temporarily unavailable",
      details: err.message
    });
  }
});

module.exports = router;
