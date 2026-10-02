const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of TrueDose PharmaSupplyChain contract...");

  const [admin, manufacturer, distributor, wholesaler, pharmacy, otherUser] = await hre.ethers.getSigners();

  console.log("Admin deployer address:", admin.address);
  console.log("Manufacturer address:", manufacturer.address);
  console.log("Distributor address:", distributor.address);
  console.log("Wholesaler address:", wholesaler.address);
  console.log("Pharmacy address:", pharmacy.address);

  const PharmaSupplyChain = await hre.ethers.getContractFactory("PharmaSupplyChain");
  const contract = await PharmaSupplyChain.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ PharmaSupplyChain deployed at:", contractAddress);

  // Register participants
  console.log("Registering supply chain participants...");
  // 1: Admin, 2: Manufacturer, 3: Distributor, 4: Wholesaler, 5: Pharmacy
  let tx = await contract.connect(admin).registerParticipant(
    manufacturer.address,
    "ABC Pharma Ltd.",
    "Industrial Area Unit 4, Mumbai, India",
    2 // Manufacturer
  );
  await tx.wait();

  tx = await contract.connect(admin).registerParticipant(
    distributor.address,
    "Apex Logistics & Distribution",
    "Cold Chain Hub 12, Pune, India",
    3 // Distributor
  );
  await tx.wait();

  tx = await contract.connect(admin).registerParticipant(
    wholesaler.address,
    "Metro Health Wholesalers",
    "Regional Depot 9, Bangalore, India",
    4 // Wholesaler
  );
  await tx.wait();

  tx = await contract.connect(admin).registerParticipant(
    pharmacy.address,
    "HealthPlus Community Pharmacy",
    "MG Road Branch, Hyderabad, India",
    5 // Pharmacy
  );
  await tx.wait();

  console.log("✅ All participants registered on blockchain!");

  // Create demo batch PCM001 as specified in user request
  const mfgDate = Math.floor(new Date("2026-09-01T00:00:00Z").getTime() / 1000);
  const expDate = Math.floor(new Date("2028-08-31T23:59:59Z").getTime() / 1000);

  console.log("Creating initial batch PCM001 (Paracetamol 500mg)...");
  tx = await contract.connect(manufacturer).createBatch(
    "PCM001",
    "Paracetamol",
    "500 mg",
    5000,
    mfgDate,
    expDate,
    "Manufactured under Good Manufacturing Practice (GMP) certificate #IN-GMP-8821"
  );
  await tx.wait();
  console.log("✅ Batch PCM001 created on-chain!");

  // Also create a second batch that is already expired for demonstration: EXP-902
  const oldMfgDate = Math.floor(new Date("2023-01-01T00:00:00Z").getTime() / 1000);
  const oldExpDate = Math.floor(new Date("2025-01-01T00:00:00Z").getTime() / 1000);
  tx = await contract.connect(manufacturer).createBatch(
    "EXP902",
    "Amoxicillin Trihydrate",
    "250 mg",
    1200,
    oldMfgDate,
    oldExpDate,
    "Archival batch created for expiry alert demonstration"
  );
  await tx.wait();
  console.log("✅ Demo expired batch EXP902 created on-chain!");

  // Also create an advanced batch AMX404 moved up to Wholesaler to demonstrate in-transit state
  const amxMfgDate = Math.floor(new Date("2026-08-15T00:00:00Z").getTime() / 1000);
  const amxExpDate = Math.floor(new Date("2027-12-31T00:00:00Z").getTime() / 1000);
  tx = await contract.connect(manufacturer).createBatch(
    "AMX404",
    "Azithromycin",
    "500 mg",
    3000,
    amxMfgDate,
    amxExpDate,
    "Anti-infective batch - Quality cleared"
  );
  await tx.wait();

  // Move AMX404 to Distributor
  tx = await contract.connect(manufacturer).transferToDistributor(
    "AMX404",
    distributor.address,
    "Dispatched via Temperature-controlled Reefer Container #TR-402"
  );
  await tx.wait();

  // Move AMX404 to Wholesaler
  tx = await contract.connect(distributor).transferToWholesaler(
    "AMX404",
    wholesaler.address,
    "Inspected batch integrity at distribution hub. Transferred to regional warehouse."
  );
  await tx.wait();

  console.log("✅ Batch AMX404 moved to Wholesaler on-chain!");

  // Save contract artifact and deployment details
  const artifactPath = path.join(__dirname, "../artifacts/contracts/PharmaSupplyChain.sol/PharmaSupplyChain.json");
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const deploymentData = {
    address: contractAddress,
    abi: contractArtifact.abi,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1337,
    deployedAt: new Date().toISOString(),
    accounts: {
      admin: admin.address,
      manufacturer: manufacturer.address,
      distributor: distributor.address,
      wholesaler: wholesaler.address,
      pharmacy: pharmacy.address,
      other: otherUser.address,
    },
    demoBatches: ["PCM001", "EXP902", "AMX404"]
  };

  // Write to server config
  const serverConfigDir = path.join(__dirname, "../../server/src/config");
  if (!fs.existsSync(serverConfigDir)) {
    fs.mkdirSync(serverConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(serverConfigDir, "contractInfo.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Write to client config
  const clientConfigDir = path.join(__dirname, "../../client/src/config");
  if (!fs.existsSync(clientConfigDir)) {
    fs.mkdirSync(clientConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(clientConfigDir, "contractInfo.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("📄 Saved contract details to server & client config!");
  console.log("🎉 TrueDose setup & deployment completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
