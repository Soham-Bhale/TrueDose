import React, { useState, useEffect } from 'react';
import { X, Truck, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TransferModal({ batch, isOpen, onClose, onSuccess }) {
  const { currentUser, demoUsers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [toAddress, setToAddress] = useState('');
  const [location, setLocation] = useState('');
  const [temperature, setTemperature] = useState(2.4);
  const [notes, setNotes] = useState('');

  // Update form fields whenever a new batch is selected or opened
  useEffect(() => {
    if (batch) {
      let recommendedRole = 'logistics';
      if (batch.stage === 'Harvested') {
        recommendedRole = 'logistics';
      } else if (batch.stage === 'InTransit') {
        recommendedRole = 'authority';
      } else if (batch.stage === 'AllocationCleared') {
        recommendedRole = 'hospital';
      } else {
        recommendedRole = 'hospital';
      }

      const availableRecipients = demoUsers.filter(u => u.role !== 'customer');
      const defaultRecipient = availableRecipients.find(u => u.role === recommendedRole) || availableRecipients[0];

      setToAddress(defaultRecipient?.ethAddress || '');
      setLocation(
        recommendedRole === 'logistics' ? 'Air Ambulance Terminal 1D, Cryo-Bay 4' :
        recommendedRole === 'authority' ? 'NOTTO Central Allocation Directorate' :
        'Apollo Transplant Surgical Suite #3'
      );
      setTemperature(batch.latestTemperature || batch.temperatureCelsius || 2.4);
      setNotes(`Chain-of-custody handoff to authorized ${recommendedRole.toUpperCase()} node`);
      setError(null);
    }
  }, [batch, demoUsers, isOpen]);

  // Hook rules: all hooks must be called before conditional return
  if (!isOpen || !batch) return null;

  const organId = batch.organId || batch.batchId;
  const organType = batch.organType || batch.medicineName || 'Organ';
  const bloodType = batch.donorBloodType || 'O+';
  const availableRecipients = demoUsers.filter(u => u.role !== 'customer');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/organs/${organId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentUser.role
        },
        body: JSON.stringify({
          toAddress,
          location,
          currentTemp: Number(temperature),
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Medical custody transfer failed');
      }

      setLoading(false);
      if (onSuccess) onSuccess(data.organ || data.batch);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const selectedNode = demoUsers.find(u => u.ethAddress.toLowerCase() === toAddress.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modern Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Custody Transfer Protocol</h3>
              <p className="text-xs text-slate-400">LifeLedger EVM Proof-of-Authority Handoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Close Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Header Banner */}
        <div className="bg-slate-100/80 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Target Specimen:</span>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-blue-700 shadow-2xs">{organId}</span>
            <span className="text-slate-500">({organType} • {bloodType})</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
            STAGE: {batch.stage}
          </span>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleTransfer} className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong>Handoff Rejection:</strong> {error}
              </div>
            </div>
          )}

          {/* Current Custodian Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
              <span>1. Releasing Custodian (Signer)</span>
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Authorized Node:</span>
                <span className="font-semibold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Signer Address:</span>
                <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{currentUser.ethAddress}</span>
              </div>
            </div>
          </div>

          {/* Destination Node */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
              <span>2. Designated Receiving Node</span>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Consortium Entity:
                </label>
                <select
                  value={toAddress}
                  onChange={(e) => {
                    setToAddress(e.target.value);
                    const sel = demoUsers.find(u => u.ethAddress.toLowerCase() === e.target.value.toLowerCase());
                    if (sel) {
                      setNotes(`Custody handoff to ${sel.badge} (${sel.organization})`);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {availableRecipients.map(u => (
                    <option key={u.ethAddress} value={u.ethAddress}>
                      [{u.badge}] {u.name} — {u.organization}
                    </option>
                  ))}
                </select>
              </div>

              {selectedNode && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
                  <div><strong className="text-slate-900">Operating Base:</strong> {selectedNode.location}</div>
                  <div><strong className="text-slate-900">Public Address:</strong> <span className="font-mono text-[11px] text-slate-600">{selectedNode.ethAddress}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Transit Storage & Location */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
              <span>3. Transit Location & Safe Storage Temp</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer Point / Destination:
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Green Corridor Checkpoint #2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Container Temperature (°C) <span className="text-slate-400 font-normal">[2.0°C - 4.0°C]</span>:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-blue-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">°C</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Handoff Attestation / Carrier Notes:
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-sans bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>EVM cryptographic handoff signature</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing Transfer...</span>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Sign Medical Handoff</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>LifeLedger PoA Custody Protocol</div>
          <div>Smart Contract: transferCustody()</div>
          <div className="text-emerald-700 font-bold">Node Ready</div>
        </div>
      </div>
    </div>
  );
}
