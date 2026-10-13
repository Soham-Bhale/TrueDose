import React, { useState } from 'react';
import { X, ArrowRight, Truck, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TransferModal({ batch, isOpen, onClose, onSuccess }) {
  const { currentUser, participants } = useAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !batch) return null;

  // Determine expected recipient role based on current batch stage
  let targetRole = 'distributor';
  let targetTitle = 'Distributor';
  if (batch.stage === 'Manufactured') {
    targetRole = 'distributor';
    targetTitle = 'Authorized Distributor';
  } else if (batch.stage === 'DistributorReceived') {
    targetRole = 'wholesaler';
    targetTitle = 'Authorized Wholesaler';
  } else if (batch.stage === 'WholesalerReceived') {
    targetRole = 'pharmacy';
    targetTitle = 'Authorized Pharmacy';
  }

  // Filter available registered participants for this target role
  const eligibleRecipients = participants.filter(p => p.role.toLowerCase() === targetRole);
  const defaultRecipient = eligibleRecipients[0] || {
    name: targetRole === 'distributor' ? 'Apex Logistics & Distribution' :
          targetRole === 'wholesaler' ? 'Metro Health Wholesalers' : 'HealthPlus Community Pharmacy',
    ethAddress: targetRole === 'distributor' ? '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' :
                targetRole === 'wholesaler' ? '0x90F79bf6EB2c4f870365E785982E1f101E93b906' :
                '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    location: 'Registered Supply Depot'
  };

  const [selectedAddress, setSelectedAddress] = useState(defaultRecipient.ethAddress);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/batches/${batch.batchId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentUser.role
        },
        body: JSON.stringify({
          toAddress: selectedAddress,
          notes: notes || `Transferred to ${targetTitle} via secure supply channel`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      setLoading(false);
      onSuccess(data.batch);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Transfer Batch Custody</h3>
              <p className="text-xs text-slate-500">Sign custody transfer on Ethereum smart contract</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Batch Context */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Selected Lot:</span>
              <span className="font-bold text-slate-900">{batch.batchId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Medicine:</span>
              <span className="font-semibold text-slate-800">{batch.medicineName} ({batch.dosage})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Custodian:</span>
              <span className="text-slate-800">{batch.currentOwnerName}</span>
            </div>
          </div>

          {/* Sequential Step Indicator */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">
              Designated Recipient Entity ({targetTitle})
            </label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            >
              {eligibleRecipients.length > 0 ? (
                eligibleRecipients.map((p) => (
                  <option key={p.ethAddress} value={p.ethAddress}>
                    {p.name} ({p.location}) - {p.ethAddress.slice(0, 10)}...
                  </option>
                ))
              ) : (
                <option value={defaultRecipient.ethAddress}>
                  {defaultRecipient.name} ({defaultRecipient.location})
                </option>
              )}
            </select>
            <p className="text-[10px] text-slate-400">
              Only authorized entities in role <span className="font-semibold text-slate-600">{targetRole}</span> are allowed by smart contract sequential validation rules.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">Transit / Handoff Dispatch Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatched via temperature-monitored refrigerated vehicle #MH-12-8821 with intact seals."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              This action executes <code className="font-mono text-teal-800">transferBatch()</code> on the EVM. The recipient becomes the verified custodian and a new immutable block is appended.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{loading ? 'Recording Transfer...' : 'Confirm Blockchain Handoff'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
