// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PharmaSupplyChain
 * @notice Tamper-evident, blockchain-based pharmaceutical supply chain tracking and verification
 */
contract PharmaSupplyChain {

    enum Role { None, Admin, Manufacturer, Distributor, Wholesaler, Pharmacy }

    enum BatchState {
        Manufactured,
        DistributorReceived,
        WholesalerReceived,
        PharmacyReceived,
        SoldToCustomer,
        Recalled
    }

    struct Participant {
        string name;
        string location;
        Role role;
        bool isApproved;
    }

    struct TransferRecord {
        address from;
        string fromName;
        address to;
        string toName;
        string roleFrom;
        string roleTo;
        uint256 timestamp;
        string notes;
        string location;
    }

    struct MedicineBatch {
        string batchId;
        string medicineName;
        string dosage;
        uint256 quantity;
        address manufacturer;
        string manufacturerName;
        uint256 manufacturingDate;
        uint256 expiryDate;
        address currentOwner;
        BatchState state;
        bool exists;
        bool isRecalled;
        string recallReason;
        TransferRecord[] history;
    }

    struct BatchVerificationView {
        bool exists;
        string batchId;
        string medicineName;
        string dosage;
        uint256 quantity;
        address manufacturer;
        string manufacturerName;
        uint256 manufacturingDate;
        uint256 expiryDate;
        address currentOwner;
        BatchState state;
        bool isRecalled;
        string recallReason;
        bool isExpired;
        uint256 transferCount;
    }

    address public admin;

    // Participant address => Participant
    mapping(address => Participant) public participants;

    // Batch ID => MedicineBatch
    mapping(string => MedicineBatch) private batches;
    string[] public allBatchIds;

    // Events
    event ParticipantRegistered(address indexed userAddress, string name, Role role, string location);
    event BatchCreated(string indexed batchId, string medicineName, address indexed manufacturer, string manufacturerName, uint256 mfgDate, uint256 expDate);
    event BatchTransferred(string indexed batchId, address indexed from, address indexed to, string roleFrom, string roleTo, uint256 timestamp);
    event BatchReceived(string indexed batchId, address indexed receiver, BatchState newState, uint256 timestamp);
    event BatchSold(string indexed batchId, address indexed pharmacy, uint256 timestamp);
    event BatchRecalled(string indexed batchId, string reason, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApproved(Role requiredRole) {
        Participant memory p = participants[msg.sender];
        require(p.isApproved, "Participant not approved");
        require(p.role == requiredRole || msg.sender == admin, "Unauthorized role for action");
        _;
    }

    constructor() {
        admin = msg.sender;
        participants[msg.sender] = Participant({
            name: "TrueDose Regulatory Admin",
            location: "Central Healthcare Authority",
            role: Role.Admin,
            isApproved: true
        });
        emit ParticipantRegistered(msg.sender, "TrueDose Regulatory Admin", Role.Admin, "Central Healthcare Authority");
    }

    // Role Registration
    function registerParticipant(
        address _account,
        string memory _name,
        string memory _location,
        Role _role
    ) external onlyAdmin {
        require(_account != address(0), "Invalid address");
        require(_role != Role.None, "Invalid role");

        participants[_account] = Participant({
            name: _name,
            location: _location,
            role: _role,
            isApproved: true
        });

        emit ParticipantRegistered(_account, _name, _role, _location);
    }

    function getParticipant(address _account) external view returns (string memory name, string memory location, Role role, bool isApproved) {
        Participant memory p = participants[_account];
        return (p.name, p.location, p.role, p.isApproved);
    }

    // 1. Manufacturer Creates Batch
    function createBatch(
        string memory _batchId,
        string memory _medicineName,
        string memory _dosage,
        uint256 _quantity,
        uint256 _manufacturingDate,
        uint256 _expiryDate,
        string memory _initialNotes
    ) external onlyApproved(Role.Manufacturer) {
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(!batches[_batchId].exists, "Batch ID already exists");
        require(_expiryDate > _manufacturingDate, "Expiry date must be after manufacturing date");
        require(_quantity > 0, "Quantity must be greater than zero");

        Participant memory mfg = participants[msg.sender];

        MedicineBatch storage newBatch = batches[_batchId];
        newBatch.batchId = _batchId;
        newBatch.medicineName = _medicineName;
        newBatch.dosage = _dosage;
        newBatch.quantity = _quantity;
        newBatch.manufacturer = msg.sender;
        newBatch.manufacturerName = mfg.name;
        newBatch.manufacturingDate = _manufacturingDate;
        newBatch.expiryDate = _expiryDate;
        newBatch.currentOwner = msg.sender;
        newBatch.state = BatchState.Manufactured;
        newBatch.exists = true;
        newBatch.isRecalled = false;

        newBatch.history.push(TransferRecord({
            from: address(0),
            fromName: "Production Facility",
            to: msg.sender,
            toName: mfg.name,
            roleFrom: "Genesis / QA",
            roleTo: "Manufacturer",
            timestamp: block.timestamp,
            notes: bytes(_initialNotes).length > 0 ? _initialNotes : "Batch formulated and QA certified",
            location: mfg.location
        }));

        allBatchIds.push(_batchId);

        emit BatchCreated(_batchId, _medicineName, msg.sender, mfg.name, _manufacturingDate, _expiryDate);
    }

    // 2. Transfer: Manufacturer -> Distributor
    function transferToDistributor(
        string memory _batchId,
        address _distributor,
        string memory _notes
    ) external {
        MedicineBatch storage batch = batches[_batchId];
        require(batch.exists, "Batch not found");
        require(!batch.isRecalled, "Batch is recalled");
        require(batch.currentOwner == msg.sender, "Only current owner can transfer");
        require(batch.state == BatchState.Manufactured, "Invalid stage: must be in Manufactured state");

        Participant memory dist = participants[_distributor];
        require(dist.isApproved && dist.role == Role.Distributor, "Recipient must be approved Distributor");

        Participant memory sender = participants[msg.sender];

        batch.currentOwner = _distributor;
        batch.state = BatchState.DistributorReceived;

        batch.history.push(TransferRecord({
            from: msg.sender,
            fromName: sender.name,
            to: _distributor,
            toName: dist.name,
            roleFrom: "Manufacturer",
            roleTo: "Distributor",
            timestamp: block.timestamp,
            notes: _notes,
            location: dist.location
        }));

        emit BatchTransferred(_batchId, msg.sender, _distributor, "Manufacturer", "Distributor", block.timestamp);
    }

    // 3. Transfer: Distributor -> Wholesaler
    function transferToWholesaler(
        string memory _batchId,
        address _wholesaler,
        string memory _notes
    ) external {
        MedicineBatch storage batch = batches[_batchId];
        require(batch.exists, "Batch not found");
        require(!batch.isRecalled, "Batch is recalled");
        require(batch.currentOwner == msg.sender, "Only current owner can transfer");
        require(batch.state == BatchState.DistributorReceived, "Invalid stage: must be with Distributor");

        Participant memory wh = participants[_wholesaler];
        require(wh.isApproved && wh.role == Role.Wholesaler, "Recipient must be approved Wholesaler");

        Participant memory sender = participants[msg.sender];

        batch.currentOwner = _wholesaler;
        batch.state = BatchState.WholesalerReceived;

        batch.history.push(TransferRecord({
            from: msg.sender,
            fromName: sender.name,
            to: _wholesaler,
            toName: wh.name,
            roleFrom: "Distributor",
            roleTo: "Wholesaler",
            timestamp: block.timestamp,
            notes: _notes,
            location: wh.location
        }));

        emit BatchTransferred(_batchId, msg.sender, _wholesaler, "Distributor", "Wholesaler", block.timestamp);
    }

    // 4. Transfer: Wholesaler -> Pharmacy
    function transferToPharmacy(
        string memory _batchId,
        address _pharmacy,
        string memory _notes
    ) external {
        MedicineBatch storage batch = batches[_batchId];
        require(batch.exists, "Batch not found");
        require(!batch.isRecalled, "Batch is recalled");
        require(batch.currentOwner == msg.sender, "Only current owner can transfer");
        require(batch.state == BatchState.WholesalerReceived, "Invalid stage: must be with Wholesaler");

        Participant memory ph = participants[_pharmacy];
        require(ph.isApproved && ph.role == Role.Pharmacy, "Recipient must be approved Pharmacy");

        Participant memory sender = participants[msg.sender];

        batch.currentOwner = _pharmacy;
        batch.state = BatchState.PharmacyReceived;

        batch.history.push(TransferRecord({
            from: msg.sender,
            fromName: sender.name,
            to: _pharmacy,
            toName: ph.name,
            roleFrom: "Wholesaler",
            roleTo: "Pharmacy",
            timestamp: block.timestamp,
            notes: _notes,
            location: ph.location
        }));

        emit BatchTransferred(_batchId, msg.sender, _pharmacy, "Wholesaler", "Pharmacy", block.timestamp);
    }

    // 5. Dispense: Pharmacy -> Customer
    function markAsSold(string memory _batchId, string memory _customerNotes) external {
        MedicineBatch storage batch = batches[_batchId];
        require(batch.exists, "Batch not found");
        require(!batch.isRecalled, "Batch is recalled");
        require(batch.currentOwner == msg.sender, "Only current pharmacy owner can dispense");
        require(batch.state == BatchState.PharmacyReceived, "Batch must be received by Pharmacy before selling");

        Participant memory pharmacy = participants[msg.sender];

        batch.state = BatchState.SoldToCustomer;

        batch.history.push(TransferRecord({
            from: msg.sender,
            fromName: pharmacy.name,
            to: address(0),
            toName: "End Consumer / Patient",
            roleFrom: "Pharmacy",
            roleTo: "Customer",
            timestamp: block.timestamp,
            notes: bytes(_customerNotes).length > 0 ? _customerNotes : "Dispensed to customer with prescription",
            location: pharmacy.location
        }));

        emit BatchSold(_batchId, msg.sender, block.timestamp);
    }

    // 6. Emergency Recall (Manufacturer or Admin)
    function recallBatch(string memory _batchId, string memory _reason) external {
        MedicineBatch storage batch = batches[_batchId];
        require(batch.exists, "Batch not found");
        require(msg.sender == admin || msg.sender == batch.manufacturer, "Only admin or manufacturer can recall");

        batch.isRecalled = true;
        batch.recallReason = _reason;
        batch.state = BatchState.Recalled;

        batch.history.push(TransferRecord({
            from: msg.sender,
            fromName: msg.sender == admin ? "Regulatory Admin" : batch.manufacturerName,
            to: address(0),
            toName: "Recalled Quarantine",
            roleFrom: msg.sender == admin ? "Admin" : "Manufacturer",
            roleTo: "Recall Notice",
            timestamp: block.timestamp,
            notes: _reason,
            location: "Global Quarantine"
        }));

        emit BatchRecalled(_batchId, _reason, block.timestamp);
    }

    // PUBLIC VERIFICATION (Returns struct view)
    function verifyBatch(string memory _batchId) external view returns (BatchVerificationView memory viewData) {
        MedicineBatch storage b = batches[_batchId];
        if (!b.exists) {
            viewData.exists = false;
            return viewData;
        }

        viewData.exists = true;
        viewData.batchId = b.batchId;
        viewData.medicineName = b.medicineName;
        viewData.dosage = b.dosage;
        viewData.quantity = b.quantity;
        viewData.manufacturer = b.manufacturer;
        viewData.manufacturerName = b.manufacturerName;
        viewData.manufacturingDate = b.manufacturingDate;
        viewData.expiryDate = b.expiryDate;
        viewData.currentOwner = b.currentOwner;
        viewData.state = b.state;
        viewData.isRecalled = b.isRecalled;
        viewData.recallReason = b.recallReason;
        viewData.isExpired = block.timestamp >= b.expiryDate;
        viewData.transferCount = b.history.length;
    }

    function getBatchHistory(string memory _batchId) external view returns (TransferRecord[] memory) {
        require(batches[_batchId].exists, "Batch not found");
        return batches[_batchId].history;
    }

    function getAllBatchCount() external view returns (uint256) {
        return allBatchIds.length;
    }

    function getAllBatchIds() external view returns (string[] memory) {
        return allBatchIds;
    }
}
