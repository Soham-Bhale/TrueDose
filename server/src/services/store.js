const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
const getInitialState = () => {
  const salt = bcrypt.genSaltSync(10);
  return {
    users: [
      {
        id: "usr_admin",
        name: "TrueDose Regulatory Admin",
        email: "admin@truedose.org",
        passwordHash: bcrypt.hashSync("admin123", salt),
        role: "admin",
        organization: "National Drug Regulatory Agency",
        location: "Central Healthcare Authority, New Delhi",
        ethAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        isApproved: true,
        createdAt: "2026-01-01T00:00:00Z"
      },
      {
        id: "usr_mfg_abc",
        name: "ABC Pharma Ltd.",
        email: "manufacturer@abcpharma.com",
        passwordHash: bcrypt.hashSync("pharma123", salt),
        role: "manufacturer",
        organization: "ABC Pharmaceuticals Global",
        location: "Industrial Area Unit 4, Mumbai, India",
        ethAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        isApproved: true,
        licenseNumber: "MFG-2026-IND-882",
        createdAt: "2026-01-05T00:00:00Z"
      },
      {
        id: "usr_dist_apex",
        name: "Apex Logistics & Distribution",
        email: "distributor@apexlogistics.com",
        passwordHash: bcrypt.hashSync("dist123", salt),
        role: "distributor",
        organization: "Apex Pharma Supply Network",
        location: "Cold Chain Hub 12, Pune, India",
        ethAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        isApproved: true,
        licenseNumber: "DIST-2026-WEST-104",
        createdAt: "2026-01-10T00:00:00Z"
      },
      {
        id: "usr_wh_metro",
        name: "Metro Health Wholesalers",
        email: "wholesaler@metrohealth.com",
        passwordHash: bcrypt.hashSync("whole123", salt),
        role: "wholesaler",
        organization: "Metro Wholesale Healthcare Alliance",
        location: "Regional Depot 9, Bangalore, India",
        ethAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        isApproved: true,
        licenseNumber: "WHL-2026-SOUTH-044",
        createdAt: "2026-01-15T00:00:00Z"
      },
      {
        id: "usr_pharm_care",
        name: "HealthPlus Community Pharmacy",
        email: "pharmacy@careplus.com",
        passwordHash: bcrypt.hashSync("pharm123", salt),
        role: "pharmacy",
        organization: "HealthPlus Retail Pharmacies",
        location: "MG Road Branch, Hyderabad, India",
        ethAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        isApproved: true,
        licenseNumber: "RET-2026-HYD-550",
        createdAt: "2026-01-20T00:00:00Z"
      }
    ],
    batches: [
      {
        batchId: "PCM001",
        medicineName: "Paracetamol",
        dosage: "500 mg",
        quantity: 5000,
        unit: "tablets",
        manufacturerName: "ABC Pharma Ltd.",
        manufacturerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        manufacturingDate: "2026-09-01T00:00:00Z",
        expiryDate: "2028-08-31T23:59:59Z",
        currentOwner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        currentOwnerName: "ABC Pharma Ltd.",
        currentOwnerRole: "manufacturer",
        stage: "Manufactured",
        isRecalled: false,
        recallReason: "",
        storageConditions: "Store below 25°C in a dry place protected from direct sunlight",
        activeIngredients: "Paracetamol (Acetaminophen) 500mg, Excipients q.s.",
        regulatoryCert: "GMP/CERT/2026/8821",
        blockchainTxHash: "0x89e21df97bb756184a51e605d540263629f123d8c1c4e7fb2a4d3392ebcd11a4",
        history: [
          {
            stage: "Manufactured",
            from: "Production Line",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "ABC Pharma Ltd.",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Genesis / QA",
            roleTo: "Manufacturer",
            timestamp: "2026-09-01T08:30:00Z",
            location: "Industrial Area Unit 4, Mumbai, India",
            notes: "Batch formulated, QA purity verified at 99.8%, tamper seal #ABC-9912 applied",
            txHash: "0x89e21df97bb756184a51e605d540263629f123d8c1c4e7fb2a4d3392ebcd11a4",
            verifiedOnChain: true
          }
        ]
      },
      {
        batchId: "EXP902",
        medicineName: "Amoxicillin Trihydrate",
        dosage: "250 mg",
        quantity: 1200,
        unit: "capsules",
        manufacturerName: "ABC Pharma Ltd.",
        manufacturerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        manufacturingDate: "2023-01-01T00:00:00Z",
        expiryDate: "2025-01-01T00:00:00Z",
        currentOwner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        currentOwnerName: "HealthPlus Community Pharmacy",
        currentOwnerRole: "pharmacy",
        stage: "PharmacyReceived",
        isRecalled: false,
        recallReason: "",
        storageConditions: "Store between 15°C - 25°C",
        activeIngredients: "Amoxicillin 250mg",
        regulatoryCert: "GMP/CERT/2023/1029",
        blockchainTxHash: "0x44a2bcf4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e1002",
        history: [
          {
            stage: "Manufactured",
            from: "Production Line",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "ABC Pharma Ltd.",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Genesis / QA",
            roleTo: "Manufacturer",
            timestamp: "2023-01-01T10:00:00Z",
            location: "Industrial Area Unit 4, Mumbai, India",
            notes: "Manufactured and packaged",
            txHash: "0x44a2bcf4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e1002",
            verifiedOnChain: true
          },
          {
            stage: "DistributorReceived",
            from: "ABC Pharma Ltd.",
            fromAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            to: "Apex Logistics & Distribution",
            toAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            roleFrom: "Manufacturer",
            roleTo: "Distributor",
            timestamp: "2023-01-10T14:20:00Z",
            location: "Cold Chain Hub 12, Pune, India",
            notes: "Received in good condition",
            txHash: "0x55b3cdf4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e2003",
            verifiedOnChain: true
          },
          {
            stage: "PharmacyReceived",
            from: "Metro Health Wholesalers",
            fromAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            to: "HealthPlus Community Pharmacy",
            toAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            roleFrom: "Wholesaler",
            roleTo: "Pharmacy",
            timestamp: "2023-02-01T09:15:00Z",
            location: "MG Road Branch, Hyderabad, India",
            notes: "Received at pharmacy stockroom",
            txHash: "0x66c4def4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e3004",
            verifiedOnChain: true
          }
        ]
      },
      {
        batchId: "AMX404",
        medicineName: "Azithromycin",
        dosage: "500 mg",
        quantity: 3000,
        unit: "tablets",
        manufacturerName: "ABC Pharma Ltd.",
        manufacturerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        manufacturingDate: "2026-08-15T00:00:00Z",
        expiryDate: "2027-12-31T23:59:59Z",
        currentOwner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        currentOwnerName: "Metro Health Wholesalers",
        currentOwnerRole: "wholesaler",
        stage: "WholesalerReceived",
        isRecalled: false,
        recallReason: "",
        storageConditions: "Store below 30°C",
        activeIngredients: "Azithromycin 500mg USP",
        regulatoryCert: "GMP/CERT/2026/9112",
        blockchainTxHash: "0x77d5eef4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e4005",
        history: [
          {
            stage: "Manufactured",
            from: "Production Line",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "ABC Pharma Ltd.",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Genesis / QA",
            roleTo: "Manufacturer",
            timestamp: "2026-08-15T11:00:00Z",
            location: "Industrial Area Unit 4, Mumbai, India",
            notes: "Anti-infective batch - Quality cleared",
            txHash: "0x77d5eef4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e4005",
            verifiedOnChain: true
          },
          {
            stage: "DistributorReceived",
            from: "ABC Pharma Ltd.",
            fromAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            to: "Apex Logistics & Distribution",
            toAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            roleFrom: "Manufacturer",
            roleTo: "Distributor",
            timestamp: "2026-08-20T16:45:00Z",
            location: "Cold Chain Hub 12, Pune, India",
            notes: "Dispatched via Reefer Container #TR-402",
            txHash: "0x88e6fff4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e5006",
            verifiedOnChain: true
          },
          {
            stage: "WholesalerReceived",
            from: "Apex Logistics & Distribution",
            fromAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            to: "Metro Health Wholesalers",
            toAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            roleFrom: "Distributor",
            roleTo: "Wholesaler",
            timestamp: "2026-08-25T10:10:00Z",
            location: "Regional Depot 9, Bangalore, India",
            notes: "Inspected batch integrity at distribution hub. Transferred to regional warehouse.",
            txHash: "0x99f700f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e6007",
            verifiedOnChain: true
          }
        ]
      }
    ],
    verifications: [
      {
        id: "scan_1",
        batchId: "PCM001",
        timestamp: "2026-09-02T12:00:00Z",
        result: "GENUINE",
        scannerIp: "127.0.0.1",
        device: "Customer Mobile Browser"
      }
    ]
  };
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialState();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, re-initializing:", err);
    const initial = getInitialState();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  getUsers: () => readDb().users,
  getUserById: (id) => readDb().users.find(u => u.id === id),
  getUserByEmail: (email) => readDb().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUserByAddress: (addr) => readDb().users.find(u => u.ethAddress.toLowerCase() === addr.toLowerCase()),
  createUser: (user) => {
    const db = readDb();
    db.users.push(user);
    writeDb(db);
    return user;
  },
  getBatches: () => readDb().batches,
  getBatchById: (batchId) => readDb().batches.find(b => b.batchId.toLowerCase() === batchId.toLowerCase()),
  saveBatch: (batch) => {
    const db = readDb();
    const idx = db.batches.findIndex(b => b.batchId.toLowerCase() === batch.batchId.toLowerCase());
    if (idx >= 0) {
      db.batches[idx] = { ...db.batches[idx], ...batch };
    } else {
      db.batches.push(batch);
    }
    writeDb(db);
    return batch;
  },
  recordVerification: (scan) => {
    const db = readDb();
    db.verifications.unshift(scan);
    if (db.verifications.length > 200) db.verifications.pop();
    writeDb(db);
    return scan;
  },
  getVerifications: () => readDb().verifications
};
