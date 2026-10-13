import React, { useState, useEffect } from 'react';
import {
  Plus, Truck, QrCode, ShieldAlert, ShoppingBag, Eye, RefreshCw,
  Clock, CheckCircle, AlertTriangle, Search, ArrowRight, UserCheck,
  Award, ShieldCheck, MapPin, Send, AlertOctagon, Thermometer, Database,
  FileCheck, Check, CheckCircle2, Package, Layers, Factory, Warehouse,
  Store, ShieldX, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateBatchModal from '../components/CreateBatchModal';
import TransferModal from '../components/TransferModal';
import QRCodeModal from '../components/QRCodeModal';
import CertificateModal from '../components/CertificateModal';

const ROLE_ICONS = {
  manufacturer: Factory,
  distributor: Truck,
  wholesaler: Warehouse,
  pharmacy: Store,
  admin: ShieldAlert,
  customer: UserCheck
};

export default function DashboardPage({ onNavigateToVerify }) {
  const { currentUser, switchRole, demoUsers, investigationCount, refreshStats } = useAuth();
  const [batches, setBatches] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transferTargetBatch, setTransferTargetBatch] = useState(null);
  const [qrTargetBatch, setQrTargetBatch] = useState(null);
  const [certTargetBatch, setCertTargetBatch] = useState(null);
  const [dispenseLoading, setDispenseLoading] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [batchesRes, statsRes] = await Promise.all([
        fetch('/api/batches'),
        fetch('/api/stats')
      ]);
      const batchesData = await batchesRes.json();
      const statsData = await statsRes.json();

      if (batchesData.batches) setBatches(batchesData.batches);
      if (statsData.investigations) setInvestigations(statsData.investigations);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // Pharmacy dispense action
  const handleDispense = async (batchId) => {
    if (!window.confirm(`Mark Batch ${batchId} as dispensed to patient? This commits an immutable retail handoff on the blockchain.`)) {
      return;
    }
    setDispenseLoading(batchId);
    try {
      const res = await fetch(`/api/batches/${batchId}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'pharmacy'
        },
        body: JSON.stringify({ notes: "Dispensed at retail counter against verified prescription" })
      });
      const data = await res.json();
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert(data.error || "Failed to dispense");
      }
    } catch (err) {
      alert("Error dispensing batch: " + err.message);
    } finally {
      setDispenseLoading(null);
    }
  };

  // Emergency recall action
  const handleRecall = async (batchId) => {
    const reason = window.prompt("Enter official regulatory recall order reason:", "Contamination alert or packaging defect detected");
    if (!reason) return;

    try {
      const res = await fetch(`/api/batches/${batchId}/recall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentUser.role
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`EMERGENCY RECALL ISSUED for batch ${batchId}. All nodes quarantined.`);
        fetchDashboardData();
      } else {
        alert(data.error || "Failed to recall");
      }
    } catch (err) {
      alert("Error issuing recall: " + err.message);
    }
  };

  // Dispatch investigator to store
  const handleUpdateInvestigation = async (reportId, newStatus) => {
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
      console.error("Update investigation failed:", err);
    }
  };

  // Filter batches based on active role view and search
  const filteredBatches = batches.filter(b => {
    const matchesSearch =
      b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.currentOwnerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (currentUser.role === 'manufacturer') {
      return b.manufacturerName?.toLowerCase().includes('abc') || b.stage === 'Manufactured';
    }
    if (currentUser.role === 'distributor') {
      return b.currentOwnerRole === 'distributor' || b.stage === 'DistributorReceived' || b.stage === 'Manufactured';
    }
    if (currentUser.role === 'wholesaler') {
      return b.currentOwnerRole === 'wholesaler' || b.stage === 'WholesalerReceived' || b.stage === 'DistributorReceived';
    }
    if (currentUser.role === 'pharmacy') {
      return b.currentOwnerRole === 'pharmacy' || b.stage === 'PharmacyReceived' || b.stage === 'SoldToCustomer';
    }
    // Admin sees all
    return true;
  });

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Manufactured':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">MANUFACTURED</span>;
      case 'DistributorReceived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200">IN TRANSIT</span>;
      case 'WholesalerReceived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-800 border border-indigo-200">AT WHOLESALER</span>;
      case 'PharmacyReceived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-50 text-purple-800 border border-purple-200">AT PHARMACY</span>;
      case 'SoldToCustomer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-800 border border-slate-300">DISPENSED</span>;
      case 'Recalled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-800 border border-rose-300">RECALLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">{stage}</span>;
    }
  };

  const ActiveRoleIcon = ROLE_ICONS[currentUser.role] || Factory;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Universal Interactive Role Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>Select Simulated Role Workspace</span>
          </span>
          <span className="text-[11px] text-teal-700 font-mono font-medium">Consortium Node Simulation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {demoUsers.filter(u => u.role !== 'customer').map((user) => {
            const isSelected = currentUser.role === user.role;
            const hasAlerts = user.role === 'admin' && investigationCount > 0;
            const ButtonIcon = ROLE_ICONS[user.role] || Factory;

            return (
              <button
                key={user.role}
                onClick={() => switchRole(user.role)}
                className={`p-3 rounded-lg text-left border transition relative flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 shadow-2xs ring-1 ring-teal-600/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                  isSelected ? 'bg-white text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <ButtonIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>
                      {user.badge}
                    </span>
                    {hasAlerts && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                        {investigationCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{user.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs shrink-0">
            <ActiveRoleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${currentUser.color || 'bg-slate-100 text-slate-700'}`}>
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentUser.headline}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-md mt-0.5">
              Node Address: <strong className="text-slate-700">{currentUser.ethAddress || 'Consortium Public Key'}</strong>
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition shadow-2xs"
            title="Refresh Batches"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(currentUser.role === 'manufacturer' || currentUser.role === 'admin') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Batch</span>
            </button>
          )}

          {currentUser.role === 'pharmacy' && (
            <button
              onClick={() => onNavigateToVerify('PCM001')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Customer QR Verifier</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. ADMIN / REGULATORY COMMAND CENTER VIEW */}
      {/* ============================================================== */}
      {currentUser.role === 'admin' && (
        <div className="space-y-6">
          {/* Active Counterfeit Investigations Card */}
          <div className="bg-white border-2 border-rose-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Active Counterfeit Investigations & Citizen Alerts</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                      {investigations.length} CASES
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Real-time alerts submitted by citizens & dispensaries upon unverified packaging scan</p>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                Regulatory Directorate: <strong className="text-teal-700">ONLINE</strong>
              </span>
            </div>

            {investigations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active counterfeit investigations reported at this time.
              </div>
            ) : (
              <div className="grid gap-3">
                {investigations.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs hover:border-slate-300 transition"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-rose-700 text-xs">{rep.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-800 border border-rose-200">
                          BATCH: {rep.batchId}
                        </span>
                        <span className="text-slate-600">
                          Suspect Pharmacy: <strong className="text-slate-900">{rep.storeName}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
                          {rep.status}
                        </span>
                      </div>

                      <p className="text-slate-700 text-xs bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        "{rep.description}"
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rep.location}</span>
                        </span>
                        <span>Contact: <strong className="text-slate-700">{rep.reporterContact}</strong></span>
                        <span>Filed: {new Date(rep.filedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateInvestigation(rep.id, "INSPECTOR_ON_SITE")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-amber-800 rounded-lg font-semibold transition border border-amber-200 text-xs shadow-2xs"
                      >
                        Dispatch Inspector
                      </button>
                      <button
                        onClick={() => handleUpdateInvestigation(rep.id, "STORE_QUARANTINED")}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold transition text-xs shadow-xs"
                      >
                        Quarantine Store
                      </button>
                      <button
                        onClick={() => handleUpdateInvestigation(rep.id, "CASE_RESOLVED_SEIZED")}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition text-xs shadow-xs"
                      >
                        Resolve Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ROLE-SPECIFIC WORKSPACE METRICS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {currentUser.role === 'manufacturer' && (
          <>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Formulated Batches</span>
              <span className="text-2xl font-bold text-teal-800 font-mono mt-1 block">
                {batches.filter(b => b.manufacturerName?.includes('ABC')).length}
              </span>
              <span className="text-[10px] text-slate-400">GMP Compliance Certified</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Ready for Dispatch</span>
              <span className="text-2xl font-bold text-amber-700 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'Manufactured').length}
              </span>
              <span className="text-[10px] text-slate-400">Awaiting Transshipment</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">In Transit Downstream</span>
              <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">
                {batches.filter(b => b.stage !== 'Manufactured' && b.stage !== 'SoldToCustomer').length}
              </span>
              <span className="text-[10px] text-slate-400">En Route to Depots</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Total Volume Produced</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">9,200</span>
              <span className="text-[10px] text-slate-400">Dosage Units Released</span>
            </div>
          </>
        )}

        {currentUser.role === 'distributor' && (
          <>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Batches in Transshipment</span>
              <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'DistributorReceived' || b.stage === 'Manufactured').length}
              </span>
              <span className="text-[10px] text-slate-400">Hub Logistics Terminal</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Cold-Chain Reefer Status</span>
              <span className="text-2xl font-bold text-teal-800 font-mono mt-1 block flex items-center gap-1.5">
                <Thermometer className="w-5 h-5 text-blue-600" /> 4.2°C
              </span>
              <span className="text-[10px] text-teal-700 font-medium">100% Compliant</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Awaiting Wholesaler</span>
              <span className="text-2xl font-bold text-indigo-700 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'DistributorReceived').length}
              </span>
              <span className="text-[10px] text-slate-400">Ready for Delivery</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Fleet Transit Security</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">SECURE</span>
              <span className="text-[10px] text-slate-400">Smart Seals Verified</span>
            </div>
          </>
        )}

        {currentUser.role === 'wholesaler' && (
          <>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Depot Pallet Inventory</span>
              <span className="text-2xl font-bold text-indigo-700 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'WholesalerReceived').length}
              </span>
              <span className="text-[10px] text-slate-400">Regional Depot Bangalore</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Allocated to Pharmacies</span>
              <span className="text-2xl font-bold text-purple-700 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'PharmacyReceived' || b.stage === 'SoldToCustomer').length}
              </span>
              <span className="text-[10px] text-slate-400">Retail Distribution</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Quality Clearance</span>
              <span className="text-2xl font-bold text-teal-800 font-mono mt-1 block">VERIFIED</span>
              <span className="text-[10px] text-teal-700 font-medium">All Lots Authenticated</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Storage Compliance</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">OPTIMAL</span>
              <span className="text-[10px] text-slate-400">Temperature Controlled</span>
            </div>
          </>
        )}

        {currentUser.role === 'pharmacy' && (
          <>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">On-Shelf Stock</span>
              <span className="text-2xl font-bold text-purple-700 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'PharmacyReceived').length}
              </span>
              <span className="text-[10px] text-slate-400">Available to Dispense</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Dispensed to Patients</span>
              <span className="text-2xl font-bold text-teal-800 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'SoldToCustomer').length}
              </span>
              <span className="text-[10px] text-teal-700 font-medium">Logged on Blockchain</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Audit Verification</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">100% OK</span>
              <span className="text-[10px] text-slate-400">Anti-Diversion Protocol</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Packaging QR Slips</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">ACTIVE</span>
              <span className="text-[10px] text-slate-400">Direct Patient Verification</span>
            </div>
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">National Registry</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                {batches.length}
              </span>
              <span className="text-[10px] text-teal-700 font-medium">Authenticated Batches</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Citizen Reports</span>
              <span className="text-2xl font-bold text-rose-700 font-mono mt-1 block">
                {investigations.length}
              </span>
              <span className="text-[10px] text-rose-600 font-medium">Cases Under Review</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Quarantined Lots</span>
              <span className="text-2xl font-bold text-amber-700 font-mono mt-1 block">
                {batches.filter(b => b.isRecalled).length}
              </span>
              <span className="text-[10px] text-slate-400">Recalls Enforced</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 block font-medium">Consortium Validator Health</span>
              <span className="text-2xl font-bold text-teal-800 font-mono mt-1 block">5 NODES</span>
              <span className="text-[10px] text-teal-700 font-medium">Proof of Authority (PoA)</span>
            </div>
          </>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search batch ID, medicine, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredBatches.length}</strong> batches in <strong className="text-teal-800">{currentUser.badge}</strong> workspace
        </div>
      </div>

      {/* Batches Table with Role Context */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Batch Identifier</th>
                <th className="px-5 py-3.5">Medicine & Dosage</th>
                <th className="px-5 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5">Current Custodian</th>
                <th className="px-5 py-3.5">Expiry Clearance</th>
                <th className="px-5 py-3.5 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-sans">
                    No medicine batches found matching your role workspace filter.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isExpired = new Date() > new Date(batch.expiryDate);

                  return (
                    <tr key={batch.batchId} className="hover:bg-slate-50/80 transition">
                      {/* Batch ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{batch.batchId}</span>
                          {isExpired && (
                            <span className="text-[10px] text-amber-600 font-sans font-bold" title="Expired Batch">EXPIRED</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Vol: {batch.quantity.toLocaleString()} {batch.unit || 'units'}
                        </span>
                      </td>

                      {/* Medicine */}
                      <td className="px-5 py-4 font-sans">
                        <div className="font-bold text-slate-900 text-sm">{batch.medicineName}</div>
                        <span className="text-xs text-slate-500">{batch.dosage}</span>
                      </td>

                      {/* Current Stage */}
                      <td className="px-5 py-4">
                        {getStageBadge(batch.stage)}
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                          {batch.history?.length || 1} hops recorded
                        </span>
                      </td>

                      {/* Custodian */}
                      <td className="px-5 py-4 font-sans">
                        <div className="font-semibold text-slate-800 text-xs truncate max-w-[160px]">
                          {batch.currentOwnerName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[140px]">
                          {batch.currentOwner}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4">
                        <div className={`font-semibold ${isExpired ? 'text-rose-700' : 'text-slate-800'}`}>
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </div>
                        <span className={`text-[10px] ${isExpired ? 'text-rose-700 font-bold' : 'text-slate-400'}`}>
                          {isExpired ? 'EXPIRED' : 'Valid'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quality CoA Button */}
                          <button
                            onClick={() => setCertTargetBatch(batch)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-2xs"
                            title="View Quality Certificate (IPFS CoA)"
                          >
                            <Award className="w-4 h-4 text-amber-600" />
                          </button>

                          {/* QR Code Button */}
                          <button
                            onClick={() => setQrTargetBatch(batch)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-2xs"
                            title="Print / View QR Label"
                          >
                            <QrCode className="w-4 h-4 text-teal-700" />
                          </button>

                          {/* Verify Page View */}
                          <button
                            onClick={() => onNavigateToVerify(batch.batchId)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-2xs"
                            title="Verify Public Provenance"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>

                          {/* Pharmacy Dispense Action */}
                          {batch.stage === 'PharmacyReceived' && !batch.isRecalled && !isExpired && (
                            <button
                              onClick={() => handleDispense(batch.batchId)}
                              disabled={dispenseLoading === batch.batchId}
                              className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Dispense</span>
                            </button>
                          )}

                          {/* Transfer Custody Button */}
                          {batch.stage !== 'SoldToCustomer' && batch.stage !== 'PharmacyReceived' && !batch.isRecalled && (
                            <button
                              onClick={() => setTransferTargetBatch(batch)}
                              className="px-2.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Transfer</span>
                            </button>
                          )}

                          {/* Emergency Recall Button (Admin/Manufacturer) */}
                          {(currentUser.role === 'admin' || currentUser.role === 'manufacturer') && !batch.isRecalled && (
                            <button
                              onClick={() => handleRecall(batch.batchId)}
                              className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 rounded-lg border border-slate-200 hover:border-rose-200 transition"
                              title="Emergency Recall Order"
                            >
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
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

      {/* Modals */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newBatch) => {
          fetchDashboardData();
          setQrTargetBatch(newBatch);
        }}
      />

      <TransferModal
        batch={transferTargetBatch}
        isOpen={!!transferTargetBatch}
        onClose={() => setTransferTargetBatch(null)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      <QRCodeModal
        batch={qrTargetBatch}
        isOpen={!!qrTargetBatch}
        onClose={() => setQrTargetBatch(null)}
      />

      <CertificateModal
        batch={certTargetBatch}
        isOpen={!!certTargetBatch}
        onClose={() => setCertTargetBatch(null)}
      />
    </div>
  );
}
