const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharmaSupplyChain Smart Contract — Comprehensive Security & Invariant Suite", function () {
  let contract;
  let admin, manufacturer, distributor, wholesaler, pharmacy, unauthorized, attacker;

  const mfgDate = Math.floor(new Date("2026-09-01T00:00:00Z").getTime() / 1000);
  const expDate = Math.floor(new Date("2028-08-31T23:59:59Z").getTime() / 1000);

  beforeEach(async function () {
    [admin, manufacturer, distributor, wholesaler, pharmacy, unauthorized, attacker] = await ethers.getSigners();

    const PharmaSupplyChain = await ethers.getContractFactory("PharmaSupplyChain");
    contract = await PharmaSupplyChain.deploy();
    await contract.waitForDeployment();

    // Register approved supply chain entities
    // 2: Manufacturer, 3: Distributor, 4: Wholesaler, 5: Pharmacy
    await contract.connect(admin).registerParticipant(manufacturer.address, "ABC Pharma Ltd.", "Mumbai", 2);
    await contract.connect(admin).registerParticipant(distributor.address, "Apex Logistics", "Pune", 3);
    await contract.connect(admin).registerParticipant(wholesaler.address, "Metro Wholesalers", "Bangalore", 4);
    await contract.connect(admin).registerParticipant(pharmacy.address, "HealthPlus Pharmacy", "Hyderabad", 5);
  });

  describe("A. Batch Creation & Input Validation Invariants", function () {
    it("1. Should allow registered Manufacturer to create a valid batch (PCM001)", async function () {
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
      expect(batch.isRecalled).to.be.false;
    });

    it("2. LOGICAL ERROR: Should revert if an unapproved account tries to create a batch", async function () {
      await expect(
        contract.connect(unauthorized).createBatch(
          "UNAUTH01",
          "Illicit Drug",
          "500 mg",
          1000,
          mfgDate,
          expDate,
          "Unapproved entity attempt"
        )
      ).to.be.revertedWith("Participant not approved");
    });

    it("3. LOGICAL ERROR: Should revert if an approved non-manufacturer role (e.g. Pharmacy) tries to mint a batch", async function () {
      await expect(
        contract.connect(pharmacy).createBatch(
          "PHARM_MINT",
          "Paracetamol",
          "500 mg",
          1000,
          mfgDate,
          expDate,
          "Pharmacy cannot mint genesis batches"
        )
      ).to.be.revertedWith("Unauthorized role for action");
    });

    it("4. LOGICAL ERROR: Should revert on empty Batch ID", async function () {
      await expect(
        contract.connect(manufacturer).createBatch(
          "",
          "Paracetamol",
          "500 mg",
          5000,
          mfgDate,
          expDate,
          "Empty ID"
        )
      ).to.be.revertedWith("Batch ID cannot be empty");
    });

    it("5. LOGICAL ERROR: Should revert on duplicate Batch ID collision", async function () {
      await contract.connect(manufacturer).createBatch(
        "PCM001",
        "Paracetamol",
        "500 mg",
        5000,
        mfgDate,
        expDate,
        "First batch"
      );

      await expect(
        contract.connect(manufacturer).createBatch(
          "PCM001",
          "Paracetamol Clone",
          "500 mg",
          2000,
          mfgDate,
          expDate,
          "Duplicate collision attempt"
        )
      ).to.be.revertedWith("Batch ID already exists");
    });

    it("6. LOGICAL ERROR: Should revert if expiry date is before or equal to manufacturing date", async function () {
      const invalidExpDate = mfgDate - 1000;
      await expect(
        contract.connect(manufacturer).createBatch(
          "INV_DATE",
          "Paracetamol",
          "500 mg",
          5000,
          mfgDate,
          invalidExpDate,
          "Invalid dates"
        )
      ).to.be.revertedWith("Expiry date must be after manufacturing date");
    });

    it("7. LOGICAL ERROR: Should revert on zero quantity", async function () {
      await expect(
        contract.connect(manufacturer).createBatch(
          "ZERO_QTY",
          "Paracetamol",
          "500 mg",
          0,
          mfgDate,
          expDate,
          "Zero quantity"
        )
      ).to.be.revertedWith("Quantity must be greater than zero");
    });
  });

  describe("B. Sequential Supply Chain Custody & Ownership Rules", function () {
    beforeEach(async function () {
      await contract.connect(manufacturer).createBatch(
        "PCM001",
        "Paracetamol",
        "500 mg",
        5000,
        mfgDate,
        expDate,
        "Genesis production"
      );
    });

    it("8. Happy Path: Should complete full linear sequence: Mfg -> Dist -> Wholesaler -> Pharmacy -> Customer", async function () {
      // Step 1: Mfg -> Dist
      await contract.connect(manufacturer).transferToDistributor("PCM001", distributor.address, "Reefer cold truck #TR-101");
      let batch = await contract.verifyBatch("PCM001");
      expect(batch.currentOwner).to.equal(distributor.address);
      expect(batch.state).to.equal(1); // DistributorReceived

      // Step 2: Dist -> Wholesaler
      await contract.connect(distributor).transferToWholesaler("PCM001", wholesaler.address, "Regional warehouse handover");
      batch = await contract.verifyBatch("PCM001");
      expect(batch.currentOwner).to.equal(wholesaler.address);
      expect(batch.state).to.equal(2); // WholesalerReceived

      // Step 3: Wholesaler -> Pharmacy
      await contract.connect(wholesaler).transferToPharmacy("PCM001", pharmacy.address, "Retail store delivery");
      batch = await contract.verifyBatch("PCM001");
      expect(batch.currentOwner).to.equal(pharmacy.address);
      expect(batch.state).to.equal(3); // PharmacyReceived

      // Step 4: Pharmacy -> Customer
      await contract.connect(pharmacy).markAsSold("PCM001", "Dispensed with doctor prescription #RX-9912");
      batch = await contract.verifyBatch("PCM001");
      expect(batch.state).to.equal(4); // SoldToCustomer

      // Full audit trail verification
      const history = await contract.getBatchHistory("PCM001");
      expect(history.length).to.equal(5);
      expect(history[0].roleTo).to.equal("Manufacturer");
      expect(history[1].roleTo).to.equal("Distributor");
      expect(history[2].roleTo).to.equal("Wholesaler");
      expect(history[3].roleTo).to.equal("Pharmacy");
      expect(history[4].roleTo).to.equal("Customer");
    });

    it("9. LOGICAL ERROR: Non-owner should not be able to transfer a batch", async function () {
      await expect(
        contract.connect(attacker).transferToDistributor("PCM001", distributor.address, "Attacker transfer attempt")
      ).to.be.revertedWith("Only current owner can transfer");
    });

    it("10. LOGICAL ERROR: Skipping steps (Mfg trying to transfer to Wholesaler directly) must revert", async function () {
      await expect(
        contract.connect(manufacturer).transferToWholesaler("PCM001", wholesaler.address, "Illegal jump")
      ).to.be.revertedWith("Invalid stage: must be with Distributor");
    });

    it("11. LOGICAL ERROR: Skipping steps (Mfg trying to transfer to Pharmacy directly) must revert", async function () {
      await expect(
        contract.connect(manufacturer).transferToPharmacy("PCM001", pharmacy.address, "Illegal jump")
      ).to.be.revertedWith("Invalid stage: must be with Wholesaler");
    });

    it("12. LOGICAL ERROR: Transferring to an unapproved or incorrect recipient role must revert", async function () {
      await expect(
        contract.connect(manufacturer).transferToDistributor("PCM001", unauthorized.address, "Unapproved recipient")
      ).to.be.revertedWith("Recipient must be approved Distributor");
    });

    it("13. LOGICAL ERROR: Double transfer attempt (after transferring, previous owner cannot transfer again)", async function () {
      await contract.connect(manufacturer).transferToDistributor("PCM001", distributor.address, "Valid first transfer");

      // Manufacturer no longer owns the batch
      await expect(
        contract.connect(manufacturer).transferToDistributor("PCM001", distributor.address, "Re-transfer attempt")
      ).to.be.revertedWith("Only current owner can transfer");
    });

    it("14. LOGICAL ERROR: Premature dispensing (marking as sold before reaching Pharmacy) must revert", async function () {
      await expect(
        contract.connect(pharmacy).markAsSold("PCM001", "Premature dispensing attempt")
      ).to.be.revertedWith("Only current pharmacy owner can dispense");
    });
  });

  describe("C. Emergency Recall & Quarantine Rules", function () {
    beforeEach(async function () {
      await contract.connect(manufacturer).createBatch(
        "PCM001",
        "Paracetamol",
        "500 mg",
        5000,
        mfgDate,
        expDate,
        "Genesis production"
      );
    });

    it("15. Admin or Manufacturer can issue an emergency recall", async function () {
      await contract.connect(admin).recallBatch("PCM001", "Contamination detected at analytical QA lab");
      const batch = await contract.verifyBatch("PCM001");
      expect(batch.isRecalled).to.be.true;
      expect(batch.recallReason).to.equal("Contamination detected at analytical QA lab");
      expect(batch.state).to.equal(5); // Recalled
    });

    it("16. LOGICAL ERROR: Unauthorized party cannot recall a batch", async function () {
      await expect(
        contract.connect(attacker).recallBatch("PCM001", "Malicious recall order")
      ).to.be.revertedWith("Only admin or manufacturer can recall");
    });

    it("17. LOGICAL ERROR: Recalled batch cannot be transferred downstream", async function () {
      await contract.connect(admin).recallBatch("PCM001", "Emergency safety notice");

      await expect(
        contract.connect(manufacturer).transferToDistributor("PCM001", distributor.address, "Attempt to move quarantined batch")
      ).to.be.revertedWith("Batch is recalled");
    });

    it("18. LOGICAL ERROR: Recalled batch cannot be dispensed to customer", async function () {
      // Move to pharmacy first
      await contract.connect(manufacturer).transferToDistributor("PCM001", distributor.address, "Legit move");
      await contract.connect(distributor).transferToWholesaler("PCM001", wholesaler.address, "Legit move");
      await contract.connect(wholesaler).transferToPharmacy("PCM001", pharmacy.address, "Legit move");

      // Now recall
      await contract.connect(admin).recallBatch("PCM001", "Post-delivery defect discovered");

      await expect(
        contract.connect(pharmacy).markAsSold("PCM001", "Attempt to sell recalled medicine")
      ).to.be.revertedWith("Batch is recalled");
    });
  });

  describe("D. Public Verification & Counterfeit Detection", function () {
    it("19. Verifying nonexistent batch ID returns exists=false (Anti-Counterfeit Protection)", async function () {
      const result = await contract.verifyBatch("FAKE999");
      expect(result.exists).to.be.false;
      expect(result.batchId).to.equal("");
    });

    it("20. Requesting history of nonexistent batch reverts", async function () {
      await expect(
        contract.getBatchHistory("NONEXISTENT")
      ).to.be.revertedWith("Batch not found");
    });

    it("21. Past expiry date must be automatically flagged as expired", async function () {
      // Past dates: manufactured 2023, expired Jan 2025
      const pastMfg = Math.floor(new Date("2023-01-01T00:00:00Z").getTime() / 1000);
      const pastExp = Math.floor(new Date("2025-01-01T00:00:00Z").getTime() / 1000);

      await contract.connect(manufacturer).createBatch(
        "EXP902",
        "Amoxicillin",
        "250 mg",
        1000,
        pastMfg,
        pastExp,
        "Expired lot demonstration"
      );

      const batch = await contract.verifyBatch("EXP902");
      expect(batch.exists).to.be.true;
      expect(batch.isExpired).to.be.true;
    });
  });
});
