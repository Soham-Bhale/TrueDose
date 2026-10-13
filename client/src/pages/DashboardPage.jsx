import React, { useState, useEffect } from 'react';
import {
  Plus, Truck, QrCode, ShieldAlert, ShoppingBag, Eye, RefreshCw,
  Factory, Warehouse, Store, UserCheck, Award, Search
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

const STAGE_LABELS = {
  Manufactured:        { label: 'Manufactured',   color: 'bg-teal-50 text-teal-800 border-teal-200' },
  DistributorReceived: { label: 'At Distributor',  color: 'bg-blue-50 text-blue-800 border-blue-200' },
  WholesalerReceived:  { label: 'At Wholesaler',   color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  PharmacyReceived:    { label: 'At Pharmacy',     color: 'bg-purple-50 text-purple-800 border-purple-200' },
  SoldToCustomer:      { label: 'Dispensed',       color: 'bg-slate-100 text-slate-700 border-slate-300' },
  Recalled:            { label: 'Recalled',        color: 'bg-rose-50 text-rose-800 border-rose-200' },
};

function StageBadge({ stage }) {
  const info = STAGE_LABELS[stage] || { label: stage, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${info.color}`}>
      {info.label}
    </span>
  );
}

function StatCard({ label, value, sub, accent = 'text-slate-900' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage({ onNavigateToVerify }) {
  const { currentUser, switchRole, demoUsers, investigationCount, refreshStats } = useAuth();
  const [batches, setBatches] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [currentUser]);

  const handleDispense = async (batchId) => {
    if (!window.confirm(`Mark batch ${batchId} as dispensed to patient?`)) return;
    setDispenseLoading(batchId);
    try {
      const res = await fetch(`/api/batches/${batchId}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-demo-role': 'pharmacy' },
        body: JSON.stringify({ notes: 'Dispensed at retail counter' })
      });
      const data = await res.json();
      if (res.ok) fetchDashboardData();
      else alert(data.error || 'Failed to dispense');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDispenseLoading(null);
    }
  };

  const handleRecall = async (batchId) => {
    const reason = window.prompt('Enter recall reason:', 'Contamination alert detected');
    if (!reason) return;
    try {
      const res = await fetch(`/api/batches/${batchId}/recall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-demo-role': currentUser.role },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) { alert(`Recall issued for ${batchId}`); fetchDashboardData(); }
      else alert(data.error || 'Failed to recall');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdateInvestigation = async (reportId, newStatus) => {
    try {
      const res = await fetch(`/api/stats/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { fetchDashboardData(); refreshStats(); }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBatches = batches.filter(b => {
    const q = searchTerm.toLowerCase();
    const match =
      b.batchId.toLowerCase().includes(q) ||
      b.medicineName.toLowerCase().includes(q) ||
      b.currentOwnerName.toLowerCase().includes(q);
    if (!match) return false;
    if (currentUser.role === 'manufacturer') return b.manufacturerName?.toLowerCase().includes('abc') || b.stage === 'Manufactured';
    if (currentUser.role === 'distributor')  return b.currentOwnerRole === 'distributor' || ['DistributorReceived','Manufactured'].includes(b.stage);
    if (currentUser.role === 'wholesaler')   return b.currentOwnerRole === 'wholesaler'  || ['WholesalerReceived','DistributorReceived'].includes(b.stage);
    if (currentUser.role === 'pharmacy')     return b.currentOwnerRole === 'pharmacy'    || ['PharmacyReceived','SoldToCustomer'].includes(b.stage);
    return true; // admin
  });

  // Per-role stat cards
  const statsCards = {
    manufacturer: [
      { label: 'My Batches', value: batches.filter(b => b.manufacturerName?.includes('ABC')).length, accent: 'text-teal-700' },
      { label: 'Ready to Ship', value: batches.filter(b => b.stage === 'Manufactured').length, accent: 'text-amber-700' },
      { label: 'In Transit', value: batches.filter(b => !['Manufactured','SoldToCustomer'].includes(b.stage)).length, accent: 'text-blue-700' },
    ],
    distributor: [
      { label: 'Batches Received', value: batches.filter(b => ['DistributorReceived','Manufactured'].includes(b.stage)).length, accent: 'text-blue-700' },
      { label: 'Awaiting Wholesaler', value: batches.filter(b => b.stage === 'DistributorReceived').length, accent: 'text-indigo-700' },
    ],
    wholesaler: [
      { label: 'In Depot', value: batches.filter(b => b.stage === 'WholesalerReceived').length, accent: 'text-indigo-700' },
      { label: 'Sent to Pharmacies', value: batches.filter(b => ['PharmacyReceived','SoldToCustomer'].includes(b.stage)).length, accent: 'text-purple-700' },
    ],
    pharmacy: [
      { label: 'In Stock', value: batches.filter(b => b.stage === 'PharmacyReceived').length, accent: 'text-purple-700' },
      { label: 'Dispensed', value: batches.filter(b => b.stage === 'SoldToCustomer').length, accent: 'text-teal-700' },
    ],
    admin: [
      { label: 'Total Batches', value: batches.length, accent: 'text-slate-900' },
      { label: 'Open Investigations', value: investigations.length, accent: 'text-rose-700' },
      { label: 'Recalled', value: batches.filter(b => b.isRecalled).length, accent: 'text-amber-700' },
    ],
  };

  const cards = statsCards[currentUser.role] || [];
  const ActiveIcon = ROLE_ICONS[currentUser.role] || Factory;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-5">

      {/* ── Role Switcher ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-2 px-1">
          Switch Role Workspace
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {demoUsers.filter(u => u.role !== 'customer').map(u => {
            const Icon = ROLE_ICONS[u.role] || Factory;
            const active = currentUser.role === u.role;
            return (
              <button
                key={u.role}
                onClick={() => switchRole(u.role)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition ${
                  active
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{u.badge}</div>
                  <div className="text-[10px] text-slate-400 truncate">{u.name}</div>
                </div>
                {u.role === 'admin' && investigationCount > 0 && (
                  <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {investigationCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Role Header + Actions ───────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{currentUser.name}</div>
            <div className="text-xs text-slate-500">{currentUser.headline}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(currentUser.role === 'manufacturer' || currentUser.role === 'admin') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Batch
            </button>
          )}

          {currentUser.role === 'pharmacy' && (
            <button
              onClick={() => onNavigateToVerify('PCM001')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              Verify QR
            </button>
          )}
        </div>
      </div>

      {/* ── Admin: Active Investigations ──────────────────────────── */}
      {currentUser.role === 'admin' && (
        <div className="bg-white border border-rose-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-rose-100 bg-rose-50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="font-semibold text-sm text-slate-900">Active Counterfeit Investigations</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {investigations.length}
              </span>
            </div>
            <span className="text-[11px] text-rose-600 font-semibold">REGULATORY COMMAND</span>
          </div>

          {investigations.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No active investigations at this time.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {investigations.map(rep => (
                <div key={rep.id} className="px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-rose-700">{rep.id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                        Batch: {rep.batchId}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{rep.description}</p>
                    <p className="text-[11px] text-slate-400">
                      {rep.storeName} · {rep.location} · {new Date(rep.filedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'INSPECTOR_ON_SITE')}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition"
                    >
                      Dispatch Inspector
                    </button>
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'STORE_QUARANTINED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 transition"
                    >
                      Quarantine
                    </button>
                    <button
                      onClick={() => handleUpdateInvestigation(rep.id, 'CASE_RESOLVED_SEIZED')}
                      className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      {cards.length > 0 && (
        <div className={`grid gap-4 ${cards.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {cards.map(c => (
            <StatCard key={c.label} label={c.label} value={c.value} accent={c.accent} />
          ))}
        </div>
      )}

      {/* ── Batch Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search batch, medicine..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
          <span className="text-xs text-slate-500 shrink-0">
            {filteredBatches.length} batch{filteredBatches.length !== 1 && 'es'} · <span className="font-semibold text-teal-700">{currentUser.badge}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Current Owner</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading batches...</td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No batches found for this role.
                  </td>
                </tr>
              ) : (
                filteredBatches.map(batch => {
                  const expired = new Date() > new Date(batch.expiryDate);
                  return (
                    <tr key={batch.batchId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 font-mono">{batch.batchId}</span>
                        {expired && <span className="ml-1.5 text-[10px] text-rose-600 font-bold">EXPIRED</span>}
                        <div className="text-[10px] text-slate-400 mt-0.5">{batch.quantity?.toLocaleString()} {batch.unit || 'units'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{batch.medicineName}</div>
                        <div className="text-slate-400">{batch.dosage}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={batch.stage} />
                        <div className="text-[10px] text-slate-400 mt-0.5">{batch.history?.length || 1} hops</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 truncate max-w-[140px]">{batch.currentOwnerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{batch.currentOwner}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={expired ? 'text-rose-700 font-semibold' : 'text-slate-800'}>
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </div>
                        <div className={`text-[10px] ${expired ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                          {expired ? 'Expired' : 'Valid'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setCertTargetBatch(batch)}
                            className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition"
                            title="Quality Certificate"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setQrTargetBatch(batch)}
                            className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50 transition"
                            title="QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToVerify(batch.batchId)}
                            className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition"
                            title="Verify"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {batch.stage === 'PharmacyReceived' && !batch.isRecalled && !expired && (
                            <button
                              onClick={() => handleDispense(batch.batchId)}
                              disabled={dispenseLoading === batch.batchId}
                              className="px-2 py-1.5 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              Dispense
                            </button>
                          )}

                          {!['SoldToCustomer','PharmacyReceived'].includes(batch.stage) && !batch.isRecalled && (
                            <button
                              onClick={() => setTransferTargetBatch(batch)}
                              className="px-2 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Truck className="w-3 h-3" />
                              Transfer
                            </button>
                          )}

                          {(currentUser.role === 'admin' || currentUser.role === 'manufacturer') && !batch.isRecalled && (
                            <button
                              onClick={() => handleRecall(batch.batchId)}
                              className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 transition"
                              title="Recall"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
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
        onSuccess={newBatch => { fetchDashboardData(); setQrTargetBatch(newBatch); }}
      />
      <TransferModal
        batch={transferTargetBatch}
        isOpen={!!transferTargetBatch}
        onClose={() => setTransferTargetBatch(null)}
        onSuccess={fetchDashboardData}
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
