const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharmaSupplyChain Smart Contract", function () {
  let contract;
  let admin, manufacturer, distributor, wholesaler, pharmacy, unauthorized;

  const mfgDate = Math.floor(new Date("2026-09-01T00:00:00Z").getTime() / 1000);
  const expDate = Math.floor(new Date("2028-08-31T23:59:59Z").getTime() / 1000);

  beforeEach(async function () {
    [admin, manufacturer, distributor, wholesaler, pharmacy, unauthorized] = await ethers.getSigners();

    const PharmaSupplyChain = await ethers.getContractFactory("PharmaSupplyChain");
    contract = await PharmaSupplyChain.deploy();
    await contract.waitForDeployment();

    // Register participants
    // 2: Manufacturer, 3: Distributor, 4: Wholesaler, 5: Pharmacy
    await contract.connect(admin).registerParticipant(manufacturer.address, "ABC Pharma Ltd.", "Mumbai", 2);
    await contract.connect(admin).registerParticipant(distributor.address, "Apex Logistics", "Pune", 3);
    await contract.connect(admin).registerParticipant(wholesaler.address, "Metro Wholesalers", "Bangalore", 4);
    await contract.connect(admin).registerParticipant(pharmacy.address, "HealthPlus Pharmacy", "Hyderabad", 5);
  });

  it("1. Should allow registered Manufacturer to create a medicine batch (PCM001)", async function () {
    await contract.connect(manufacturer).createBatch(
      "PCM001",
      "Paracetamol",
      "500 mg",
      5000,
      mfgDate,
      expDate,
      "QA purity certified 99.8%"
    );

    const batch = await contract.verifyBatch("PCM001");
    expect(batch.exists).to.be.true;
    expect(batch.batchId).to.equal("PCM001");
    expect(batch.medicineName).to.equal("Paracetamol");
    expect(batch.currentOwner).to.equal(manufacturer.address);
    expect(batch.state).to.equal(0); // Manufactured
    expect(batch.isExpired).to.be.false;
  });

  it("2. Should prevent unauthorized addresses from creating batches", async function () {
    await expect(
      contract.connect(unauthorized).createBatch(
        "FAKE001",
        "Fake Drug",
        "100 mg",
        1000,
        mfgDate,
        expDate,
        "Malicious batch"
      )
    ).to.be.revertedWith("Participant not approved");
  });

  it("3. Should complete full supply chain custody transfer: Mfg -> Dist -> Wholesaler -> Pharmacy -> Customer", async function () {
    // 1. Create batch
    await contract.connect(manufacturer).createBatch(
      "PCM001",
      "Paracetamol",
      "500 mg",
      5000,
      mfgDate,
      expDate,
      "Initial production"
    );

    // 2. Transfer: Manufacturer -> Distributor
    await contract.connect(manufacturer).transferToDistributor(
      "PCM001",
      distributor.address,
      "Cold-chain truck #DL-8802"
    );
    let batch = await contract.verifyBatch("PCM001");
    expect(batch.currentOwner).to.equal(distributor.address);
    expect(batch.state).to.equal(1); // DistributorReceived

    // 3. Transfer: Distributor -> Wholesaler
    await contract.connect(distributor).transferToWholesaler(
      "PCM001",
      wholesaler.address,
      "Regional depot transit"
    );
    batch = await contract.verifyBatch("PCM001");
    expect(batch.currentOwner).to.equal(wholesaler.address);
    expect(batch.state).to.equal(2); // WholesalerReceived

    // 4. Transfer: Wholesaler -> Pharmacy
    await contract.connect(wholesaler).transferToPharmacy(
      "PCM001",
      pharmacy.address,
      "Retail consignment delivery"
    );
    batch = await contract.verifyBatch("PCM001");
    expect(batch.currentOwner).to.equal(pharmacy.address);
    expect(batch.state).to.equal(3); // PharmacyReceived

    // 5. Dispense: Pharmacy -> Customer
    await contract.connect(pharmacy).markAsSold(
      "PCM001",
      "Dispensed with prescription #RX-1029"
    );
    batch = await contract.verifyBatch("PCM001");
    expect(batch.state).to.equal(4); // SoldToCustomer

    // Verify history audit length
    const history = await contract.getBatchHistory("PCM001");
    expect(history.length).to.equal(5);
  });

  it("4. Should reject illegal transfer jumps (e.g. Manufacturer trying to transfer to Wholesaler directly)", async function () {
    await contract.connect(manufacturer).createBatch(
      "PCM001",
      "Paracetamol",
      "500 mg",
      5000,
      mfgDate,
      expDate,
      "Created"
    );

    // Should fail when trying to transfer to Wholesaler when stage requires Distributor
    await expect(
      contract.connect(manufacturer).transferToWholesaler(
        "PCM001",
        wholesaler.address,
        "Illegal jump"
      )
    ).to.be.revertedWith("Invalid stage: must be with Distributor");
  });

  it("5. Should support emergency recall by Admin or Manufacturer", async function () {
    await contract.connect(manufacturer).createBatch(
      "PCM001",
      "Paracetamol",
      "500 mg",
      5000,
      mfgDate,
      expDate,
      "Created"
    );

    await contract.connect(admin).recallBatch("PCM001", "Contamination detected at QA facility");
    const batch = await contract.verifyBatch("PCM001");
    expect(batch.isRecalled).to.be.true;
    expect(batch.recallReason).to.equal("Contamination detected at QA facility");
  });
});
