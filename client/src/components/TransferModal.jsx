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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Transfer Batch Custody</h3>
              <p className="text-xs text-slate-400">Commit ownership transfer on Ethereum smart contract</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Custody Transition Visual */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Current Custodian</span>
              <span className="font-bold text-slate-200">{batch.currentOwnerName}</span>
              <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[130px]">{batch.currentOwner}</span>
            </div>
            <div className="px-2">
              <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Target Recipient</span>
              <span className="font-bold text-emerald-400">{targetTitle}</span>
              <span className="text-[10px] text-slate-400 font-mono block">Enforced by Contract</span>
            </div>
          </div>

          {/* Select Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Approved {targetTitle}
            </label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            >
              {eligibleRecipients.length > 0 ? (
                eligibleRecipients.map(p => (
                  <option key={p.ethAddress} value={p.ethAddress}>
                    {p.name} ({p.ethAddress.slice(0, 8)}...{p.ethAddress.slice(-6)}) - {p.location}
                  </option>
                ))
              ) : (
                <option value={defaultRecipient.ethAddress}>
                  {defaultRecipient.name} ({defaultRecipient.ethAddress.slice(0, 8)}...)
                </option>
              )}
            </select>
          </div>

          {/* Shipping & Handling Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Dispatch & Logistics Notes (Stored in Block Event)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatched via temperature-monitored refrigerated container #TC-209. Cold chain unbroken (2°C-8°C)."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>This transfer creates a verifiable on-chain transaction hash signed by your identity.</span>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Signing & Broadcasting Tx...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Execute Blockchain Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
