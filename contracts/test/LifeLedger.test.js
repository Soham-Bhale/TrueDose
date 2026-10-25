const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LifeLedger Smart Contract — Organ Procurement & Chain-of-Custody Invariants", function () {
  let lifeLedger;
  let admin, opo, logistics, authority, hospital, unapprovedAccount;

  beforeEach(async function () {
    [admin, opo, logistics, authority, hospital, unapprovedAccount] = await ethers.getSigners();

    const LifeLedger = await ethers.getContractFactory("LifeLedger");
    lifeLedger = await LifeLedger.deploy();
    await lifeLedger.waitForDeployment();

    // Register approved consortium stakeholders
    // Roles: 1: Admin, 2: OPO, 3: Logistics, 4: Authority, 5: Hospital
    await lifeLedger.connect(admin).registerParticipant(
      opo.address,
      "National Organ Procurement Network",
      2,
      "Mumbai Trauma Surgical Center"
    );

    await lifeLedger.connect(admin).registerParticipant(
      logistics.address,
      "AeroMed Specialized Organ Logistics",
      3,
      "Air Ambulance Terminal 1D"
    );

    await lifeLedger.connect(admin).registerParticipant(
      authority.address,
      "National Organ & Tissue Allocation Directorate (NOTTO)",
      4,
      "New Delhi Headquarters"
    );

    await lifeLedger.connect(admin).registerParticipant(
      hospital.address,
      "Apollo Multi-Specialty Transplant Surgical Suite",
      5,
      "Hyderabad OR 4"
    );
  });

  describe("A. Organ Harvest & Donor Authorization Invariants", function () {
    it("1. Should allow registered OPO to harvest and record a valid organ", async function () {
      await expect(
        lifeLedger.connect(opo).harvestOrgan(
          "ORG-KID-8041",
          "Kidney",
          "DNR-MUM-9021",
          "O+",
          "6/6 HLA-Matched",
          30,
          "RCP-7704",
          "Apollo Surgical Suite",
          "Custodiol HTK Perfusion",
          28
        )
      ).to.emit(lifeLedger, "OrganHarvested");

      const organ = await lifeLedger.verifyOrgan("ORG-KID-8041");
      expect(organ.exists).to.be.true;
      expect(organ.organType).to.equal("Kidney");
      expect(organ.donorBloodType).to.equal("O+");
      expect(organ.currentCustodian).to.equal(opo.address);
    });

    it("2. LOGICAL ERROR: Should revert if an unapproved account tries to harvest an organ", async function () {
      await expect(
        lifeLedger.connect(unapprovedAccount).harvestOrgan(
          "ORG-ILLEGAL-01",
          "Kidney",
          "DNR-UNKNOWN",
          "O+",
          "None",
          24,
          "RCP-999",
          "Unknown Clinic",
          "None",
          30
        )
      ).to.be.revertedWith("Participant node not approved");
    });

    it("3. LOGICAL ERROR: Should revert if a non-OPO approved role (e.g. Hospital) attempts to harvest", async function () {
      await expect(
        lifeLedger.connect(hospital).harvestOrgan(
          "ORG-HOSP-01",
          "Liver",
          "DNR-123",
          "A+",
          "None",
          12,
          "RCP-123",
          "Hospital Suite",
          "None",
          30
        )
      ).to.be.revertedWith("Unauthorized stakeholder role");
    });

    it("4. LOGICAL ERROR: Should revert on empty Organ ID", async function () {
      await expect(
        lifeLedger.connect(opo).harvestOrgan(
          "",
          "Kidney",
          "DNR-MUM-9021",
          "O+",
          "6/6 Match",
          30,
          "RCP-7704",
          "Hospital",
          "Custodiol",
          28
        )
      ).to.be.revertedWith("Organ ID cannot be empty");
    });

    it("5. LOGICAL ERROR: Should revert on duplicate Organ ID collision", async function () {
      await lifeLedger.connect(opo).harvestOrgan(
        "ORG-KID-DUPLICATE",
        "Kidney",
        "DNR-1",
        "O+",
        "6/6 Match",
        30,
        "RCP-1",
        "Hospital",
        "Custodiol",
        28
      );

      await expect(
        lifeLedger.connect(opo).harvestOrgan(
          "ORG-KID-DUPLICATE",
          "Kidney",
          "DNR-2",
          "A+",
          "5/6 Match",
          30,
          "RCP-2",
          "Hospital",
          "Custodiol",
          28
        )
      ).to.be.revertedWith("Organ ID already registered on ledger");
    });

    it("6. LOGICAL ERROR: Should revert if ischemic limit is zero", async function () {
      await expect(
        lifeLedger.connect(opo).harvestOrgan(
          "ORG-ZERO-ISCHEMIA",
          "Heart",
          "DNR-1",
          "O+",
          "6/6",
          0,
          "RCP-1",
          "Hospital",
          "UW",
          30
        )
      ).to.be.revertedWith("Ischemic limit must be greater than zero");
    });
  });

  describe("B. Chain-of-Custody & State Machine Transition Rules", function () {
    beforeEach(async function () {
      await lifeLedger.connect(opo).harvestOrgan(
        "ORG-TEST-CHAIN",
        "Heart",
        "DNR-DEL-101",
        "A+",
        "6/6 HLA-Matched",
        6,
        "RCP-404",
        "Apollo Hospital OR 4",
        "Celsior Perfusion",
        32
      );
    });

    it("7. Happy Path: Should execute full custody handoff: OPO -> Logistics -> Hospital -> Transplanted", async function () {
      // 1. OPO transfers to Logistics
      await expect(
        lifeLedger.connect(opo).transferCustody(
          "ORG-TEST-CHAIN",
          logistics.address,
          "Packed in AeroMed Cryo-Carrier #CC-12",
          "Mumbai Airport",
          31
        )
      ).to.emit(lifeLedger, "CustodyTransferred");

      let organ = await lifeLedger.verifyOrgan("ORG-TEST-CHAIN");
      expect(organ.currentCustodian).to.equal(logistics.address);
      expect(organ.state).to.equal(1); // InTransit

      // 2. Logistics transfers to Hospital
      await lifeLedger.connect(logistics).transferCustody(
        "ORG-TEST-CHAIN",
        hospital.address,
        "Delivered to Hyderabad Surgical Wing",
        "Hyderabad OR Suite",
        29
      );

      organ = await lifeLedger.verifyOrgan("ORG-TEST-CHAIN");
      expect(organ.currentCustodian).to.equal(hospital.address);
      expect(organ.state).to.equal(3); // HospitalReceived

      // 3. Hospital surgical team completes transplant
      await expect(
        lifeLedger.connect(hospital).completeTransplant(
          "ORG-TEST-CHAIN",
          "Successful graft reperfusion in Recipient RCP-404"
        )
      ).to.emit(lifeLedger, "OrganTransplanted");

      organ = await lifeLedger.verifyOrgan("ORG-TEST-CHAIN");
      expect(organ.state).to.equal(4); // Transplanted
    });

    it("8. LOGICAL ERROR: Non-custodian should not be able to transfer custody", async function () {
      await expect(
        lifeLedger.connect(unapprovedAccount).transferCustody(
          "ORG-TEST-CHAIN",
          logistics.address,
          "Unauthorized transfer",
          "Unknown",
          30
        )
      ).to.be.revertedWith("Only current custodian can transfer");
    });

    it("9. LOGICAL ERROR: Cannot transfer custody to an unregistered or unapproved node", async function () {
      await expect(
        lifeLedger.connect(opo).transferCustody(
          "ORG-TEST-CHAIN",
          unapprovedAccount.address,
          "Illegal trafficking attempt",
          "Black Market",
          30
        )
      ).to.be.revertedWith("Recipient node not approved on consortium");
    });

    it("10. LOGICAL ERROR: Non-hospital cannot perform completeTransplant", async function () {
      await lifeLedger.connect(opo).transferCustody(
        "ORG-TEST-CHAIN",
        logistics.address,
        "Transferred",
        "Airport",
        30
      );

      await expect(
        lifeLedger.connect(logistics).completeTransplant(
          "ORG-TEST-CHAIN",
          "Attempted by courier"
        )
      ).to.be.revertedWith("Unauthorized stakeholder role");
    });
  });

  describe("C. Anti-Trafficking Quarantine & Biosafety Controls", function () {
    beforeEach(async function () {
      await lifeLedger.connect(opo).harvestOrgan(
        "ORG-ALERT-99",
        "Liver",
        "DNR-555",
        "B+",
        "5/6 Match",
        12,
        "RCP-888",
        "Apollo Hospital",
        "UW Solution",
        28
      );
    });

    it("11. Admin or Authority can issue emergency quarantine order", async function () {
      await expect(
        lifeLedger.connect(admin).quarantineOrgan(
          "ORG-ALERT-99",
          "Thermal breach: preservation container exceeded 9.5°C during transit"
        )
      ).to.emit(lifeLedger, "OrganQuarantined");

      const organ = await lifeLedger.verifyOrgan("ORG-ALERT-99");
      expect(organ.isQuarantined).to.be.true;
      expect(organ.state).to.equal(5); // Quarantined
    });

    it("12. LOGICAL ERROR: Quarantined organ cannot be transferred downstream", async function () {
      await lifeLedger.connect(admin).quarantineOrgan(
        "ORG-ALERT-99",
        "Suspected documentation tampering in donor consent"
      );

      await expect(
        lifeLedger.connect(opo).transferCustody(
          "ORG-ALERT-99",
          logistics.address,
          "Attempt to move quarantined organ",
          "Depot",
          28
        )
      ).to.be.revertedWith("Organ is quarantined - custody transfer prohibited");
    });

    it("13. LOGICAL ERROR: Quarantined organ cannot be transplanted into recipient", async function () {
      // First move to hospital
      await lifeLedger.connect(opo).transferCustody(
        "ORG-ALERT-99",
        logistics.address,
        "Transit",
        "Station",
        28
      );
      await lifeLedger.connect(logistics).transferCustody(
        "ORG-ALERT-99",
        hospital.address,
        "Hospital arrival",
        "Hospital OR",
        28
      );

      // Quarantine at hospital
      await lifeLedger.connect(admin).quarantineOrgan(
        "ORG-ALERT-99",
        "Recipient HLA mismatch detected by regulatory audit"
      );

      await expect(
        lifeLedger.connect(hospital).completeTransplant(
          "ORG-ALERT-99",
          "Attempted implantation"
        )
      ).to.be.revertedWith("Quarantined organ cannot be transplanted");
    });
  });

  describe("D. Public Verification & Counterfeit / Unregistered Organ Detection", function () {
    it("14. Verifying an unharvested / unregistered Organ ID returns exists=false", async function () {
      const organ = await lifeLedger.verifyOrgan("ORG-FAKE-9999");
      expect(organ.exists).to.be.false;
    });

    it("15. Requesting custody history for nonexistent organ ID reverts", async function () {
      await expect(
        lifeLedger.getOrganHistory("ORG-NONEXISTENT")
      ).to.be.revertedWith("Organ not registered on blockchain");
    });

    it("16. Should return full custody timeline for legitimate organ", async function () {
      await lifeLedger.connect(opo).harvestOrgan(
        "ORG-TIMELINE-01",
        "Cornea",
        "DNR-901",
        "O+",
        "Direct Crossmatch",
        24,
        "RCP-101",
        "Apollo Hospital",
        "Optisol-GS",
        40
      );

      const history = await lifeLedger.getOrganHistory("ORG-TIMELINE-01");
      expect(history.length).to.equal(1);
      expect(history[0].roleTo).to.equal("Organ Procurement Org");
    });
  });
});
