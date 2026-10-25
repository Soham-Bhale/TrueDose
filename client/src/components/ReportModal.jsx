import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Send, CheckCircle2, ArrowRight, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportModal({ batchId, organType, isOpen, onClose, onSuccess, onNavigateToAdmin }) {
  const { switchRole, refreshStats } = useAuth();
  const [formData, setFormData] = useState({
    facilityName: 'Metro Critical Care OR #4',
    location: 'Mumbai Suburban Area',
    violationCategory: 'Cold-Chain Thermal Excursion (> 8°C)',
    description: 'Cryo-carrier reading spiked to 9.4°C during highway transport. Suspected cold perfusion seal failure.',
    reporterContact: 'Dr. A. Verma, Transplant Quality Officer (+91-98201-XXXXX)'
  });
  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const targetId = batchId || 'UNVERIFIED_SPECIMEN';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organId: targetId,
          batchId: targetId,
          medicineName: organType || 'Human Organ Graft',
          storeName: formData.facilityName,
          location: formData.location,
          description: `[${formData.violationCategory}] ${formData.description}`,
          reporterContact: formData.reporterContact
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit incident alert');

      setSubmittedReport(data.report);
      refreshStats();
      setLoading(false);
      if (onSuccess) onSuccess(data.report);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoToAdmin = () => {
    switchRole('admin');
    onClose();
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl swing-raised shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar bg-[#8C1A1A]">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: Regulatory Incident & Anti-Trafficking Alert [LifeLedger]
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

        {submittedReport ? (
          <div className="p-4 bg-[#ECE9D8] space-y-3">
            <div className="swing-sunken p-3 bg-[#F0FFF4] border border-green-600 text-[11px] space-y-2">
              <div className="flex items-center gap-2 text-green-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
                <span>REGULATORY INVESTIGATION CASE INITIALIZED</span>
              </div>
              <p className="text-[#333333]">
                Your incident report has been securely registered in the central audit ledger.
                Case reference: <strong className="font-mono">{submittedReport.id}</strong>
              </p>
              <div className="text-[10px] bg-white p-2 border border-[#CCCCCC] space-y-0.5">
                <div><strong>Organ Specimen:</strong> {submittedReport.organId || submittedReport.batchId}</div>
                <div><strong>Facility:</strong> {submittedReport.storeName}</div>
                <div><strong>Reported At:</strong> {new Date(submittedReport.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div className="p-2.5 swing-etched bg-[#ECE9D8] text-[11px] text-[#333333] space-y-1">
              <strong>Recommended Immediate Action:</strong>
              <p>
                Switch to the <strong>National Regulatory Authority (Admin)</strong> workstation to review the active investigation queue and issue an Emergency Quarantine lock on this organ.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#808080]">
              <button
                type="button"
                onClick={onClose}
                className="swing-btn text-xs py-1 px-3"
              >
                Close Dialog
              </button>
              <button
                type="button"
                onClick={handleGoToAdmin}
                className="swing-btn swing-btn-danger text-xs py-1 px-3 flex items-center gap-1 font-bold"
              >
                <span>Switch to Regulatory Admin Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 bg-[#ECE9D8] overflow-y-auto space-y-3 flex-1">
            {/* Warning Banner */}
            <div className="p-2 swing-sunken bg-[#FFFBEB] border border-amber-400 text-[11px] text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Statutory Whistleblower Channel:</strong>
                <p className="text-[10px] text-[#555555]">
                  Reports trigger an automated compliance alert to NOTTO and UNOS regulatory auditors. Submit when an unverified organ, cold-chain violation, or trafficking breach is detected.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-2 swing-sunken bg-[#FFF0F0] border border-red-500 text-red-900 text-[11px]">
                <strong>Submission Error:</strong> {error}
              </div>
            )}

            {/* Target Organ ID */}
            <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
              <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
                1. Target Specimen Under Investigation
              </legend>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#333333]">Organ ID / Barcode:</span>
                <span className="font-mono font-bold text-[12px] bg-white px-2 py-0.5 border border-[#808080] text-red-900">
                  {targetId}
                </span>
                {organType && <span className="text-[11px] text-[#666666]">({organType})</span>}
              </div>
            </fieldset>

            {/* Violation Details */}
            <fieldset className="p-2.5 swing-etched bg-[#ECE9D8]">
              <legend className="px-1 text-[11px] font-bold text-[#0A246A]">
                2. Violation Category & Facility
              </legend>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                    Infraction / Breach Classification:
                  </label>
                  <select
                    value={formData.violationCategory}
                    onChange={(e) => setFormData({ ...formData, violationCategory: e.target.value })}
                    className="swing-input w-full font-bold text-[11px]"
                  >
                    <option value="Cold-Chain Thermal Excursion (> 8°C)">Cold-Chain Thermal Excursion (&gt; 8°C)</option>
                    <option value="Suspected Commercial Organ Trafficking">Suspected Commercial Organ Trafficking</option>
                    <option value="Unregistered / Unverified Organ ID">Unregistered / Unverified Organ ID</option>
                    <option value="Forged Donor Form 8 Consent Papers">Forged Donor Form 8 Consent Papers</option>
                    <option value="Expired Safe Cold Ischemia Window">Expired Safe Cold Ischemia Window</option>
                    <option value="ABO Blood Group / HLA Incompatibility Alert">ABO Blood Group / HLA Incompatibility Alert</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                      Facility / Operating Hospital Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.facilityName}
                      onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                      className="swing-input w-full text-[11px]"
                      placeholder="e.g. Metro Transplant Wing"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                      City / Geographic Location:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="swing-input w-full text-[11px]"
                      placeholder="e.g. Mumbai, Maharashtra"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                    Narrative Description / Observations:
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="swing-input w-full text-[11px] font-mono"
                    placeholder="Provide specific telemetry data, seal tampering, or legal inconsistencies..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#333333] mb-0.5">
                    Reporting Officer / Contact Detail:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reporterContact}
                    onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    className="swing-input w-full text-[11px]"
                  />
                </div>
              </div>
            </fieldset>

            {/* Footer Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-[#808080]">
              <div className="text-[10px] text-[#555555]">
                Confidential Regulatory Submission
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
                  className="swing-btn swing-btn-danger text-xs py-1 px-4 flex items-center gap-1.5"
                >
                  {loading ? (
                    <span>Registering Case...</span>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                      <span>OK - Dispatch Regulatory Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: IncidentReportModal</div>
          <div className="swing-status-pane">Endpoint: /api/verify/report</div>
          <div className="swing-status-pane flex-1 text-right">Audit Flag: READY</div>
        </div>
      </div>
    </div>
  );
}
