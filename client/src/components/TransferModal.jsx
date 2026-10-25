import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Truck, ShieldCheck, AlertCircle, CheckCircle, Thermometer, MapPin, Building2, Heart } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl swing-raised shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-200" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: Organ Custody Transfer Protocol [LifeLedger v2.0]
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-[#FFFFFF] border-r-[#808080] border-b-[#808080] hover:bg-[#D4D0C8] active:translate-y-px"
            title="Close Dialog"
          >
            ✕
          </button>
        </div>

        {/* Dialog Header Banner */}
        <div className="bg-[#ECE9D8] px-3 py-2 border-b border-[#808080] flex items-center justify-between text-[11px]">
          <div>
            <span className="font-bold text-[#0A246A]">Target Organ:</span>{' '}
            <span className="font-mono font-bold bg-white px-1 border border-[#808080]">{organId}</span>{' '}
            <span className="text-[#555555]">({organType} • {bloodType})</span>
          </div>
          <div className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 border border-amber-300 font-bold">
            STAGE: {batch.stage}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleTransfer} className="p-3 overflow-y-auto space-y-3 bg-[#ECE9D8] flex-1">
          {error && (
            <div className="p-2 swing-sunken bg-[#FFF0F0] border border-red-500 text-red-900 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong>Handoff Rejection:</strong> {error}
              </div>
            </div>
          )}

          {/* Current Custodian Box */}
          <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
            <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
              1. Releasing Custodian (Signer)
            </legend>
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#555555]">Authorized Node:</span>
                <span className="font-bold text-[#111111]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">Ethereum Signer Address:</span>
                <span className="font-mono text-[10px] text-blue-900">{currentUser.ethAddress}</span>
              </div>
            </div>
          </fieldset>

          {/* Destination Node */}
          <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
            <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
              2. Designated Receiving Node
            </legend>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
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
                  className="swing-input w-full font-bold text-[11px]"
                >
                  {availableRecipients.map(u => (
                    <option key={u.ethAddress} value={u.ethAddress}>
                      [{u.badge}] {u.name} — {u.organization}
                    </option>
                  ))}
                </select>
              </div>

              {selectedNode && (
                <div className="swing-sunken p-2 bg-[#F9F8F5] text-[10px] space-y-0.5">
                  <div><strong>Operating Base:</strong> {selectedNode.location}</div>
                  <div><strong>Public Address:</strong> <span className="font-mono">{selectedNode.ethAddress}</span></div>
                </div>
              )}
            </div>
          </fieldset>

          {/* Transit Telemetry */}
          <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
            <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
              3. Custodial Telemetry & Transit Location
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Transfer Point / Milestone:
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="swing-input w-full text-[11px]"
                  placeholder="e.g. Green Corridor Checkpoint #2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Cryo Container Temp (°C):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="swing-input w-full font-mono font-bold text-[11px] text-blue-900"
                  />
                  <span className="text-[10px] text-[#555555]">°C</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Handoff Attestation / Carrier Notes:
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="swing-input w-full text-[11px] font-mono"
                />
              </div>
            </div>
          </fieldset>

          {/* Footer Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-[#808080]">
            <div className="text-[10px] text-[#555555] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Cryptographically signs custody transfer transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="swing-btn text-xs py-1 px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="swing-btn swing-btn-primary text-xs py-1 px-4 flex items-center gap-1.5"
              >
                {loading ? (
                  <span>Signing Transfer...</span>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-blue-800" />
                    <span>OK - Sign Medical Handoff</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: Transfer Protocol</div>
          <div className="swing-status-pane">Smart Contract: transferCustody()</div>
          <div className="swing-status-pane flex-1 text-right">Verification: Ready</div>
        </div>
      </div>
    </div>
  );
}
