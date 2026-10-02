import React, { useState, useEffect } from 'react';
import {
  Plus, Truck, QrCode, ShieldAlert, ShoppingBag, Eye, RefreshCw,
  Clock, CheckCircle, AlertTriangle, Building, Search, ArrowRight, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateBatchModal from '../components/CreateBatchModal';
import TransferModal from '../components/TransferModal';
import QRCodeModal from '../components/QRCodeModal';

export default function DashboardPage({ onNavigateToVerify }) {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transferTargetBatch, setTransferTargetBatch] = useState(null);
  const [qrTargetBatch, setQrTargetBatch] = useState(null);
  const [dispenseLoading, setDispenseLoading] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.batches) {
        setBatches(data.batches);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load batches:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
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
        fetchBatches();
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
        fetchBatches();
      } else {
        alert(data.error || "Failed to recall");
      }
    } catch (err) {
      alert("Error issuing recall: " + err.message);
    }
  };

  // Filter batches based on search and role view
  const filteredBatches = batches.filter(b => {
    const matchSearch =
      b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.currentOwnerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Role-specific badge styling
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
      {/* Role Banner */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
            {currentUser.role === 'manufacturer' && '👨‍💼'}
            {currentUser.role === 'distributor' && '🚚'}
            {currentUser.role === 'wholesaler' && '🏪'}
            {currentUser.role === 'pharmacy' && '💊'}
            {currentUser.role === 'admin' && '👨‍💻'}
            {currentUser.role === 'customer' && '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${currentUser.color || 'bg-slate-700'}`}>
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{currentUser.organization}</span>
              <span>•</span>
              <span className="font-mono text-emerald-400 truncate max-w-[200px]">{currentUser.ethAddress || 'Public Viewer'}</span>
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBatches}
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
              <span>Create New Batch</span>
            </button>
          )}
        </div>
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
          Showing <strong>{filteredBatches.length}</strong> registered medicine batches
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Batch Identifier</th>
                <th className="px-5 py-3.5">Medicine & Dosage</th>
                <th className="px-5 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5">Custodian</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5 text-right">Supply Chain Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    No medicine batches found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isOwner = currentUser.ethAddress && batch.currentOwner.toLowerCase() === currentUser.ethAddress.toLowerCase();
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
                              <span>Dispense</span>
                            </button>
                          )}

                          {/* Transfer Custody Button */}
                          {batch.stage !== 'SoldToCustomer' && batch.stage !== 'PharmacyReceived' && !batch.isRecalled && (
                            <button
                              onClick={() => setTransferTargetBatch(batch)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Transfer</span>
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
          fetchBatches();
          setQrTargetBatch(newBatch);
        }}
      />

      <TransferModal
        batch={transferTargetBatch}
        isOpen={!!transferTargetBatch}
        onClose={() => setTransferTargetBatch(null)}
        onSuccess={() => {
          fetchBatches();
        }}
      />

      <QRCodeModal
        batch={qrTargetBatch}
        isOpen={!!qrTargetBatch}
        onClose={() => setQrTargetBatch(null)}
      />
    </div>
  );
}
