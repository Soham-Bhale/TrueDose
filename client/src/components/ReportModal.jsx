import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modern Modal Header */}
        <div className="bg-red-950 px-5 py-4 text-white flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Regulatory Incident Alert</h3>
              <p className="text-xs text-red-300">Statutory NOTTO / UNOS Anti-Trafficking Alert</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-900/50 text-red-300 hover:text-white hover:bg-red-800 flex items-center justify-center transition-colors"
            title="Close Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedReport ? (
          <div className="p-5 bg-slate-50 space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>REGULATORY INVESTIGATION CASE INITIALIZED</span>
              </div>
              <p className="text-slate-700">
                Your incident report has been securely registered in the central audit ledger.
                Case reference: <strong className="font-mono text-emerald-900">{submittedReport.id}</strong>
              </p>
              <div className="text-xs bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div><strong className="text-slate-800">Organ Specimen:</strong> {submittedReport.organId || submittedReport.batchId}</div>
                <div><strong className="text-slate-800">Facility:</strong> {submittedReport.storeName}</div>
                <div><strong className="text-slate-800">Reported At:</strong> {new Date(submittedReport.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <strong className="text-slate-900">Recommended Action:</strong>
              <p>
                Switch to the <strong>National Regulatory Authority (Admin)</strong> workstation to review the active investigation queue and issue an Emergency Quarantine lock on this organ.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Close Dialog
              </button>
              <button
                type="button"
                onClick={handleGoToAdmin}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Switch to Regulatory Admin Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 bg-slate-50 overflow-y-auto space-y-4 flex-1">
            {/* Warning Banner */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-900 font-semibold">Statutory Whistleblower Channel:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Reports trigger an automated compliance alert to NOTTO regulatory auditors. Submit when cold-chain breach, unverified specimen, or protocol deviation occurs.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                <strong>Submission Error:</strong> {error}
              </div>
            )}

            {/* Target Organ ID */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                1. Target Specimen Under Investigation
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Organ ID:</span>
                <span className="font-mono font-bold text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded border border-red-200">
                  {targetId}
                </span>
                {organType && <span className="text-xs text-slate-500">({organType})</span>}
              </div>
            </div>

            {/* Violation Details */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                2. Violation Classification & Facility
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Infraction / Breach Classification:
                  </label>
                  <select
                    value={formData.violationCategory}
                    onChange={(e) => setFormData({ ...formData, violationCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Cold-Chain Thermal Excursion (> 8°C)">Cold-Chain Thermal Excursion (&gt; 8°C)</option>
                    <option value="Suspected Commercial Organ Trafficking">Suspected Commercial Organ Trafficking</option>
                    <option value="Unregistered / Unverified Organ ID">Unregistered / Unverified Organ ID</option>
                    <option value="Forged Donor Form 8 Consent Papers">Forged Donor Form 8 Consent Papers</option>
                    <option value="Expired Safe Cold Ischemia Window">Expired Safe Cold Ischemia Window</option>
                    <option value="ABO Blood Group / HLA Incompatibility Alert">ABO Blood Group / HLA Incompatibility Alert</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Facility / Operating Hospital:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.facilityName}
                      onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Metro Transplant Wing"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Geographic Location:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Mumbai, Maharashtra"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Narrative Description / Observations:
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
                    placeholder="Provide specific telemetry data, seal tampering, or legal inconsistencies..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reporting Officer / Contact Detail:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reporterContact}
                    onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Confidential Regulatory Submission
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
                    <span>Registering Case...</span>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Dispatch Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>LifeLedger Regulatory Channel</span>
          <span className="text-emerald-700 font-semibold">Audit Flag: READY</span>
        </div>
      </div>
    </div>
  );
}
