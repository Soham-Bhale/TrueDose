import React, { useState } from 'react';
import { X, Heart, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ORGAN_PRESETS = {
  kidney: {
    organId: 'ORG-KID-' + Math.floor(1000 + Math.random() * 9000),
    organType: 'Kidney (Left)',
    donorId: 'DNR-DEL-' + Math.floor(1000 + Math.random() * 9000),
    donorBloodType: 'O+',
    hlaMarker: '6/6 HLA-Matched (A*02, B*44, DRB1*04)',
    ischemicLimitHours: 24,
    recipientId: 'RCP-4109',
    recipientHospital: 'Apollo Institute of Renal Sciences',
    preservationProtocol: 'University of Wisconsin (UW) Cold Solution',
    initialTemp: 2.4,
    notes: 'Brain death confirmed by two independent neurological evaluations. Next-of-kin Form 8 consent cryptographically signed.'
  },
  heart: {
    organId: 'ORG-HRT-' + Math.floor(1000 + Math.random() * 9000),
    organType: 'Heart (Whole)',
    donorId: 'DNR-BLR-' + Math.floor(1000 + Math.random() * 9000),
    donorBloodType: 'A+',
    hlaMarker: '5/6 HLA-Matched (Cardiac Emergency)',
    ischemicLimitHours: 4,
    recipientId: 'RCP-8831',
    recipientHospital: 'Fortis Escorts Heart Institute',
    preservationProtocol: 'Custodiol HTK Hypothermic Cardioplegia',
    initialTemp: 1.8,
    notes: 'STAT Priority 1A. Direct green-corridor air ambulance dispatch required. Echocardiogram LVEF 65%.'
  },
  liver: {
    organId: 'ORG-LVR-' + Math.floor(1000 + Math.random() * 9000),
    organType: 'Liver (Whole)',
    donorId: 'DNR-HYD-' + Math.floor(1000 + Math.random() * 9000),
    donorBloodType: 'B+',
    hlaMarker: 'Compatible Panel Reactive Antibodies < 10%',
    ischemicLimitHours: 12,
    recipientId: 'RCP-3301',
    recipientHospital: 'Global Hospital Liver Transplant Center',
    preservationProtocol: 'Celsior Hypothermic Perfusion Solution',
    initialTemp: 3.1,
    notes: 'Cadaveric donor liver procured in sterile surgical field. Biopsy confirms zero micro-steatosis.'
  }
};

export default function CreateBatchModal({ isOpen, onClose, onSuccess }) {
  const { currentUser, switchRole } = useAuth();
  const [formData, setFormData] = useState(ORGAN_PRESETS.kidney);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        ...ORGAN_PRESETS.kidney,
        organId: 'ORG-KID-' + Math.floor(1000 + Math.random() * 9000),
        donorId: 'DNR-DEL-' + Math.floor(1000 + Math.random() * 9000)
      });
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadPreset = (key) => {
    const preset = ORGAN_PRESETS[key];
    if (preset) {
      setFormData({
        ...preset,
        organId: preset.organId.slice(0, 8) + Math.floor(1000 + Math.random() * 9000),
        donorId: preset.donorId.slice(0, 8) + Math.floor(1000 + Math.random() * 9000)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const roleToUse = (currentUser.role === 'opo' || currentUser.role === 'admin' || currentUser.role === 'manufacturer')
      ? currentUser.role
      : 'opo';

    try {
      const res = await fetch('/api/organs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': roleToUse
        },
        body: JSON.stringify({
          ...formData,
          ischemicLimitHours: Number(formData.ischemicLimitHours),
          initialTemp: Number(formData.initialTemp)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to harvest & register organ on blockchain');
      }

      setLoading(false);
      if (currentUser.role !== 'opo' && currentUser.role !== 'admin') {
        switchRole('opo');
      }
      if (onSuccess) onSuccess(data.organ || data.batch);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modern Window Titlebar */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-400">
              <Heart className="w-5 h-5 fill-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Harvest & Register Donor Organ</h3>
              <p className="text-xs text-slate-400">LifeLedger EVM PoA Consortium Protocol</p>
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

        {/* Dialog Subheader & Presets Toolbar */}
        <div className="bg-slate-100/80 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="text-slate-600 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Authenticated Node:</span>
            <span className="font-mono font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-2xs">{currentUser.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fast Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset('kidney')}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              Kidney (24h)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('heart')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 transition-colors shadow-2xs"
            >
              Heart (4h STAT)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('liver')}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              Liver (12h)
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 bg-slate-50 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong>EVM Execution / Validation Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Group 1: Organ Specimen Identifiers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
              <span>1. Specimen & Genetic Profile</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organ Barcode ID:
                </label>
                <input
                  type="text"
                  required
                  value={formData.organId}
                  onChange={(e) => setFormData({ ...formData, organId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="ORG-KID-XXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organ Type / Anatomical Side:
                </label>
                <select
                  value={formData.organType}
                  onChange={(e) => setFormData({ ...formData, organType: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Kidney (Left)">Kidney (Left)</option>
                  <option value="Kidney (Right)">Kidney (Right)</option>
                  <option value="Heart (Whole)">Heart (Whole - Thoracic)</option>
                  <option value="Liver (Whole)">Liver (Whole - Abdominal)</option>
                  <option value="Lung (Bilateral)">Lung (Bilateral)</option>
                  <option value="Cornea (Pair)">Cornea (Pair - Ocular)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Donor Blood Group:
                </label>
                <select
                  value={formData.donorBloodType}
                  onChange={(e) => setFormData({ ...formData, donorBloodType: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold text-blue-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O- Universal)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Donor Registry ID (Form 8):
                </label>
                <input
                  type="text"
                  required
                  value={formData.donorId}
                  onChange={(e) => setFormData({ ...formData, donorId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HLA Marker / Crossmatch Histocompatibility:
                </label>
                <input
                  type="text"
                  required
                  value={formData.hlaMarker}
                  onChange={(e) => setFormData({ ...formData, hlaMarker: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Critical Ischemia & Preservation Protocol */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
              <span>2. Ischemia Window & Cold-Chain Telemetry</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ischemic Limit (Hours):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={formData.ischemicLimitHours}
                    onChange={(e) => setFormData({ ...formData, ischemicLimitHours: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harvest Cryo Temp (°C):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.initialTemp}
                    onChange={(e) => setFormData({ ...formData, initialTemp: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-blue-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">°C</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preservation Solution:
                </label>
                <input
                  type="text"
                  required
                  value={formData.preservationProtocol}
                  onChange={(e) => setFormData({ ...formData, preservationProtocol: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Allocation Destination & Recipient */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-semibold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
              <span>3. Recipient Matching & Transplant Hospital</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matched Recipient ID:
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientId}
                  onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Surgical Hospital:
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientHospital}
                  onChange={(e) => setFormData({ ...formData, recipientHospital: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  OPO Surgical Procuring Notes & Legal Attestation:
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
                  placeholder="Enter procurement operating room details..."
                />
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Creates immutable on-chain record on PoA EVM block</span>
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
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Executing EVM Tx...</span>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Register Harvest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>LifeLedger PoA (ChainID: 31337)</div>
          <div>Gas Limit: 3,000,000</div>
          <div className="text-emerald-700 font-bold">Consortium Synced</div>
        </div>
      </div>
    </div>
  );
}
