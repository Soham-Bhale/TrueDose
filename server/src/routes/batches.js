const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const store = require('../services/store');
const blockchain = require('../services/blockchain');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/batches - list batches
router.get('/', (req, res) => {
  const { role, owner } = req.query;
  let batches = store.getBatches();

  if (owner) {
    batches = batches.filter(b => b.currentOwner.toLowerCase() === owner.toLowerCase());
  }

  res.json({
    count: batches.length,
    batches: batches
  });
});

// GET /api/batches/:batchId - single batch details
router.get('/:batchId', (req, res) => {
  const batch = store.getBatchById(req.params.batchId);
  if (!batch) {
    return res.status(404).json({ error: `Batch ${req.params.batchId} not found` });
  }
  res.json({ batch });
});

// GET /api/batches/:batchId/qrcode - generate QR code
router.get('/:batchId/qrcode', async (req, res) => {
  const { batchId } = req.params;
  const batch = store.getBatchById(batchId);
  if (!batch) {
    return res.status(404).json({ error: `Batch ${batchId} not found` });
  }

  // URL pointing directly to frontend verification page
  const clientHost = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
  const protocol = req.protocol === 'https' ? 'https' : 'http';
  // Use port 5173 default for Vite
  const verifyUrl = `http://localhost:5173/verify/${batchId}`;

  const qrPayload = JSON.stringify({
    truedose: "verified",
    batchId: batch.batchId,
    medicineName: batch.medicineName,
    manufacturer: batch.manufacturerName,
    exp: batch.expiryDate,
    url: verifyUrl
  });

  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.json({
      batchId,
      verifyUrl,
      qrDataUrl: dataUrl
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code", details: err.message });
  }
});

// POST /api/batches - Manufacturer registers new batch
router.post('/', authenticate, requireRole(['manufacturer', 'admin']), async (req, res) => {
  try {
    const { batchId, medicineName, dosage, quantity, manufacturingDate, expiryDate, notes } = req.body;

    if (!batchId || !medicineName || !quantity || !manufacturingDate || !expiryDate) {
      return res.status(400).json({
        error: "Missing required fields: batchId, medicineName, quantity, manufacturingDate, expiryDate"
      });
    }

    const existing = store.getBatchById(batchId);
    if (existing) {
      return res.status(409).json({ error: `Batch ID '${batchId}' already exists in system` });
    }

    const newBatch = await blockchain.createBatch({
      batchId: batchId.trim().toUpperCase(),
      medicineName,
      dosage,
      quantity,
      mfgDate: manufacturingDate,
      expDate: expiryDate,
      notes,
      signerRole: req.user.role
    });

    res.status(201).json({
      message: "Medicine batch registered successfully on blockchain!",
      batch: newBatch
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create batch", details: err.message });
  }
});

// POST /api/batches/:batchId/transfer - Transfer batch along supply chain
router.post('/:batchId/transfer', authenticate, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { toAddress, notes } = req.body;

    if (!toAddress) {
      return res.status(400).json({ error: "Recipient Ethereum address 'toAddress' is required" });
    }

    const batch = store.getBatchById(batchId);
    if (!batch) {
      return res.status(404).json({ error: `Batch ${batchId} not found` });
    }

    // Role-based rule verification:
    // Only current owner or admin can initiate transfer
    const isOwner = batch.currentOwner.toLowerCase() === req.user.ethAddress.toLowerCase();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: `Unauthorized: You do not own batch ${batchId}. Current owner is ${batch.currentOwnerName} (${batch.currentOwner})`
      });
    }

    // Check expiration before transfer
    const isExpired = new Date() > new Date(batch.expiryDate);
    if (isExpired) {
      return res.status(400).json({
        error: `Cannot transfer expired medicine! Batch expired on ${batch.expiryDate}`
      });
    }

    // Verify recipient participant
    const recipient = store.getUserByAddress(toAddress);
    if (!recipient) {
      return res.status(400).json({
        error: `Target address ${toAddress} is not registered as an authorized supply-chain entity`
      });
    }

    // Enforce sequential supply chain transfers:
    // Manufacturer -> Distributor -> Wholesaler -> Pharmacy
    if (batch.stage === "Manufactured" && recipient.role !== "distributor") {
      return res.status(400).json({
        error: `Smart contract rule violation: Newly manufactured batches can only be transferred to an authorized Distributor, not '${recipient.role}'`
      });
    }
    if (batch.stage === "DistributorReceived" && recipient.role !== "wholesaler") {
      return res.status(400).json({
        error: `Smart contract rule violation: Distributor can only transfer to an authorized Wholesaler, not '${recipient.role}'`
      });
    }
    if (batch.stage === "WholesalerReceived" && recipient.role !== "pharmacy") {
      return res.status(400).json({
        error: `Smart contract rule violation: Wholesaler can only transfer to an authorized Pharmacy, not '${recipient.role}'`
      });
    }

    const updatedBatch = await blockchain.transferBatch({
      batchId,
      toAddress,
      toRole: recipient.role,
      notes,
      signerRole: req.user.role
    });

    res.json({
      message: `Batch ${batchId} successfully transferred to ${recipient.name}!`,
      batch: updatedBatch
    });
  } catch (err) {
    res.status(500).json({ error: "Transfer failed", details: err.message });
  }
});

// POST /api/batches/:batchId/sell - Pharmacy dispenses medicine
router.post('/:batchId/sell', authenticate, requireRole(['pharmacy', 'admin']), async (req, res) => {
  try {
    const { batchId } = req.params;
    const { notes } = req.body;

    const updatedBatch = await blockchain.markAsSold({
      batchId,
      notes,
      signerRole: req.user.role
    });

    res.json({
      message: `Batch ${batchId} marked as dispensed to customer. Blockchain status updated.`,
      batch: updatedBatch
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as sold", details: err.message });
  }
});

// POST /api/batches/:batchId/recall - Regulatory or Manufacturer recall
router.post('/:batchId/recall', authenticate, requireRole(['admin', 'manufacturer']), async (req, res) => {
  try {
    const { batchId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Recall reason is required" });
    }

    const updatedBatch = await blockchain.recallBatch({
      batchId,
      reason,
      signerRole: req.user.role
    });

    res.json({
      message: `EMERGENCY RECALL ISSUED for batch ${batchId}. All nodes notified.`,
      batch: updatedBatch
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to recall batch", details: err.message });
  }
});

module.exports = router;
