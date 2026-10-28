import React, { useState } from 'react';
import { X, Heart, Sparkles, ShieldCheck, AlertCircle, CheckCircle, Activity, Thermometer, Clock } from 'lucide-react';
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

  if (!isOpen) return null;

  const loadPreset = (key) => {
    const preset = ORGAN_PRESETS[key];
    const prefix = key === 'kidney' ? 'ORG-KID-' : key === 'heart' ? 'ORG-HRT-' : 'ORG-LVR-';
    if (preset) {
      setFormData({
        ...preset,
        organId: prefix + Math.floor(1000 + Math.random() * 9000)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authorizedRole = (currentUser.role === 'opo' || currentUser.role === 'admin' || currentUser.role === 'manufacturer')
      ? currentUser.role
      : 'opo';

    if (currentUser.role !== authorizedRole) {
      switchRole('opo');
    }

    try {
      const res = await fetch('/api/organs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': authorizedRole
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
      if (onSuccess) onSuccess(data.organ || data.batch);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl swing-raised shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-300 fill-red-300" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: Harvest & Register Donor Organ [LifeLedger PoA v2.0]
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

        {/* Dialog Subheader & Presets Toolbar */}
        <div className="bg-[#ECE9D8] px-3 py-2 border-b border-[#808080] flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[11px] text-[#333333]">
            <span className="font-bold">OPO Node:</span> Authenticated as <span className="font-mono bg-white px-1 border border-[#808080]">{currentUser.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-[#555555]">Fast Templates:</span>
            <button
              type="button"
              onClick={() => loadPreset('kidney')}
              className="swing-btn text-[10px] py-0.5 px-1.5"
            >
              Kidney (24h)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('heart')}
              className="swing-btn text-[10px] py-0.5 px-1.5 font-bold text-red-900"
            >
              Heart (4h Urgent)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('liver')}
              className="swing-btn text-[10px] py-0.5 px-1.5"
            >
              Liver (12h)
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto space-y-3 bg-[#ECE9D8] flex-1">
          {error && (
            <div className="p-2 swing-sunken bg-[#FFF0F0] border border-red-500 text-red-900 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong>EVM Execution / Validation Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Group 1: Organ Specimen Identifiers */}
          <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
            <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
              1. Specimen & Genetic Profile
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Organ Barcode ID:
                </label>
                <input
                  type="text"
                  required
                  value={formData.organId}
                  onChange={(e) => setFormData({ ...formData, organId: e.target.value.toUpperCase() })}
                  className="swing-input w-full font-mono text-[11px] font-bold"
                  placeholder="ORG-KID-XXXX"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Organ Type / Anatomical Side:
                </label>
                <select
                  value={formData.organType}
                  onChange={(e) => setFormData({ ...formData, organType: e.target.value })}
                  className="swing-input w-full text-[11px]"
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
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Donor Blood Group:
                </label>
                <select
                  value={formData.donorBloodType}
                  onChange={(e) => setFormData({ ...formData, donorBloodType: e.target.value })}
                  className="swing-input w-full font-bold text-[11px] text-[#0A246A]"
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
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Donor Registry ID (Form 8):
                </label>
                <input
                  type="text"
                  required
                  value={formData.donorId}
                  onChange={(e) => setFormData({ ...formData, donorId: e.target.value })}
                  className="swing-input w-full font-mono text-[11px]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  HLA Marker / Crossmatch Histocompatibility:
                </label>
                <input
                  type="text"
                  required
                  value={formData.hlaMarker}
                  onChange={(e) => setFormData({ ...formData, hlaMarker: e.target.value })}
                  className="swing-input w-full text-[11px]"
                />
              </div>
            </div>
          </fieldset>

          {/* Group 2: Critical Ischemia & Preservation Protocol */}
          <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
            <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
              2. Ischemia Window & Cold-Chain Telemetry
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Ischemic Limit (Hours):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={formData.ischemicLimitHours}
                    onChange={(e) => setFormData({ ...formData, ischemicLimitHours: e.target.value })}
                    className="swing-input w-full font-mono font-bold text-[11px]"
                  />
                  <span className="text-[10px] text-[#555555]">hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Harvest Cryo Temp (°C):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.initialTemp}
                    onChange={(e) => setFormData({ ...formData, initialTemp: e.target.value })}
                    className="swing-input w-full font-mono font-bold text-[11px] text-blue-900"
                  />
                  <span className="text-[10px] text-[#555555]">°C</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Preservation Solution:
                </label>
                <input
                  type="text"
                  required
                  value={formData.preservationProtocol}
                  onChange={(e) => setFormData({ ...formData, preservationProtocol: e.target.value })}
                  className="swing-input w-full text-[11px]"
                />
              </div>
            </div>
          </fieldset>

          {/* Group 3: Allocation Destination & Recipient */}
          <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
            <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
              3. Recipient Matching & Transplant Hospital
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Matched Recipient ID:
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientId}
                  onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                  className="swing-input w-full font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  Target Surgical Hospital:
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientHospital}
                  onChange={(e) => setFormData({ ...formData, recipientHospital: e.target.value })}
                  className="swing-input w-full text-[11px]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                  OPO Surgical Procuring Notes & Legal Attestation:
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="swing-input w-full text-[11px] font-mono"
                  placeholder="Enter procurement operating room details..."
                />
              </div>
            </div>
          </fieldset>

          {/* Footer Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-[#808080]">
            <div className="text-[10px] text-[#555555] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
              <span>Creates immutable on-chain record on PoA EVM block</span>
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
                  <span>Executing EVM Tx...</span>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-red-700 fill-red-700" />
                    <span>OK - Sign & Register Harvest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: Modal Form</div>
          <div className="swing-status-pane">Chain: LifeLedger PoA (ChainID: 31337)</div>
          <div className="swing-status-pane flex-1 text-right">Gas Limit: 3,000,000</div>
        </div>
      </div>
    </div>
  );
}
