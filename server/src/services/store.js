const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state for LifeLedger Organ Procurement Network
const getInitialState = () => {
  const salt = bcrypt.genSaltSync(10);
  return {
    users: [
      {
        id: "usr_admin",
        name: "National Organ & Tissue Regulatory Authority (NOTTO / UNOS)",
        email: "admin@lifeledger.org",
        passwordHash: bcrypt.hashSync("admin123", salt),
        role: "admin",
        organization: "Central Health Ministry & NOTTO Directorate",
        location: "Central Healthcare Complex, New Delhi",
        ethAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        isApproved: true,
        badge: "National Regulatory Admin",
        headline: "National Allocation Oversight, Anti-Trafficking Registry & Compliance Enforcement",
        createdAt: "2026-01-01T00:00:00Z"
      },
      {
        id: "usr_opo",
        name: "National Organ Procurement Network (Unit 4 Mumbai)",
        email: "opo@lifeledger.org",
        passwordHash: bcrypt.hashSync("opo123", salt),
        role: "opo",
        organization: "Lilavati Memorial Surgical Trauma Center & OPO",
        location: "Bandra Reclamation, Mumbai, India",
        ethAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        isApproved: true,
        licenseNumber: "OPO-2026-WZ-401",
        badge: "Organ Procurement Org (OPO)",
        headline: "Donor Consent Verification, Organ Retrieval & Cryo-Genesis Release",
        createdAt: "2026-01-05T00:00:00Z"
      },
      {
        id: "usr_logistics",
        name: "AeroMed Specialized Organ Logistics & Cryo-Transit",
        email: "logistics@aeromed.org",
        passwordHash: bcrypt.hashSync("dist123", salt),
        role: "logistics",
        organization: "AeroMed Specialized Medical Air & Ground Logistics",
        location: "Air Ambulance Terminal 1D, Mumbai / Pune, India",
        ethAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        isApproved: true,
        licenseNumber: "MED-AIR-2026-904",
        badge: "Medical Transit Logistics",
        headline: "Refrigerated Cryo-Carrier Fleet, Real-Time Cold Ischemia Telemetry & Transport",
        createdAt: "2026-01-10T00:00:00Z"
      },
      {
        id: "usr_authority",
        name: "Regional Organ Allocation Directorate (NOTTO / SOTTO)",
        email: "allocation@notto.gov.in",
        passwordHash: bcrypt.hashSync("whole123", salt),
        role: "authority",
        organization: "Regional Medical Allocation Directorate",
        location: "Regional Healthcare Depot 9, Bangalore, India",
        ethAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        isApproved: true,
        licenseNumber: "NOTTO-ALLOC-REG-08",
        badge: "Allocation Authority",
        headline: "Recipient Queue Prioritization, HLA Compatibility Clearance & Custody Audit",
        createdAt: "2026-01-15T00:00:00Z"
      },
      {
        id: "usr_hospital",
        name: "Apollo Multi-Specialty Transplant Surgical Center",
        email: "transplant@apollo.org",
        passwordHash: bcrypt.hashSync("pharm123", salt),
        role: "hospital",
        organization: "Apollo Institute of Renal & Cardiac Transplantation",
        location: "Jubilee Hills OR Complex, Hyderabad, India",
        ethAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        isApproved: true,
        licenseNumber: "TX-HOSP-HYD-882",
        badge: "Transplant Hospital / Surgical Suite",
        headline: "Recipient Crossmatch Verification, Pre-Op Inspection & Surgical Implantation",
        createdAt: "2026-01-20T00:00:00Z"
      }
    ],
    organs: [
      {
        organId: "ORG-KID-8041",
        batchId: "ORG-KID-8041",
        medicineName: "Kidney (Left)",
        organType: "Kidney (Left)",
        dosage: "Adult Donor Graft",
        quantity: 1,
        unit: "organ",
        donorId: "DNR-MUM-9021",
        donorBloodType: "O+",
        hlaMarker: "6/6 HLA-Matched",
        harvestTimestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        ischemicLimitHours: 30,
        preservationProtocol: "Custodiol HTK Hypothermic Perfusion",
        temperatureCelsius: 2.8,
        recipientId: "RCP-7704",
        recipientHospital: "Apollo Multi-Specialty Transplant Surgical Center",
        manufacturerName: "National Organ Procurement Network (Unit 4 Mumbai)",
        currentOwner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        currentOwnerName: "National Organ Procurement Network (Unit 4 Mumbai)",
        currentOwnerRole: "opo",
        stage: "Harvested",
        isQuarantined: false,
        isRecalled: false,
        recallReason: "",
        storageConditions: "Hypothermic machine perfusion 2°C - 4°C",
        blockchainTxHash: "0x89e21df97bb756184a51e605d540263629f123d8c1c4e7fb2a4d3392ebcd11a4",
        blockNumber: 101,
        legalConsentCID: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        history: [
          {
            stage: "Harvested",
            from: "Donor Surgical Suite",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "National Organ Procurement Network",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Harvest Team",
            roleTo: "Organ Procurement Org (OPO)",
            timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            location: "Lilavati Trauma Surgical Suite, Mumbai",
            notes: "Donor consent cryptographically verified. Organ flushed with 1000mL Custodiol HTK solution.",
            txHash: "0x89e21df97bb756184a51e605d540263629f123d8c1c4e7fb2a4d3392ebcd11a4",
            temperatureCelsius: 2.8,
            verifiedOnChain: true
          }
        ]
      },
      {
        organId: "ORG-HRT-2094",
        batchId: "ORG-HRT-2094",
        medicineName: "Heart (Whole Cardiac Graft)",
        organType: "Heart (Whole)",
        dosage: "Adult Heart",
        quantity: 1,
        unit: "organ",
        donorId: "DNR-DEL-4412",
        donorBloodType: "A+",
        hlaMarker: "5/6 HLA-Matched",
        harvestTimestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        ischemicLimitHours: 4,
        preservationProtocol: "Celsior Micro-Perfusion Preservation",
        temperatureCelsius: 3.2,
        recipientId: "RCP-9120",
        recipientHospital: "All-India Institute Surgical Transplant Center",
        manufacturerName: "National Organ Procurement Network (Unit 4 Mumbai)",
        currentOwner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        currentOwnerName: "AeroMed Specialized Organ Logistics",
        currentOwnerRole: "logistics",
        stage: "InTransit",
        isQuarantined: false,
        isRecalled: false,
        recallReason: "",
        storageConditions: "Active oxygenated hypothermic transit at 3.0°C - 4.0°C",
        blockchainTxHash: "0x55b3cdf4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e2003",
        blockNumber: 104,
        legalConsentCID: "bafybeihkovi6p2v4t2k5ugx3h67b36y4k7m4v3m3r3q4b3c3d3e3f3g3h3",
        history: [
          {
            stage: "Harvested",
            from: "Donor Surgical Suite",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "National Organ Procurement Network",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Harvest Team",
            roleTo: "Organ Procurement Org (OPO)",
            timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            location: "Delhi Trauma Center OR 2",
            notes: "Donor crossmatch confirmed. Cross-clamp time logged.",
            txHash: "0x44a2bcf4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e1002",
            temperatureCelsius: 3.0,
            verifiedOnChain: true
          },
          {
            stage: "InTransit",
            from: "National Organ Procurement Network",
            fromAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            to: "AeroMed Specialized Organ Logistics",
            toAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            roleFrom: "OPO",
            roleTo: "Logistics Carrier",
            timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            location: "Delhi Airport Gate 8 Air Ambulance",
            notes: "Loaded into TransMedics Organ Care System. Flight MED-901 airborne.",
            txHash: "0x55b3cdf4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e2003",
            temperatureCelsius: 3.2,
            verifiedOnChain: true
          }
        ]
      },
      {
        organId: "ORG-LVR-5512",
        batchId: "ORG-LVR-5512",
        medicineName: "Liver (Right Lobe Graft)",
        organType: "Liver (Right Lobe)",
        dosage: "Living Donor Partial Graft",
        quantity: 1,
        unit: "organ",
        donorId: "DNR-BLR-7820",
        donorBloodType: "B+",
        hlaMarker: "6/6 HLA-Matched",
        harvestTimestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        ischemicLimitHours: 12,
        preservationProtocol: "University of Wisconsin (UW) Cold Flush",
        temperatureCelsius: 2.6,
        recipientId: "RCP-4491",
        recipientHospital: "Apollo Multi-Specialty Transplant Surgical Center",
        manufacturerName: "National Organ Procurement Network (Unit 4 Mumbai)",
        currentOwner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        currentOwnerName: "Apollo Multi-Specialty Transplant Surgical Center",
        currentOwnerRole: "hospital",
        stage: "HospitalReceived",
        isQuarantined: false,
        isRecalled: false,
        recallReason: "",
        storageConditions: "Static cold storage with ice slurry 2°C - 4°C",
        blockchainTxHash: "0x77d5eef4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e4005",
        blockNumber: 108,
        legalConsentCID: "bafybeihk3v6p2v4t2k5ugx3h67b36y4k7m4v3m3r3q4b3c3d3e3f3g3abc",
        history: [
          {
            stage: "Harvested",
            from: "Donor Surgical Suite",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "National Organ Procurement Network",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Harvest Team",
            roleTo: "Organ Procurement Org (OPO)",
            timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            location: "Bangalore Trauma Center OR 3",
            notes: "Donor consent & authorization registered on ledger.",
            txHash: "0x66c4def4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e3004",
            temperatureCelsius: 2.5,
            verifiedOnChain: true
          },
          {
            stage: "InTransit",
            from: "National Organ Procurement Network",
            fromAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            to: "AeroMed Specialized Organ Logistics",
            toAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            roleFrom: "OPO",
            roleTo: "Logistics",
            timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            location: "Bangalore Heliport",
            notes: "Rapid helicopter transfer dispatched.",
            txHash: "0x77d5eef4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e4005",
            temperatureCelsius: 2.6,
            verifiedOnChain: true
          },
          {
            stage: "HospitalReceived",
            from: "AeroMed Specialized Organ Logistics",
            fromAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            to: "Apollo Multi-Specialty Transplant Surgical Center",
            toAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            roleFrom: "Logistics",
            roleTo: "Hospital Surgical Center",
            timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            location: "Apollo Surgical Suite 4, Hyderabad",
            notes: "Organ delivered into surgical suite. Cold ischemia 5h 02m elapsed (safe).",
            txHash: "0x88e6fff4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e5006",
            temperatureCelsius: 2.6,
            verifiedOnChain: true
          }
        ]
      },
      {
        organId: "ORG-LNG-1108",
        batchId: "ORG-LNG-1108",
        medicineName: "Double Lung Graft",
        organType: "Double Lung",
        dosage: "Bilateral Pulmonary Graft",
        quantity: 1,
        unit: "organ",
        donorId: "DNR-HYD-3109",
        donorBloodType: "O-",
        hlaMarker: "6/6 HLA-Matched",
        harvestTimestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        ischemicLimitHours: 8,
        preservationProtocol: "Perfadex Low Potassium Dextran Flush",
        temperatureCelsius: 3.5,
        recipientId: "RCP-8812",
        recipientHospital: "Apollo Multi-Specialty Transplant Surgical Center",
        manufacturerName: "National Organ Procurement Network (Unit 4 Mumbai)",
        currentOwner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        currentOwnerName: "Apollo Multi-Specialty Transplant Surgical Center",
        currentOwnerRole: "hospital",
        stage: "Transplanted",
        isQuarantined: false,
        isRecalled: false,
        recallReason: "",
        storageConditions: "Static pulmonary inflation storage 4°C - 8°C",
        blockchainTxHash: "0x99f700f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e6007",
        blockNumber: 112,
        legalConsentCID: "bafybeihk3v6p2v4t2k5ugx3h67b36y4k7m4v3m3r3q4b3c3d3e3f3g3xyz",
        history: [
          {
            stage: "Harvested",
            from: "Donor Surgical Suite",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "National Organ Procurement Network",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Harvest Team",
            roleTo: "OPO",
            timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
            location: "Apollo Medical Complex, Hyderabad",
            notes: "Donor lungs harvested and perfused with Perfadex.",
            txHash: "0x99f700f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e6007",
            temperatureCelsius: 3.4,
            verifiedOnChain: true
          },
          {
            stage: "Transplanted",
            from: "Apollo Multi-Specialty Transplant Surgical Center",
            fromAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            to: "Recipient Patient (RCP-8812)",
            toAddress: "0x0000000000000000000000000000000000000000",
            roleFrom: "Transplant Hospital",
            roleTo: "Grafted Recipient",
            timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
            location: "Apollo OR 1, Hyderabad",
            notes: "Bilateral lung transplant successfully completed. Immediate graft function established.",
            txHash: "0xaa1200f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e7008",
            temperatureCelsius: 3.5,
            verifiedOnChain: true
          }
        ]
      },
      {
        organId: "ORG-COR-3390",
        batchId: "ORG-COR-3390",
        medicineName: "Corneal Endothelial Graft",
        organType: "Cornea Graft",
        dosage: "Corneal Graft",
        quantity: 1,
        unit: "organ",
        donorId: "DNR-CHN-6110",
        donorBloodType: "AB+",
        hlaMarker: "Crossmatch Cleared",
        harvestTimestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        ischemicLimitHours: 24,
        preservationProtocol: "Optisol-GS Storage Medium",
        temperatureCelsius: 8.5,
        recipientId: "RCP-2033",
        recipientHospital: "Regional Eye Bank & Surgical Institute",
        manufacturerName: "National Organ Procurement Network (Unit 4 Mumbai)",
        currentOwner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        currentOwnerName: "National Organ & Tissue Regulatory Authority (NOTTO)",
        currentOwnerRole: "admin",
        stage: "Quarantined",
        isQuarantined: true,
        isRecalled: true,
        recallReason: "Thermal Sensor Alert: Container temperature spiked to 8.5°C during ground courier transit (Threshold: 4.0°C). Quarantined for biosafety inspection.",
        storageConditions: "Temperature excursion detected",
        blockchainTxHash: "0xbb2300f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e8009",
        blockNumber: 115,
        legalConsentCID: "bafybeihk3v6p2v4t2k5ugx3h67b36y4k7m4v3m3r3q4b3c3d3e3f3g3cor",
        history: [
          {
            stage: "Harvested",
            from: "Donor Surgical Suite",
            fromAddress: "0x0000000000000000000000000000000000000000",
            to: "National Organ Procurement Network",
            toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            roleFrom: "Harvest Team",
            roleTo: "OPO",
            timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            location: "Chennai Trauma Center",
            notes: "Donor cornea retrieved with full legal consent.",
            txHash: "0xbb2300f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e8009",
            temperatureCelsius: 3.0,
            verifiedOnChain: true
          },
          {
            stage: "Quarantined",
            from: "National Organ & Tissue Regulatory Authority (NOTTO)",
            fromAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            to: "Biorepository Quarantine Facility",
            toAddress: "0x0000000000000000000000000000000000000000",
            roleFrom: "Regulatory Directorate",
            roleTo: "Quarantine Hold",
            timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
            location: "Regional Quarantine Depot",
            notes: "EMERGENCY QUARANTINE: Cold chain excursion 8.5°C logged by automated IoT sensor.",
            txHash: "0xcc3400f4e9821a7199bc45deca89021387612f0a1bc7e2d431c9a1bc4f6e9010",
            temperatureCelsius: 8.5,
            verifiedOnChain: true
          }
        ]
      }
    ],
    verifications: [
      {
        id: "scan_1",
        organId: "ORG-KID-8041",
        batchId: "ORG-KID-8041",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        result: "GENUINE_AUTHENTIC",
        scannerIp: "127.0.0.1",
        device: "Surgical Suite Barcode Terminal"
      }
    ],
    reports: [
      {
        id: "ALERT-2026-901",
        organId: "ORG-SUSPECT-77",
        batchId: "ORG-SUSPECT-77",
        medicineName: "Suspected Unregistered Organ Transit",
        storeName: "Private Aero-Courier Hangar 4",
        location: "IGI Airport Terminal 1, Delhi",
        reportType: "UNAUTHORIZED_CUSTODY",
        description: "Customs security scanned cryo-preservation box marked ORG-SUSPECT-77. QR code unverified on NOTTO blockchain. Tamper seal was missing regulatory holographic stamp.",
        reporterContact: "customs.security@igi.delhi.aero",
        status: "INSPECTOR_DISPATCHED",
        filedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: "ALERT-2026-402",
        organId: "ORG-COR-3390",
        batchId: "ORG-COR-3390",
        medicineName: "Corneal Endothelial Graft",
        storeName: "Regional Cryo-Logistics Transit Hub",
        location: "Tambaram Highway Transit Hub, Chennai",
        reportType: "COLD_CHAIN_EXCURSION",
        description: "IoT thermal logger reported temperature spike to 8.5°C during ground courier transfer. Immediate regulatory quarantine mandated.",
        reporterContact: "iot-telemetry-daemon@lifeledger.org",
        status: "ORGAN_QUARANTINED",
        filedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
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
    const data = JSON.parse(raw);
    if (!data.organs) data.organs = data.batches || [];
    if (!data.reports) data.reports = [];
    return data;
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

// Reset db to clean LifeLedger organ state
function resetToLifeLedger() {
  const initial = getInitialState();
  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  return initial;
}

module.exports = {
  resetToLifeLedger,

  // Users
  getUsers: () => readDb().users,
  getUserById: (id) => {
    const users = readDb().users;
    return users.find(u => u.id === id);
  },
  getUserByEmail: (email) => {
    const users = readDb().users;
    return users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  },
  getUserByRole: (role) => {
    const users = readDb().users;
    return users.find(u => u.role.toLowerCase() === (role || '').toLowerCase());
  },

  // Organs
  getOrgans: () => {
    const db = readDb();
    return db.organs || db.batches || [];
  },
  getOrganById: (id) => {
    const organs = readDb().organs || readDb().batches || [];
    const idUpper = (id || '').toUpperCase();
    return organs.find(o => (o.organId || o.batchId || '').toUpperCase() === idUpper);
  },
  // Backward compatibility alias for batches
  getBatches: () => {
    const db = readDb();
    return db.organs || db.batches || [];
  },
  getBatchById: (id) => {
    const organs = readDb().organs || readDb().batches || [];
    const idUpper = (id || '').toUpperCase();
    return organs.find(o => (o.organId || o.batchId || '').toUpperCase() === idUpper);
  },
  saveOrgan: (organData) => {
    const db = readDb();
    if (!db.organs) db.organs = [];
    const id = organData.organId || organData.batchId;
    const existingIdx = db.organs.findIndex(o => (o.organId || o.batchId) === id);
    if (existingIdx >= 0) {
      db.organs[existingIdx] = { ...db.organs[existingIdx], ...organData };
    } else {
      db.organs.unshift(organData);
    }
    db.batches = db.organs; // mirror for any legacy route
    writeDb(db);
    return organData;
  },
  saveBatch: (organData) => {
    const db = readDb();
    if (!db.organs) db.organs = [];
    const id = organData.organId || organData.batchId;
    const existingIdx = db.organs.findIndex(o => (o.organId || o.batchId) === id);
    if (existingIdx >= 0) {
      db.organs[existingIdx] = { ...db.organs[existingIdx], ...organData };
    } else {
      db.organs.unshift(organData);
    }
    db.batches = db.organs;
    writeDb(db);
    return organData;
  },
  updateOrgan: (id, updates) => {
    const db = readDb();
    const idUpper = (id || '').toUpperCase();
    const organ = (db.organs || []).find(o => (o.organId || o.batchId || '').toUpperCase() === idUpper);
    if (!organ) return null;
    Object.assign(organ, updates);
    writeDb(db);
    return organ;
  },

  // Verifications
  getVerifications: () => readDb().verifications || [],
  recordVerification: (record) => {
    const db = readDb();
    if (!db.verifications) db.verifications = [];
    db.verifications.unshift({
      id: "scan_" + Date.now(),
      timestamp: new Date().toISOString(),
      ...record
    });
    writeDb(db);
  },

  // Regulatory Alerts & Investigations
  getReports: () => readDb().reports || [],
  addReport: (reportData) => {
    const db = readDb();
    if (!db.reports) db.reports = [];
    const newReport = {
      id: `ALERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "INVESTIGATION_DISPATCHED",
      filedAt: new Date().toISOString(),
      ...reportData
    };
    db.reports.unshift(newReport);
    writeDb(db);
    return newReport;
  },
  updateReportStatus: (id, status) => {
    const db = readDb();
    const rep = (db.reports || []).find(r => r.id === id);
    if (!rep) return null;
    rep.status = status;
    rep.updatedAt = new Date().toISOString();
    writeDb(db);
    return rep;
  }
};
