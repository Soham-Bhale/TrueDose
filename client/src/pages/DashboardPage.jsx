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

export default function DashboardPage({
  onNavigateToVerify,
  isHarvestModalOpen: externalHarvestOpen,
  onOpenHarvestModal,
  onCloseHarvestModal
}) {
  const { currentUser, switchRole, demoUsers, investigationCount, refreshStats } = useAuth();
  const [organs, setOrgans] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const [internalHarvestOpen, setInternalHarvestOpen] = useState(false);
  const isHarvestOpen = externalHarvestOpen !== undefined ? externalHarvestOpen : internalHarvestOpen;

  const openHarvest = () => {
    if (currentUser.role !== 'opo' && currentUser.role !== 'admin' && currentUser.role !== 'manufacturer') {
      switchRole('opo');
    }
    if (onOpenHarvestModal) onOpenHarvestModal();
    else setInternalHarvestOpen(true);
  };

  const closeHarvest = () => {
    if (onCloseHarvestModal) onCloseHarvestModal();
    setInternalHarvestOpen(false);
  };

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
    <div className="space-y-4 font-sans">

      {/* ── 1. Stakeholder Workstation Role Switcher ──────────────── */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Consortium Stakeholder Workstations</span>
          <span className="text-[11px] text-slate-400 font-normal">Click any role to test perspective</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
                className={`p-2.5 rounded-lg text-left transition-all border flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-blue-50 border-blue-500 shadow-xs text-blue-950 font-semibold'
                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{u.shortBadge || u.badge}</span>
                    {active && (
                      <span className="shrink-0 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-mono font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{u.name}</div>
                </div>
                {u.role === 'admin' && investigationCount > 0 && (
                  <span className="shrink-0 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                    {investigationCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Active Node Banner & Workstation Toolbar ───────────── */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600 rounded-md">
                {currentUser.ethAddress.slice(0, 10)}...{currentUser.ethAddress.slice(-4)}
              </span>
            </div>
            <div className="text-xs text-slate-500 leading-tight mt-0.5">{currentUser.headline}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh Grid (F5)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openHarvest}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Harvest & Register Donor Organ (Ctrl+H)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Harvest Organ Record</span>
          </button>

          {(currentUser.role === 'hospital' || currentUser.role === 'pharmacy') && (
            <button
              onClick={() => onNavigateToVerify('ORG-KID-8041')}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Barcode Verifier</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Regulatory Directorate: Anti-Trafficking Investigations ─ */}
      {(currentUser.role === 'admin' || currentUser.role === 'authority') && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 shadow-xs">
          <div className="text-xs font-bold text-rose-800 flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Active Anti-Trafficking Investigations & Safety Incidents ({investigations.length} Cases)</span>
          </div>

          {investigations.length === 0 ? (
            <div className="py-4 text-center text-slate-500 text-xs">
              No active organ trafficking incidents or cold-chain breaches reported. System nominal.
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {investigations.map(rep => (
                <div key={rep.id} className="p-3 bg-white rounded-lg border border-rose-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-rose-700">{rep.id}</span>
                      <span className="px-2 py-0.5 bg-rose-100 border border-rose-200 font-bold text-[10px] rounded-md text-rose-800">
                        ORGAN: {rep.organId || rep.batchId}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 font-bold text-[10px] rounded-md text-amber-800">
                        STATUS: {rep.status}
                      </span>
                      <span className="text-slate-500">Facility: <strong>{rep.storeName}</strong> ({rep.location})</span>
                    </div>
                    <p className="text-slate-700 italic">"{rep.description}"</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Filed: {new Date(rep.filedAt).toLocaleString()} | Reporter: {rep.reporterContact}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'INSPECTOR_DISPATCHED')}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                    >
                      Dispatch Inspector
                    </button>
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'ORGAN_QUARANTINED')}
                      className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition-colors cursor-pointer"
                    >
                      Quarantine Container
                    </button>
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'CASE_RESOLVED_CLEARED')}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                    >
                      Resolve Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Modern Metric Summary Cards ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Organs on Ledger</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1">{organs.length}</span>
          <span className="text-[10px] text-slate-400 mt-1">EVM PoA Smart Contract Verified</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In-Transit Air/Ground</span>
          <span className="text-2xl font-black font-mono text-blue-600 mt-1">
            {organs.filter(o => o.stage === 'InTransit' || o.stage === 'DistributorReceived').length}
          </span>
          <span className="text-[10px] text-blue-600 mt-1 font-medium">Active Safe Cold-Chain</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Transplanted / Grafted</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {organs.filter(o => o.stage === 'Transplanted' || o.stage === 'SoldToCustomer').length}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 font-medium">Recipient Confirmed in OR</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quarantine / Excursion</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-1">
            {organs.filter(o => o.isQuarantined || o.isRecalled).length}
          </span>
          <span className="text-[10px] text-rose-600 mt-1 font-medium">Regulatory Hold Active</span>
        </div>
      </div>

      {/* ── 5. Main Organ Custody Registry Table ─────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Header & Search Bar */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Organ ID, Type, Donor, Blood, Custodian..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Displaying <strong>{filteredOrgans.length}</strong> of <strong>{organs.length}</strong> organs | Node: <strong className="text-blue-700">{currentUser.badge}</strong>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Organ Identifier</th>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Organ Type</th>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Donor & Blood</th>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Safe Window & Temp</th>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Current Custodian</th>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Status</th>
                <th className="py-2.5 px-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider text-right">Actions</th>
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
                      className={`border-b border-slate-100 transition-colors cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium'
                          : index % 2 === 0
                          ? 'bg-white hover:bg-slate-50'
                          : 'bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      {/* Organ ID */}
                      <td className="p-3 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className={isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-900'}>{id}</span>
                          {organ.isQuarantined && (
                            <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-sans font-bold rounded-sm">QUARANTINE</span>
                          )}
                          {isBreached && (
                            <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[9px] font-sans font-bold rounded-sm">TIME-BREACH</span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Tx: {organ.blockchainTxHash ? organ.blockchainTxHash.slice(0, 10) + '...' : '0xGenesis'}
                        </div>
                      </td>

                      {/* Organ Type */}
                      <td className="p-3 font-semibold">
                        <div className="text-slate-900">{organ.organType || organ.medicineName}</div>
                        <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                          Recipient: <span className="font-medium text-slate-700">{organ.recipientId || "Pending Allocation"}</span>
                        </div>
                      </td>

                      {/* Donor Blood & HLA */}
                      <td className="p-3">
                        <div className="font-mono font-bold">
                          Blood: <span className="text-rose-700 font-extrabold">{organ.donorBloodType || organ.dosage}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Donor: {organ.donorId || "DNR-MUM-9021"} ({organ.hlaMarker || "6/6 Match"})
                        </div>
                      </td>

                      {/* Cold Ischemia */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isBreached ? 'text-rose-600' : 'text-blue-600'}`} />
                          <span className={`font-mono font-bold ${isBreached ? 'text-rose-600' : 'text-blue-700'}`}>
                            {remainingHours}h remaining
                          </span>
                        </div>
                        <div className="text-[11px] flex items-center gap-1 text-slate-500 mt-0.5">
                          <Thermometer className="w-3 h-3 text-cyan-600" />
                          <span>{organ.temperatureCelsius || 2.8}°C (Safe Range)</span>
                        </div>
                      </td>

                      {/* Current Custodian */}
                      <td className="p-3">
                        <div className="truncate max-w-[180px] font-medium text-slate-900">
                          {organ.currentOwnerName}
                        </div>
                        <div className="text-[10px] font-mono truncate max-w-[160px] text-slate-400 mt-0.5">
                          {organ.currentOwner}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border text-[10px] font-mono font-bold rounded-md ${stageStyle.bg}`}>
                          {stageStyle.label}
                        </span>
                        <div className="text-[10px] font-mono mt-1 text-slate-400">
                          {organ.history?.length || 1} chain hops
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setCertTargetOrgan(organ); }}
                            className="px-2 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Verified Donor Consent Certificate (IPFS Form 8)"
                          >
                            <Award className="w-3 h-3 text-amber-700" />
                            <span>Cert</span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setQrTargetOrgan(organ); }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            title="Generate Specimen QR Tag"
                          >
                            <QrCode className="w-3 h-3 text-slate-700" />
                            <span>QR</span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); onNavigateToVerify(id); }}
                            className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
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
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Hospital Sign-off: Surgical Implantation Completed"
                            >
                              <HeartHandshake className="w-3 h-3" />
                              <span>Implant</span>
                            </button>
                          )}

                          {/* Transfer Custody */}
                          {organ.stage !== 'Transplanted' && !organ.isQuarantined && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setTransferTargetOrgan(organ); }}
                              className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Transfer Organ Custody along Medical Supply Chain"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Transfer</span>
                            </button>
                          )}

                          {/* Emergency Regulatory Quarantine */}
                          {!organ.isQuarantined && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleQuarantine(id); }}
                              className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="Issue Emergency Regulatory Quarantine"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
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
      </div>

      {/* ── 6. Modals ────────────────────────────────────────────── */}
      <CreateBatchModal
        isOpen={isHarvestOpen}
        onClose={closeHarvest}
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
