import React, { useState, useEffect } from 'react';
import {
  Plus, Truck, QrCode, ShieldAlert, HeartHandshake, Eye, RefreshCw,
  Building2, UserCheck, Award, Search, Thermometer, AlertTriangle,
  Clock, Activity, CheckCircle2, Shield, FileCheck, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateBatchModal from '../components/CreateBatchModal';
import TransferModal from '../components/TransferModal';
import QRCodeModal from '../components/QRCodeModal';
import CertificateModal from '../components/CertificateModal';

const ROLE_ICONS = {
  admin: ShieldAlert,
  opo: HeartHandshake,
  logistics: Truck,
  authority: FileCheck,
  hospital: Building2,
  customer: UserCheck,
  manufacturer: HeartHandshake,
  distributor: Truck,
  wholesaler: FileCheck,
  pharmacy: Building2
};

const STAGE_STYLES = {
  Harvested:        { label: 'HARVESTED',       bg: 'bg-teal-100 text-teal-900 border-teal-300' },
  InTransit:        { label: 'IN TRANSIT (CRYO)', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
  AllocationCleared:{ label: 'ALLOCATION CLEARED', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  HospitalReceived: { label: 'IN SURGICAL SUITE', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
  Transplanted:     { label: 'TRANSPLANTED (GRAFTED)', bg: 'bg-green-100 text-green-900 border-green-300' },
  Quarantined:      { label: 'QUARANTINED',    bg: 'bg-red-100 text-red-900 border-red-300' }
};

export default function DashboardPage({ onNavigateToVerify }) {
  const { currentUser, switchRole, demoUsers, investigationCount, refreshStats } = useAuth();
  const [organs, setOrgans] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [transferTargetOrgan, setTransferTargetOrgan] = useState(null);
  const [qrTargetOrgan, setQrTargetOrgan] = useState(null);
  const [certTargetOrgan, setCertTargetOrgan] = useState(null);
  const [implantLoading, setImplantLoading] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [organsRes, statsRes] = await Promise.all([
        fetch('/api/organs'),
        fetch('/api/stats')
      ]);
      const organsData = await organsRes.json();
      const statsData = await statsRes.json();
      if (organsData.organs || organsData.batches) setOrgans(organsData.organs || organsData.batches);
      if (statsData.investigations) setInvestigations(statsData.investigations);
    } catch (err) {
      console.error('Failed to load organ registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // Complete Surgical Implantation (Hospital OR)
  const handleCompleteImplant = async (organId) => {
    const surgicalNotes = window.prompt(
      `Confirm surgical transplantation of Organ ${organId}?\nEnter OR Confirmation & Anastomosis Reperfusion Notes:`,
      "Successful anastomosis completed. Immediate vascular perfusion confirmed in OR 4."
    );
    if (!surgicalNotes) return;

    setImplantLoading(organId);
    try {
      const res = await fetch(`/api/organs/${organId}/transplant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'hospital'
        },
        body: JSON.stringify({ notes: surgicalNotes })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`SURGICAL IMPLANTATION LOGGED ON BLOCKCHAIN:\nOrgan ${organId} grafted into verified recipient.`);
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to complete transplant');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setImplantLoading(null);
    }
  };

  // Emergency Regulatory Quarantine Order
  const handleQuarantine = async (organId) => {
    const reason = window.prompt(
      `ISSUE EMERGENCY REGULATORY QUARANTINE FOR ORGAN ${organId}:\nEnter biosafety violation, thermal excursion, or trafficking flag:`,
      "Thermal sensor breach detected: Container temperature exceeded 8.0°C during transshipment."
    );
    if (!reason) return;

    try {
      const res = await fetch(`/api/organs/${organId}/quarantine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentUser.role
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`EMERGENCY QUARANTINE ISSUED FOR ${organId}:\nLocked on consortium blockchain ledger.`);
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to issue quarantine order');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Update Investigation status
  const handleUpdateInvestigation = async (reportId, newStatus) => {
    setInvestigations(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    try {
      const res = await fetch(`/api/stats/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDashboardData();
        refreshStats();
      }
    } catch (err) {
      console.error(err);
      fetchDashboardData();
    }
  };

  // Filter organs based on active role and search
  const filteredOrgans = organs.filter(o => {
    const q = searchTerm.toLowerCase();
    const id = (o.organId || o.batchId || '').toLowerCase();
    const type = (o.organType || o.medicineName || '').toLowerCase();
    const donor = (o.donorId || '').toLowerCase();
    const blood = (o.donorBloodType || o.dosage || '').toLowerCase();
    const owner = (o.currentOwnerName || '').toLowerCase();

    const matchesSearch = id.includes(q) || type.includes(q) || donor.includes(q) || blood.includes(q) || owner.includes(q);
    if (!matchesSearch) return false;

    if (currentUser.role === 'opo' || currentUser.role === 'manufacturer') {
      return o.stage === 'Harvested' || o.manufacturerName?.includes('Procurement');
    }
    if (currentUser.role === 'logistics' || currentUser.role === 'distributor') {
      return o.currentOwnerRole === 'logistics' || o.stage === 'InTransit' || o.stage === 'Harvested';
    }
    if (currentUser.role === 'authority' || currentUser.role === 'wholesaler') {
      return true; // Authority oversees all organs
    }
    if (currentUser.role === 'hospital' || currentUser.role === 'pharmacy') {
      return o.currentOwnerRole === 'hospital' || o.stage === 'HospitalReceived' || o.stage === 'Transplanted';
    }
    return true; // Admin sees all
  });

  const ActiveIcon = ROLE_ICONS[currentUser.role] || HeartHandshake;

  return (
    <div className="p-3 max-w-[1400px] mx-auto space-y-3 font-sans">

      {/* ── 1. Java Swing Stakeholder Workspace Bar ──────────────── */}
      <fieldset className="swing-etched bg-[#ECE9D8] p-2.5">
        <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8]">
          Transplant Consortium Workspace (Java Look & Feel Role Simulation)
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-1">
          {demoUsers.map((u) => {
            const Icon = ROLE_ICONS[u.role] || HeartHandshake;
            const active = currentUser.role === u.role;
            return (
              <button
                key={u.role}
                onClick={() => {
                  if (u.role === 'customer') {
                    switchRole('customer');
                    if (onNavigateToVerify) onNavigateToVerify('ORG-KID-8041');
                  } else {
                    switchRole(u.role);
                  }
                }}
                className={`swing-btn justify-start text-left py-1.5 px-2 ${
                  active ? 'swing-btn-active bg-[#DFDBD0] border-2 border-t-[#707070] border-l-[#707070] font-bold text-[#0A246A]' : ''
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#0A246A]' : 'text-gray-600'}`} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] truncate flex items-center justify-between">
                    <span>{u.badge}</span>
                    {active && <span className="text-[9px] text-[#0A246A] font-bold font-mono">[ACTIVE]</span>}
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">{u.name}</div>
                </div>
                {u.role === 'admin' && investigationCount > 0 && (
                  <span className="shrink-0 px-1 bg-red-600 text-white text-[9px] font-bold rounded-xs">
                    {investigationCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── 2. Active Node Banner & Workstation Toolbar ───────────── */}
      <div className="swing-raised p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center text-[#0A246A]">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-[12px] text-black flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="px-1.5 py-0.2 bg-[#E2DFD2] border border-[#808080] text-[10px] font-mono">
                {currentUser.ethAddress.slice(0, 10)}...{currentUser.ethAddress.slice(-4)}
              </span>
            </div>
            <div className="text-[11px] text-gray-600 leading-tight mt-0.5">{currentUser.headline}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="swing-btn"
            title="Refresh Grid (F5)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh (F5)</span>
          </button>

          {(currentUser.role === 'opo' || currentUser.role === 'manufacturer' || currentUser.role === 'admin') && (
            <button
              onClick={() => setIsHarvestModalOpen(true)}
              className="swing-btn swing-btn-primary"
            >
              <Plus className="w-3.5 h-3.5 text-green-700" />
              <span>Harvest Organ Record (Ctrl+H)</span>
            </button>
          )}

          {(currentUser.role === 'hospital' || currentUser.role === 'pharmacy') && (
            <button
              onClick={() => onNavigateToVerify('ORG-KID-8041')}
              className="swing-btn"
            >
              <QrCode className="w-3.5 h-3.5 text-[#0A246A]" />
              <span>Barcode Verifier (Ctrl+V)</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Regulatory Directorate: Anti-Trafficking Investigations ─ */}
      {(currentUser.role === 'admin' || currentUser.role === 'authority') && (
        <fieldset className="swing-etched bg-[#FFF8F8] border-red-400 p-2.5">
          <legend className="px-1.5 font-bold text-[11px] text-red-800 bg-[#FFF8F8] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
            <span>Active Anti-Trafficking Investigations & Cold-Chain Excursions ({investigations.length} Cases Under Direct Audit)</span>
          </legend>

          {investigations.length === 0 ? (
            <div className="py-4 text-center text-gray-500 text-[11px]">
              No active organ trafficking incidents or cold-chain breaches reported. System nominal.
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              {investigations.map(rep => (
                <div key={rep.id} className="p-2 bg-white border border-[#808080] flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-[11px]">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-red-700">{rep.id}</span>
                      <span className="px-1.5 bg-red-100 border border-red-300 font-bold text-[10px]">
                        ORGAN: {rep.organId || rep.batchId}
                      </span>
                      <span className="px-1.5 bg-amber-100 border border-amber-300 font-bold text-[10px]">
                        STATUS: {rep.status}
                      </span>
                      <span className="text-gray-500">Facility: <strong>{rep.storeName}</strong> ({rep.location})</span>
                    </div>
                    <p className="text-gray-800 italic">"{rep.description}"</p>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Filed: {new Date(rep.filedAt).toLocaleString()} | Reporter: {rep.reporterContact}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'INSPECTOR_DISPATCHED')}
                      className="swing-btn text-[10px]"
                    >
                      Dispatch Inspector
                    </button>
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'ORGAN_QUARANTINED')}
                      className="swing-btn swing-btn-danger text-[10px]"
                    >
                      Quarantine Container
                    </button>
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'CASE_RESOLVED_CLEARED')}
                      className="swing-btn swing-btn-primary text-[10px]"
                    >
                      Resolve Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {/* ── 4. Java Swing Status Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className="swing-panel-sunken p-2 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-600 uppercase">Total Organs on Ledger</span>
          <span className="text-xl font-bold font-mono text-[#0A246A]">{organs.length} Organs</span>
          <span className="text-[9px] text-gray-500">EVM Smart Contract Verified</span>
        </div>
        <div className="swing-panel-sunken p-2 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-600 uppercase">In-Transit Air/Ground</span>
          <span className="text-xl font-bold font-mono text-blue-800">
            {organs.filter(o => o.stage === 'InTransit' || o.stage === 'DistributorReceived').length} Coolers
          </span>
          <span className="text-[9px] text-blue-600">Active Cryo-Telemetry</span>
        </div>
        <div className="swing-panel-sunken p-2 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-600 uppercase">Transplanted / Grafted</span>
          <span className="text-xl font-bold font-mono text-green-800">
            {organs.filter(o => o.stage === 'Transplanted' || o.stage === 'SoldToCustomer').length} Implants
          </span>
          <span className="text-[9px] text-green-700">Recipient Confirmed in OR</span>
        </div>
        <div className="swing-panel-sunken p-2 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-600 uppercase">Quarantine / Excursion</span>
          <span className="text-xl font-bold font-mono text-red-800">
            {organs.filter(o => o.isQuarantined || o.isRecalled).length} Holds
          </span>
          <span className="text-[9px] text-red-600">Regulatory Hold Active</span>
        </div>
      </div>

      {/* ── 5. Main Organ Custody JTable ─────────────────────────── */}
      <fieldset className="swing-etched bg-[#ECE9D8] p-2">
        <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8]">
          Organ Custody Registry (JTable View)
        </legend>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-1.5 w-full sm:w-80">
            <span className="text-[11px] font-bold text-gray-700 shrink-0">Filter:</span>
            <input
              type="text"
              placeholder="Search Organ ID, Type, Donor, Blood, Custodian..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="swing-input w-full"
            />
          </div>
          <div className="text-[11px] text-gray-600 font-mono">
            Displaying <strong>{filteredOrgans.length}</strong> of <strong>{organs.length}</strong> organs | Workspace: <strong className="text-[#0A246A]">{currentUser.badge}</strong>
          </div>
        </div>

        {/* JTable Container */}
        <div className="swing-sunken overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="swing-th">Organ Identifier</th>
                <th className="swing-th">Organ Type</th>
                <th className="swing-th">Donor & Blood</th>
                <th className="swing-th">Cold Ischemia & Preservative</th>
                <th className="swing-th">Current Custodian</th>
                <th className="swing-th">Status</th>
                <th className="swing-th text-right">Swing Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    Querying Ethereum Consortium Ledger...
                  </td>
                </tr>
              ) : filteredOrgans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    No organ records match current filter or role view.
                  </td>
                </tr>
              ) : (
                filteredOrgans.map((organ, index) => {
                  const id = organ.organId || organ.batchId;
                  const isSelected = selectedRow === id;

                  // Real-time cold ischemia calculation
                  const harvestTime = new Date(organ.harvestTimestamp).getTime();
                  const elapsedHours = Number(((Date.now() - harvestTime) / (1000 * 3600)).toFixed(1));
                  const limitHours = Number(organ.ischemicLimitHours) || 24;
                  const remainingHours = Number(Math.max(0, limitHours - elapsedHours).toFixed(1));
                  const isBreached = elapsedHours > limitHours && organ.stage !== 'Transplanted';

                  const stageStyle = STAGE_STYLES[organ.stage] || { label: organ.stage, bg: 'bg-gray-100 text-gray-800 border-gray-300' };

                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedRow(id)}
                      className={`border-b border-[#E0DFD8] transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0A246A] text-white font-medium'
                          : index % 2 === 0
                          ? 'bg-white hover:bg-[#F2EFE4]'
                          : 'bg-[#F9F8F5] hover:bg-[#F2EFE4]'
                      }`}
                    >
                      {/* Organ ID */}
                      <td className="p-2 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className={isSelected ? 'text-white' : 'text-blue-900'}>{id}</span>
                          {organ.isQuarantined && (
                            <span className="px-1 bg-red-600 text-white text-[9px] font-sans font-bold">QUARANTINE</span>
                          )}
                          {isBreached && (
                            <span className="px-1 bg-amber-600 text-white text-[9px] font-sans font-bold">TIME-BREACH</span>
                          )}
                        </div>
                        <div className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                          Tx: {organ.blockchainTxHash ? organ.blockchainTxHash.slice(0, 10) + '...' : '0xGenesis'}
                        </div>
                      </td>

                      {/* Organ Type */}
                      <td className="p-2 font-bold">
                        <div className={isSelected ? 'text-white' : 'text-black'}>{organ.organType || organ.medicineName}</div>
                        <div className={`text-[10px] font-normal ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                          Recipient: {organ.recipientId || "Pending Allocation"}
                        </div>
                      </td>

                      {/* Donor Blood & HLA */}
                      <td className="p-2">
                        <div className="font-mono font-bold">
                          Blood: <span className={isSelected ? 'text-yellow-300' : 'text-red-700'}>{organ.donorBloodType || organ.dosage}</span>
                        </div>
                        <div className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                          Donor: {organ.donorId || "DNR-MUM-9021"} ({organ.hlaMarker || "6/6 Match"})
                        </div>
                      </td>

                      {/* Cold Ischemia */}
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${isBreached ? 'text-red-500' : isSelected ? 'text-yellow-300' : 'text-blue-700'}`} />
                          <span className={`font-mono font-bold ${isBreached ? 'text-red-600' : isSelected ? 'text-yellow-300' : 'text-blue-800'}`}>
                            {remainingHours}h remaining
                          </span>
                        </div>
                        <div className={`text-[10px] flex items-center gap-1 ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                          <Thermometer className="w-3 h-3 text-cyan-600" />
                          <span>{organ.temperatureCelsius || 2.8}°C ({organ.preservationProtocol?.split(' ')[0] || "Custodiol"})</span>
                        </div>
                      </td>

                      {/* Current Custodian */}
                      <td className="p-2">
                        <div className={`truncate max-w-[180px] font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {organ.currentOwnerName}
                        </div>
                        <div className={`text-[10px] font-mono truncate max-w-[160px] ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                          {organ.currentOwner}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 border text-[10px] font-mono font-bold ${stageStyle.bg}`}>
                          {stageStyle.label}
                        </span>
                        <div className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                          {organ.history?.length || 1} chain hops
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setCertTargetOrgan(organ); }}
                            className="swing-btn text-[10px] py-0.5 px-1.5"
                            title="View Verified Donor Consent Certificate (IPFS Form 8)"
                          >
                            <Award className="w-3 h-3 text-amber-700" />
                            <span>Cert</span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setQrTargetOrgan(organ); }}
                            className="swing-btn text-[10px] py-0.5 px-1.5"
                            title="Generate Cryo-Carrier Specimen QR Tag"
                          >
                            <QrCode className="w-3 h-3 text-[#0A246A]" />
                            <span>QR</span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); onNavigateToVerify(id); }}
                            className="swing-btn text-[10px] py-0.5 px-1.5"
                            title="Inspect in Organ Verification Inspector"
                          >
                            <Eye className="w-3 h-3 text-teal-700" />
                            <span>Verify</span>
                          </button>

                          {/* Complete Surgical Implantation (Hospital OR) */}
                          {organ.stage === 'HospitalReceived' && !organ.isQuarantined && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCompleteImplant(id); }}
                              disabled={implantLoading === id}
                              className="swing-btn swing-btn-primary text-[10px] py-0.5 px-1.5 font-bold"
                              title="Hospital Sign-off: Surgical Implantation Completed"
                            >
                              <HeartHandshake className="w-3 h-3 text-green-700" />
                              <span>Implant</span>
                            </button>
                          )}

                          {/* Transfer Custody */}
                          {organ.stage !== 'Transplanted' && !organ.isQuarantined && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setTransferTargetOrgan(organ); }}
                              className="swing-btn text-[10px] py-0.5 px-1.5"
                              title="Transfer Organ Custody along Medical Supply Chain"
                            >
                              <Truck className="w-3 h-3 text-blue-700" />
                              <span>Transfer</span>
                            </button>
                          )}

                          {/* Emergency Regulatory Quarantine */}
                          {!organ.isQuarantined && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleQuarantine(id); }}
                              className="swing-btn swing-btn-danger text-[10px] py-0.5 px-1.5"
                              title="Issue Emergency Regulatory Quarantine"
                            >
                              <ShieldAlert className="w-3 h-3 text-red-700" />
                              <span>Hold</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* ── 6. Modals ────────────────────────────────────────────── */}
      <CreateBatchModal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        onSuccess={(newOrgan) => {
          fetchDashboardData();
          setQrTargetOrgan(newOrgan);
        }}
      />

      <TransferModal
        batch={transferTargetOrgan}
        isOpen={!!transferTargetOrgan}
        onClose={() => setTransferTargetOrgan(null)}
        onSuccess={() => fetchDashboardData()}
      />

      <QRCodeModal
        batch={qrTargetOrgan}
        isOpen={!!qrTargetOrgan}
        onClose={() => setQrTargetOrgan(null)}
      />

      <CertificateModal
        batch={certTargetOrgan}
        isOpen={!!certTargetOrgan}
        onClose={() => setCertTargetOrgan(null)}
      />
    </div>
  );
}
