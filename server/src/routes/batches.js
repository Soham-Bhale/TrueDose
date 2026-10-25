const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const store = require('../services/store');
const blockchain = require('../services/blockchain');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/organs or /api/batches - list organs
router.get('/', (req, res) => {
  const { role, owner } = req.query;
  let organs = store.getOrgans();

  if (owner) {
    organs = organs.filter(o => o.currentOwner.toLowerCase() === owner.toLowerCase());
  }

  res.json({
    count: organs.length,
    organs: organs,
    batches: organs // backward compatibility
  });
});

// GET /api/organs/:organId
router.get('/:organId', (req, res) => {
  const organ = store.getOrganById(req.params.organId);
  if (!organ) {
    return res.status(404).json({ error: `Organ ${req.params.organId} not found` });
  }
  res.json({ organ, batch: organ });
});

// GET /api/organs/:organId/qrcode - generate Cryo-Carrier QR label
router.get('/:organId/qrcode', async (req, res) => {
  const { organId } = req.params;
  const organ = store.getOrganById(organId);
  if (!organ) {
    return res.status(404).json({ error: `Organ ${organId} not found` });
  }

  const verifyUrl = `http://localhost:5173/verify/${organId}`;

  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });

    res.json({
      organId: organ.organId || organ.batchId,
      batchId: organ.organId || organ.batchId,
      verifyUrl,
      qrDataUrl: dataUrl
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code", details: err.message });
  }
});

// POST /api/organs - OPO Harvest & Register Organ
router.post('/', authenticate, requireRole(['opo', 'manufacturer', 'admin']), async (req, res) => {
  try {
    const {
      organId, batchId,
      organType, medicineName,
      donorId, donorBloodType, dosage,
      hlaMarker,
      ischemicLimitHours,
      recipientId, recipientHospital,
      preservationProtocol,
      initialTemp,
      notes
    } = req.body;

    const id = (organId || batchId || `ORG-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase();
    const type = organType || medicineName || "Kidney (Left)";
    const bloodType = donorBloodType || (dosage ? dosage.split(' ')[0] : "O+");
    const limit = Number(ischemicLimitHours) || 24;

    const existing = store.getOrganById(id);
    if (existing) {
      return res.status(409).json({ error: `Organ ID '${id}' already registered on ledger` });
    }

    const newOrgan = await blockchain.harvestOrgan({
      organId: id,
      organType: type,
      donorId: donorId || "DNR-MUM-9021",
      donorBloodType: bloodType,
      hlaMarker: hlaMarker || "6/6 HLA-Matched",
      ischemicLimitHours: limit,
      recipientId: recipientId || "RCP-7704",
      recipientHospital: recipientHospital || "Transplant Surgical Center",
      preservationProtocol: preservationProtocol || "Custodiol HTK Hypothermic Perfusion",
      initialTemp: initialTemp || 2.8,
      notes: notes || "Organ harvested and donor consent verified on blockchain",
      signerRole: req.user.role
    });

    res.status(201).json({
      message: "Organ harvest & donor consent registered successfully on blockchain!",
      organ: newOrgan,
      batch: newOrgan
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to harvest organ", details: err.message });
  }
});

// POST /api/organs/:organId/transfer - Transfer Custody along Medical Chain
router.post('/:organId/transfer', authenticate, async (req, res) => {
  try {
    const { organId } = req.params;
    const { toAddress, notes, location, currentTemp } = req.body;

    if (!toAddress) {
      return res.status(400).json({ error: "Destination node address 'toAddress' is required" });
    }

    const organ = store.getOrganById(organId);
    if (!organ) {
      return res.status(404).json({ error: `Organ ${organId} not found` });
    }

    // Custody permission check
    const isOwner = organ.currentOwner.toLowerCase() === req.user.ethAddress.toLowerCase();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: `Unauthorized: You do not currently hold custody of ${organId}. Current custodian is ${organ.currentOwnerName}`
      });
    }

    if (organ.isQuarantined) {
      return res.status(400).json({
        error: `Organ ${organId} is under regulatory quarantine. Custody transfer prohibited.`
      });
    }

    const updatedOrgan = await blockchain.transferCustody({
      organId: organ.organId || organ.batchId,
      toAddress,
      notes: notes || "Medical custody handoff logged on blockchain",
      location: location || "Cold chain transit point",
      currentTemp: currentTemp || organ.temperatureCelsius || 2.8,
      signerRole: req.user.role
    });

    res.json({
      message: `Custody of Organ ${organId} transferred successfully on-chain`,
      organ: updatedOrgan,
      batch: updatedOrgan
    });
  } catch (err) {
    res.status(500).json({ error: "Transfer failed", details: err.message });
  }
});

// POST /api/organs/:organId/sell or /transplant - Hospital surgical implantation completion
router.post(['/:organId/sell', '/:organId/transplant'], authenticate, requireRole(['hospital', 'pharmacy', 'admin']), async (req, res) => {
  try {
    const { organId } = req.params;
    const { notes } = req.body;

    const organ = store.getOrganById(organId);
    if (!organ) return res.status(404).json({ error: `Organ ${organId} not found` });

    if (organ.isQuarantined) {
      return res.status(400).json({ error: `Cannot transplant quarantined organ ${organId}` });
    }

    const updated = await blockchain.completeTransplant({
      organId: organ.organId || organ.batchId,
      surgicalNotes: notes || "Surgical implantation completed in OR. Graft reperfusion verified.",
      signerRole: req.user.role
    });

    res.json({
      message: `Organ ${organId} successfully grafted into recipient. Implantation logged on-chain.`,
      organ: updated,
      batch: updated
    });
  } catch (err) {
    res.status(500).json({ error: "Implantation sign-off failed", details: err.message });
  }
});

// POST /api/organs/:organId/recall or /quarantine - Emergency Quarantine Order
router.post(['/:organId/recall', '/:organId/quarantine'], authenticate, requireRole(['admin', 'authority', 'opo', 'manufacturer']), async (req, res) => {
  try {
    const { organId } = req.params;
    const { reason } = req.body;

    const organ = store.getOrganById(organId);
    if (!organ) return res.status(404).json({ error: `Organ ${organId} not found` });

    const updated = await blockchain.quarantineOrgan({
      organId: organ.organId || organ.batchId,
      reason: reason || "Emergency regulatory quarantine ordered",
      signerRole: req.user.role
    });

    res.json({
      message: `REGULATORY QUARANTINE ISSUED: Organ ${organId} locked.`,
      organ: updated,
      batch: updated
    });
  } catch (err) {
    res.status(500).json({ error: "Quarantine order failed", details: err.message });
  }
});

module.exports = router;
