const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of LifeLedger Organ Procurement contract...");

  const [admin, opo, logistics, authority, hospital] = await hre.ethers.getSigners();

  console.log("Admin / NOTTO Directorate:", admin.address);
  console.log("OPO (Donor Hospital):", opo.address);
  console.log("Medical Logistics / Transit:", logistics.address);
  console.log("Regional Allocation Authority:", authority.address);
  console.log("Transplant Hospital / Surgical Suite:", hospital.address);

  const LifeLedger = await hre.ethers.getContractFactory("LifeLedger");
  const contract = await LifeLedger.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ LifeLedger deployed at:", contractAddress);

  // Register participants
  // Roles: 1: Admin, 2: OPO, 3: Logistics, 4: Authority, 5: Hospital
  console.log("Registering organ transplant consortium participants...");

  let tx = await contract.connect(admin).registerParticipant(
    opo.address,
    "National Organ Procurement Network (Unit 4 Mumbai)",
    2, // OPO
    "Lilavati Memorial Surgical Trauma Center, Mumbai"
  );
  await tx.wait();

  tx = await contract.connect(admin).registerParticipant(
    logistics.address,
    "AeroMed Specialized Organ Logistics & Cryo-Transit",
    3, // Logistics
    "Chhatrapati Shivaji Air Ambulance Terminal, Mumbai"
  );
  await tx.wait();

  tx = await contract.connect(admin).registerParticipant(
    authority.address,
    "National Organ & Tissue Allocation Directorate (NOTTO)",
    4, // Authority
    "Safdarjung Hospital Healthcare Complex, New Delhi"
  );
  await tx.wait();

  tx = await contract.connect(admin).registerParticipant(
    hospital.address,
    "Apollo Multi-Specialty Transplant Surgical Center",
    5, // Hospital
    "Banjara Hills Medical Campus, Hyderabad"
  );
  await tx.wait();

  console.log("✅ All transplant consortium nodes registered on-chain!");

  // Seed Organ 1: ORG-KID-8041 (Kidney, Harvested)
  console.log("Harvesting Organ #1: ORG-KID-8041 (Kidney)...");
  tx = await contract.connect(opo).harvestOrgan(
    "ORG-KID-8041",
    "Kidney (Left)",
    "DNR-MUM-9021",
    "O+",
    "6/6 HLA-Matched",
    30, // 30 hours safe cold ischemia
    "RCP-7704",
    "Apollo Multi-Specialty Transplant Surgical Center",
    "Custodiol HTK Hypothermic Perfusion",
    28 // 2.8°C
  );
  await tx.wait();

  // Seed Organ 2: ORG-HRT-2094 (Heart, In Transit)
  console.log("Harvesting Organ #2: ORG-HRT-2094 (Heart)...");
  tx = await contract.connect(opo).harvestOrgan(
    "ORG-HRT-2094",
    "Heart (Whole)",
    "DNR-DEL-4412",
    "A+",
    "5/6 HLA-Matched",
    4, // 4 hours safe cold ischemia
    "RCP-9120",
    "All-India Institute Surgical Transplant Center",
    "Celsior Micro-Perfusion Preservation",
    32 // 3.2°C
  );
  await tx.wait();

  tx = await contract.connect(opo).transferCustody(
    "ORG-HRT-2094",
    logistics.address,
    "Organ packed in RFID Cryo-Carrier #CC-881. Transferred to Air Ambulance flight MED-901",
    "Delhi Terminal 1D",
    32
  );
  await tx.wait();

  // Seed Organ 3: ORG-LVR-5512 (Liver, Hospital Received)
  console.log("Harvesting Organ #3: ORG-LVR-5512 (Liver)...");
  tx = await contract.connect(opo).harvestOrgan(
    "ORG-LVR-5512",
    "Liver (Right Lobe)",
    "DNR-BLR-7820",
    "B+",
    "6/6 HLA-Matched",
    12, // 12 hours safe cold ischemia
    "RCP-4491",
    "Apollo Multi-Specialty Transplant Surgical Center",
    "University of Wisconsin (UW) Cold Solution",
    26 // 2.6°C
  );
  await tx.wait();

  tx = await contract.connect(opo).transferCustody(
    "ORG-LVR-5512",
    logistics.address,
    "Handed off to Rapid Medical Courier",
    "Bangalore Trauma Center",
    26
  );
  await tx.wait();

  tx = await contract.connect(logistics).transferCustody(
    "ORG-LVR-5512",
    hospital.address,
    "Delivered to Apollo OR 4. Pre-surgical inspection passed, cold ischemia within safe window",
    "Apollo Surgical Suite, Hyderabad",
    27
  );
  await tx.wait();

  // Seed Organ 4: ORG-COR-3390 (Cornea, Quarantined)
  console.log("Harvesting Organ #4: ORG-COR-3390 (Cornea)...");
  tx = await contract.connect(opo).harvestOrgan(
    "ORG-COR-3390",
    "Cornea Graft",
    "DNR-CHN-6110",
    "AB+",
    "Tissue Crossmatch OK",
    24,
    "RCP-2033",
    "Regional Eye Bank & Surgical Institute",
    "Optisol-GS Storage Medium",
    85 // 8.5°C (Excursion breach)
  );
  await tx.wait();

  tx = await contract.connect(admin).quarantineOrgan(
    "ORG-COR-3390",
    "Thermal Sensor Alert: Reefer temperature spiked above 8.0°C during transshipment. Quarantined for biosafety."
  );
  await tx.wait();

  console.log("✅ All demo organ records harvested and verified on-chain!");

  // Export contract address and ABI
  const contractArtifact = await hre.artifacts.readArtifact("LifeLedger");
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1337,
    abi: contractArtifact.abi,
    deployedAt: new Date().toISOString()
  };

  const clientConfigDir = path.join(__dirname, "../../client/src/config");
  const serverConfigDir = path.join(__dirname, "../../server/src/config");

  if (!fs.existsSync(clientConfigDir)) fs.mkdirSync(clientConfigDir, { recursive: true });
  if (!fs.existsSync(serverConfigDir)) fs.mkdirSync(serverConfigDir, { recursive: true });

  fs.writeFileSync(path.join(clientConfigDir, "contractInfo.json"), JSON.stringify(contractInfo, null, 2));
  fs.writeFileSync(path.join(serverConfigDir, "contractInfo.json"), JSON.stringify(contractInfo, null, 2));

  console.log("📝 Contract configuration exported to client and server config folders.");
  console.log("🎉 LifeLedger deployment complete!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
