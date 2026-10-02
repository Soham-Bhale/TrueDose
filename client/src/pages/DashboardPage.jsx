import React, { useState, useEffect } from 'react';
import {
  Plus, Truck, QrCode, ShieldAlert, ShoppingBag, Eye, RefreshCw,
  Clock, CheckCircle, AlertTriangle, Building, Search, ArrowRight, UserCheck,
  Award, ShieldCheck, MapPin, Send, AlertOctagon, Thermometer, Database,
  FileCheck, Sparkles, Check, CheckCircle2, Package, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateBatchModal from '../components/CreateBatchModal';
import TransferModal from '../components/TransferModal';
import QRCodeModal from '../components/QRCodeModal';
import CertificateModal from '../components/CertificateModal';

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
    if (!window.confirm(`Mark Batch ${batchId} as dispensed to customer? This logs an immutable sale record on the blockchain.`)) {
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
        body: JSON.stringify({ notes: "Dispensed at retail counter against verified medical prescription" })
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
    const reason = window.prompt("Enter official regulatory recall order reason:", "Contamination alert or critical packaging defect detected");
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

    // Role-specific filtering for realism:
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
    // Admin sees all batches across the country
    return true;
  });

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Manufactured':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">MANUFACTURED</span>;
      case 'DistributorReceived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">AT DISTRIBUTOR</span>;
      case 'WholesalerReceived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">AT WHOLESALER</span>;
      case 'PharmacyReceived':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20">AT PHARMACY</span>;
      case 'SoldToCustomer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">SOLD TO PATIENT</span>;
      case 'Recalled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/40">RECALLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-700 text-slate-300">{stage}</span>;
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Universal Interactive Role Switcher Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-xl">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch Active Supply Chain Portal View:
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">1-Click Role Simulation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {demoUsers.filter(u => u.role !== 'customer').map((user) => {
            const isSelected = currentUser.role === user.role;
            const hasAlerts = user.role === 'admin' && investigationCount > 0;

            return (
              <button
                key={user.role}
                onClick={() => switchRole(user.role)}
                className={`p-3 rounded-xl text-left border transition relative flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{user.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {user.badge}
                    </span>
                    {hasAlerts && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">
                        {investigationCount} 🚨
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{user.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {currentUser.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${currentUser.color || 'bg-slate-700'}`}>
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              {currentUser.headline}
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate max-w-md mt-0.5">
              Ethereum ID: <strong className="text-emerald-400">{currentUser.ethAddress || 'Public Node'}</strong>
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
            title="Refresh Batches"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(currentUser.role === 'manufacturer' || currentUser.role === 'admin') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Mint New Batch (Genesis)</span>
            </button>
          )}

          {currentUser.role === 'pharmacy' && (
            <button
              onClick={() => onNavigateToVerify('PCM001')}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-pink-600/20"
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
          <div className="bg-red-950/20 border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>🚨 Active Counterfeit Investigations & Citizen Alerts</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold">
                      {investigations.length} CASES PENDING
                    </span>
                  </h3>
                  <p className="text-xs text-red-300/80">Real-time alerts submitted by citizens & pharmacists upon scanning unverified batches</p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Enforcement Directorate: <strong className="text-emerald-400">ACTIVE</strong>
              </span>
            </div>

            {investigations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active counterfeit investigations reported at this time.
              </div>
            ) : (
              <div className="grid gap-3">
                {investigations.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-900/90 border border-red-500/40 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs hover:border-red-500 transition shadow-lg"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-red-400 text-sm">{rep.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/30">
                          FLAGGED BATCH: {rep.batchId}
                        </span>
                        <span className="text-slate-400">
                          Suspect Pharmacy: <strong className="text-white text-sm">{rep.storeName}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300">
                          {rep.status}
                        </span>
                      </div>

                      <p className="text-slate-200 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        "{rep.description}"
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{rep.location}</span>
                        </span>
                        <span>• Contact: <strong className="text-slate-300">{rep.reporterContact}</strong></span>
                        <span>• Filed: {new Date(rep.filedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateInvestigation(rep.id, "INSPECTOR_ON_SITE")}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold transition border border-slate-700 text-xs"
                      >
                        🚨 Dispatch Inspector
                      </button>
                      <button
                        onClick={() => handleUpdateInvestigation(rep.id, "STORE_QUARANTINED")}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition shadow-md shadow-red-600/30 text-xs"
                      >
                        🛑 Quarantine Store
                      </button>
                      <button
                        onClick={() => handleUpdateInvestigation(rep.id, "CASE_RESOLVED_SEIZED")}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition text-xs"
                      >
                        ✓ Resolved
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
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Factory Batches Formulated</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {batches.filter(b => b.manufacturerName?.includes('ABC')).length}
              </span>
              <span className="text-[10px] text-slate-500">Good Manufacturing Practice (GMP)</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Ready for Dispatch</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'Manufactured').length}
              </span>
              <span className="text-[10px] text-slate-500">Awaiting Distributor Transshipment</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Active Downstream Fleet</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">
                {batches.filter(b => b.stage !== 'Manufactured' && b.stage !== 'SoldToCustomer').length}
              </span>
              <span className="text-[10px] text-slate-500">In Transit & Wholesale Depots</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Total Units Produced</span>
              <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">9,200</span>
              <span className="text-[10px] text-slate-500">Tablets & Capsules Certified</span>
            </div>
          </>
        )}

        {currentUser.role === 'distributor' && (
          <>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Batches in Transshipment</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'DistributorReceived' || b.stage === 'Manufactured').length}
              </span>
              <span className="text-[10px] text-slate-500">Hub 12 Logistics Terminal</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Cold-Chain Reefer Status</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block flex items-center gap-1.5">
                <Thermometer className="w-5 h-5 text-blue-400" /> 4.2°C
              </span>
              <span className="text-[10px] text-emerald-400">100% Cold-Chain Compliant</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Awaiting Wholesaler Delivery</span>
              <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'DistributorReceived').length}
              </span>
              <span className="text-[10px] text-slate-500">Ready for Transfer Action</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Fleet Transit Security</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">SECURE</span>
              <span className="text-[10px] text-slate-500">Smart Seals Verified</span>
            </div>
          </>
        )}

        {currentUser.role === 'wholesaler' && (
          <>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Depot Pallet Inventory</span>
              <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'WholesalerReceived').length}
              </span>
              <span className="text-[10px] text-slate-500">Regional Depot 9, Bangalore</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Allocated to Pharmacies</span>
              <span className="text-2xl font-black text-pink-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'PharmacyReceived' || b.stage === 'SoldToCustomer').length}
              </span>
              <span className="text-[10px] text-slate-500">Retail Distribution Channels</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Quality Verification Status</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">VERIFIED</span>
              <span className="text-[10px] text-emerald-400">All Lots Cryptographically Cleared</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Storage Compliance</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">OPTIMAL</span>
              <span className="text-[10px] text-slate-500">Cleanroom Temperature Controlled</span>
            </div>
          </>
        )}

        {currentUser.role === 'pharmacy' && (
          <>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">In-Stock on Pharmacy Shelves</span>
              <span className="text-2xl font-black text-pink-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'PharmacyReceived').length}
              </span>
              <span className="text-[10px] text-slate-500">Available to Dispense to Patients</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Dispensed to Patients</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {batches.filter(b => b.stage === 'SoldToCustomer').length}
              </span>
              <span className="text-[10px] text-emerald-400">Logged on Blockchain</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Prescription Audit Status</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">100% OK</span>
              <span className="text-[10px] text-slate-500">Anti-Diversion Protocols Active</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Customer Verification Slips</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">ENABLED</span>
              <span className="text-[10px] text-slate-500">Direct Packaging QR Verification</span>
            </div>
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">National Batch Registry</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {batches.length}
              </span>
              <span className="text-[10px] text-emerald-400">100% On-Chain Authenticated</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Citizen Reports Received</span>
              <span className="text-2xl font-black text-red-400 font-mono mt-1 block">
                {investigations.length}
              </span>
              <span className="text-[10px] text-red-300">Enforcement Cases Tracked</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Quarantined Lots</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {batches.filter(b => b.isRecalled).length}
              </span>
              <span className="text-[10px] text-slate-500">Recalls Enforced Worldwide</span>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium">Consortium Validator Health</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">5 NODES</span>
              <span className="text-[10px] text-emerald-400">Proof of Authority Consensus</span>
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
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong>{filteredBatches.length}</strong> batches in <strong className="text-emerald-400">{currentUser.badge}</strong> workspace
        </div>
      </div>

      {/* Batches Table with Role Context */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Batch Identifier</th>
                <th className="px-5 py-3.5">Medicine & Dosage</th>
                <th className="px-5 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5">Current Custodian</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    No medicine batches found matching your role workspace filter.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isExpired = new Date() > new Date(batch.expiryDate);

                  return (
                    <tr key={batch.batchId} className="hover:bg-slate-750/30 transition">
                      {/* Batch ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400 text-sm">{batch.batchId}</span>
                          {isExpired && (
                            <span className="text-[10px] text-amber-400" title="Expired Batch">⚠️</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Vol: {batch.quantity.toLocaleString()} {batch.unit || 'units'}
                        </span>
                      </td>

                      {/* Medicine */}
                      <td className="px-5 py-4 font-sans">
                        <div className="font-bold text-white text-sm">{batch.medicineName}</div>
                        <span className="text-xs text-slate-400">{batch.dosage}</span>
                      </td>

                      {/* Current Stage */}
                      <td className="px-5 py-4">
                        {getStageBadge(batch.stage)}
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                          {batch.history?.length || 1} hops recorded
                        </span>
                      </td>

                      {/* Custodian */}
                      <td className="px-5 py-4 font-sans">
                        <div className="font-semibold text-slate-200 text-xs truncate max-w-[160px]">
                          {batch.currentOwnerName}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[140px]">
                          {batch.currentOwner}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4">
                        <div className={`font-semibold ${isExpired ? 'text-red-400' : 'text-slate-300'}`}>
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </div>
                        <span className={`text-[10px] ${isExpired ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                          {isExpired ? 'EXPIRED' : 'Valid'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quality CoA Button */}
                          <button
                            onClick={() => setCertTargetBatch(batch)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-700 transition"
                            title="View Quality Certificate (IPFS CoA)"
                          >
                            <Award className="w-4 h-4 text-amber-400" />
                          </button>

                          {/* QR Code Button */}
                          <button
                            onClick={() => setQrTargetBatch(batch)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                            title="Print / View QR Label"
                          >
                            <QrCode className="w-4 h-4 text-emerald-400" />
                          </button>

                          {/* Verify Page View */}
                          <button
                            onClick={() => onNavigateToVerify(batch.batchId)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                            title="Verify Public Provenance"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>

                          {/* Pharmacy Dispense Action */}
                          {batch.stage === 'PharmacyReceived' && !batch.isRecalled && !isExpired && (
                            <button
                              onClick={() => handleDispense(batch.batchId)}
                              disabled={dispenseLoading === batch.batchId}
                              className="px-2.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Dispense to Patient</span>
                            </button>
                          )}

                          {/* Transfer Custody Button */}
                          {batch.stage !== 'SoldToCustomer' && batch.stage !== 'PharmacyReceived' && !batch.isRecalled && (
                            <button
                              onClick={() => setTransferTargetBatch(batch)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Transfer Custody</span>
                            </button>
                          )}

                          {/* Emergency Recall Button (Admin/Manufacturer) */}
                          {(currentUser.role === 'admin' || currentUser.role === 'manufacturer') && !batch.isRecalled && (
                            <button
                              onClick={() => handleRecall(batch.batchId)}
                              className="p-1.5 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-500/40 transition"
                              title="Emergency Recall Order"
                            >
                              <ShieldAlert className="w-4 h-4" />
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
