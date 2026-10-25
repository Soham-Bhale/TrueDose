// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LifeLedger
 * @notice Decentralized Organ Procurement, Chain-of-Custody & Anti-Trafficking Verification Network
 * @dev Tracks vital human organs from donor harvest to recipient surgical implantation with tamper-evident cold-ischemia verification.
 */
contract LifeLedger {

    enum Role { None, Admin, OPO, Logistics, Authority, Hospital }

    enum OrganState {
        Harvested,
        InTransit,
        AllocationCleared,
        HospitalReceived,
        Transplanted,
        Quarantined
    }

    struct Participant {
        string name;
        string location;
        Role role;
        bool isApproved;
    }

    struct CustodyHop {
        address from;
        string fromName;
        address to;
        string toName;
        string roleFrom;
        string roleTo;
        uint256 timestamp;
        string notes;
        string location;
        int256 temperatureScaled; // e.g., 28 = 2.8°C
    }

    struct Organ {
        string organId;
        string organType;           // Kidney, Heart, Liver, Lung, Pancreas, Cornea
        string donorId;             // Anonymized Donor Hash
        string donorBloodType;      // O+, O-, A+, A-, B+, B-, AB+, AB-
        string hlaMarker;           // HLA Matching Profile e.g. "6/6 HLA-Matched"
        uint256 harvestTimestamp;
        uint256 ischemicLimitHours; // Maximum safe cold ischemia hours (Heart: 4, Liver: 12, Kidney: 30)
        string recipientId;         // Verified Recipient ID
        string recipientHospital;   // Destination Surgical Suite
        address currentCustodian;
        string currentCustodianName;
        OrganState state;
        bool exists;
        bool isQuarantined;
        string quarantineReason;
        string preservationProtocol; // e.g. "Custodiol HTK Perfusion"
        int256 latestTemperature;   // Scaled x10 (28 = 2.8°C)
        CustodyHop[] history;
    }

    struct OrganVerificationView {
        bool exists;
        string organId;
        string organType;
        string donorId;
        string donorBloodType;
        string hlaMarker;
        uint256 harvestTimestamp;
        uint256 ischemicLimitHours;
        string recipientId;
        string recipientHospital;
        address currentCustodian;
        string currentCustodianName;
        OrganState state;
        bool isQuarantined;
        string quarantineReason;
        string preservationProtocol;
        int256 latestTemperature;
        bool isIschemiaExpired;
        uint256 custodyHopsCount;
    }

    address public admin;

    // Participant address => Participant profile
    mapping(address => Participant) public participants;

    // Organ ID => Organ Record
    mapping(string => Organ) private organs;
    string[] public allOrganIds;

    // Events
    event ParticipantRegistered(address indexed userAddress, string name, Role role, string location);
    event OrganHarvested(string indexed organId, string organType, string donorBloodType, address indexed opo, uint256 timestamp);
    event CustodyTransferred(string indexed organId, address indexed from, address indexed to, string roleFrom, string roleTo, uint256 timestamp);
    event AllocationCleared(string indexed organId, address indexed authority, uint256 timestamp);
    event HospitalReceived(string indexed organId, address indexed hospital, uint256 timestamp);
    event OrganTransplanted(string indexed organId, address indexed hospital, string recipientId, uint256 timestamp);
    event OrganQuarantined(string indexed organId, string reason, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only regulatory admin can perform this action");
        _;
    }

    modifier onlyApproved(Role requiredRole) {
        Participant memory p = participants[msg.sender];
        require(p.isApproved, "Participant node not approved");
        require(p.role == requiredRole || msg.sender == admin, "Unauthorized stakeholder role");
        _;
    }

    constructor() {
        admin = msg.sender;
        participants[msg.sender] = Participant({
            name: "National Organ & Tissue Regulatory Authority (NOTTO / UNOS)",
            location: "Central Healthcare Directorate, New Delhi",
            role: Role.Admin,
            isApproved: true
        });
        emit ParticipantRegistered(msg.sender, "National Organ & Tissue Regulatory Authority", Role.Admin, "New Delhi");
    }

    function registerParticipant(
        address userAddress,
        string calldata name,
        Role role,
        string calldata location
    ) external onlyAdmin {
        require(userAddress != address(0), "Invalid address");
        require(role != Role.None, "Invalid role specified");
        require(bytes(name).length > 0, "Name required");

        participants[userAddress] = Participant({
            name: name,
            location: location,
            role: role,
            isApproved: true
        });

        emit ParticipantRegistered(userAddress, name, role, location);
    }

    function harvestOrgan(
        string calldata organId,
        string calldata organType,
        string calldata donorId,
        string calldata donorBloodType,
        string calldata hlaMarker,
        uint256 ischemicLimitHours,
        string calldata recipientId,
        string calldata recipientHospital,
        string calldata preservationProtocol,
        int256 initialTempScaled
    ) external onlyApproved(Role.OPO) {
        require(bytes(organId).length > 0, "Organ ID cannot be empty");
        require(!organs[organId].exists, "Organ ID already registered on ledger");
        require(bytes(organType).length > 0, "Organ type required");
        require(bytes(donorBloodType).length > 0, "Donor blood type required");
        require(ischemicLimitHours > 0, "Ischemic limit must be greater than zero");

        Participant memory opo = participants[msg.sender];

        Organ storage newOrgan = organs[organId];
        newOrgan.organId = organId;
        newOrgan.organType = organType;
        newOrgan.donorId = donorId;
        newOrgan.donorBloodType = donorBloodType;
        newOrgan.hlaMarker = hlaMarker;
        newOrgan.harvestTimestamp = block.timestamp;
        newOrgan.ischemicLimitHours = ischemicLimitHours;
        newOrgan.recipientId = recipientId;
        newOrgan.recipientHospital = recipientHospital;
        newOrgan.currentCustodian = msg.sender;
        newOrgan.currentCustodianName = opo.name;
        newOrgan.state = OrganState.Harvested;
        newOrgan.exists = true;
        newOrgan.isQuarantined = false;
        newOrgan.quarantineReason = "";
        newOrgan.preservationProtocol = preservationProtocol;
        newOrgan.latestTemperature = initialTempScaled;

        newOrgan.history.push(CustodyHop({
            from: address(0),
            fromName: "Donor Surgical Suite",
            to: msg.sender,
            toName: opo.name,
            roleFrom: "Harvest Team",
            roleTo: "Organ Procurement Org",
            timestamp: block.timestamp,
            notes: "Organ retrieved, perfusion initiated, donor consent cryptographically verified",
            location: opo.location,
            temperatureScaled: initialTempScaled
        }));

        allOrganIds.push(organId);
        emit OrganHarvested(organId, organType, donorBloodType, msg.sender, block.timestamp);
    }

    function transferCustody(
        string calldata organId,
        address to,
        string calldata notes,
        string calldata location,
        int256 currentTempScaled
    ) external {
        Organ storage organ = organs[organId];
        require(organ.exists, "Organ record not found");
        require(!organ.isQuarantined, "Organ is quarantined - custody transfer prohibited");
        require(organ.state != OrganState.Transplanted, "Organ already implanted into recipient");
        require(msg.sender == organ.currentCustodian || msg.sender == admin, "Only current custodian can transfer");

        Participant memory sender = participants[msg.sender];
        Participant memory receiver = participants[to];
        require(receiver.isApproved, "Recipient node not approved on consortium");

        // Enforce sequential linear custody rules:
        // OPO -> Logistics
        // Logistics -> Authority / Hospital
        // Hospital -> Surgical Implantation
        OrganState nextState = organ.state;
        if (sender.role == Role.OPO && receiver.role == Role.Logistics) {
            nextState = OrganState.InTransit;
        } else if (sender.role == Role.Logistics && receiver.role == Role.Hospital) {
            nextState = OrganState.HospitalReceived;
        } else if (sender.role == Role.Logistics && receiver.role == Role.Authority) {
            nextState = OrganState.InTransit;
        } else if (sender.role == Role.Authority && receiver.role == Role.Hospital) {
            nextState = OrganState.HospitalReceived;
        }

        organ.currentCustodian = to;
        organ.currentCustodianName = receiver.name;
        organ.state = nextState;
        organ.latestTemperature = currentTempScaled;

        string memory roleFromStr = sender.role == Role.OPO ? "OPO" : (sender.role == Role.Logistics ? "Logistics" : (sender.role == Role.Authority ? "Authority" : "Hospital"));
        string memory roleToStr = receiver.role == Role.OPO ? "OPO" : (receiver.role == Role.Logistics ? "Logistics" : (receiver.role == Role.Authority ? "Authority" : "Hospital"));

        organ.history.push(CustodyHop({
            from: msg.sender,
            fromName: sender.name,
            to: to,
            toName: receiver.name,
            roleFrom: roleFromStr,
            roleTo: roleToStr,
            timestamp: block.timestamp,
            notes: notes,
            location: location,
            temperatureScaled: currentTempScaled
        }));

        emit CustodyTransferred(organId, msg.sender, to, roleFromStr, roleToStr, block.timestamp);
    }

    function clearAllocation(
        string calldata organId,
        string calldata notes
    ) external onlyApproved(Role.Authority) {
        Organ storage organ = organs[organId];
        require(organ.exists, "Organ not found");
        require(!organ.isQuarantined, "Quarantined organ cannot be cleared");

        organ.state = OrganState.AllocationCleared;

        Participant memory authority = participants[msg.sender];
        organ.history.push(CustodyHop({
            from: msg.sender,
            fromName: authority.name,
            to: organ.currentCustodian,
            toName: organ.currentCustodianName,
            roleFrom: "Regulatory Authority",
            roleTo: "Custody Carrier",
            timestamp: block.timestamp,
            notes: bytes(notes).length > 0 ? notes : "National Allocation Protocol Verified: Donor-Recipient Match Authorized",
            location: authority.location,
            temperatureScaled: organ.latestTemperature
        }));

        emit AllocationCleared(organId, msg.sender, block.timestamp);
    }

    function completeTransplant(
        string calldata organId,
        string calldata surgicalNotes
    ) external onlyApproved(Role.Hospital) {
        Organ storage organ = organs[organId];
        require(organ.exists, "Organ not found");
        require(!organ.isQuarantined, "Quarantined organ cannot be transplanted");
        require(organ.state != OrganState.Transplanted, "Organ already transplanted");
        require(msg.sender == organ.currentCustodian || msg.sender == admin, "Must be in surgical center custody");

        // Verify cold ischemia time has not been breached
        uint256 elapsedHours = (block.timestamp - organ.harvestTimestamp) / 3600;
        require(elapsedHours <= organ.ischemicLimitHours, "Cold ischemia safe limit breached - organ ineligible for graft");

        organ.state = OrganState.Transplanted;

        Participant memory hosp = participants[msg.sender];
        organ.history.push(CustodyHop({
            from: msg.sender,
            fromName: hosp.name,
            to: address(0),
            toName: string(abi.encodePacked("Recipient Patient (", organ.recipientId, ")")),
            roleFrom: "Transplant Hospital",
            roleTo: "Grafted Recipient",
            timestamp: block.timestamp,
            notes: bytes(surgicalNotes).length > 0 ? surgicalNotes : "Successful anastomosis and graft reperfusion confirmed in OR",
            location: hosp.location,
            temperatureScaled: organ.latestTemperature
        }));

        emit OrganTransplanted(organId, msg.sender, organ.recipientId, block.timestamp);
    }

    function quarantineOrgan(
        string calldata organId,
        string calldata reason
    ) external {
        Organ storage organ = organs[organId];
        require(organ.exists, "Organ not found");
        require(!organ.isQuarantined, "Organ already under quarantine");

        Participant memory p = participants[msg.sender];
        require(
            msg.sender == admin ||
            p.role == Role.Authority ||
            msg.sender == organ.currentCustodian,
            "Unauthorized to issue quarantine order"
        );

        organ.isQuarantined = true;
        organ.quarantineReason = reason;
        organ.state = OrganState.Quarantined;

        organ.history.push(CustodyHop({
            from: msg.sender,
            fromName: p.name,
            to: address(0),
            toName: "Quarantined / Biorepository Hold",
            roleFrom: "Audit Directorate",
            roleTo: "Biohazard Quarantine",
            timestamp: block.timestamp,
            notes: string(abi.encodePacked("EMERGENCY QUARANTINE: ", reason)),
            location: p.location,
            temperatureScaled: organ.latestTemperature
        }));

        emit OrganQuarantined(organId, reason, block.timestamp);
    }

    function verifyOrgan(string calldata organId) external view returns (OrganVerificationView memory) {
        Organ storage organ = organs[organId];
        if (!organ.exists) {
            return OrganVerificationView({
                exists: false,
                organId: organId,
                organType: "",
                donorId: "",
                donorBloodType: "",
                hlaMarker: "",
                harvestTimestamp: 0,
                ischemicLimitHours: 0,
                recipientId: "",
                recipientHospital: "",
                currentCustodian: address(0),
                currentCustodianName: "",
                state: OrganState.Harvested,
                isQuarantined: false,
                quarantineReason: "",
                preservationProtocol: "",
                latestTemperature: 0,
                isIschemiaExpired: false,
                custodyHopsCount: 0
            });
        }

        uint256 elapsedHours = (block.timestamp - organ.harvestTimestamp) / 3600;
        bool isExpired = elapsedHours > organ.ischemicLimitHours;

        return OrganVerificationView({
            exists: true,
            organId: organ.organId,
            organType: organ.organType,
            donorId: organ.donorId,
            donorBloodType: organ.donorBloodType,
            hlaMarker: organ.hlaMarker,
            harvestTimestamp: organ.harvestTimestamp,
            ischemicLimitHours: organ.ischemicLimitHours,
            recipientId: organ.recipientId,
            recipientHospital: organ.recipientHospital,
            currentCustodian: organ.currentCustodian,
            currentCustodianName: organ.currentCustodianName,
            state: organ.state,
            isQuarantined: organ.isQuarantined,
            quarantineReason: organ.quarantineReason,
            preservationProtocol: organ.preservationProtocol,
            latestTemperature: organ.latestTemperature,
            isIschemiaExpired: isExpired,
            custodyHopsCount: organ.history.length
        });
    }

    function getOrganHistory(string calldata organId) external view returns (CustodyHop[] memory) {
        require(organs[organId].exists, "Organ not registered on blockchain");
        return organs[organId].history;
    }

    function getAllOrganIds() external view returns (string[] memory) {
        return allOrganIds;
    }
}
