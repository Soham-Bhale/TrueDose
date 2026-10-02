import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';

export default function ReportModal({ batchId, medicineName, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    storeName: '',
    location: '',
    description: '',
    reporterContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batchId || 'SUSPECT_BATCH',
          medicineName: medicineName || 'Unknown Product',
          storeName: formData.storeName,
          location: formData.location,
          description: formData.description,
          reporterContact: formData.reporterContact
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      setSubmittedId(data.reportId);
      setLoading(false);
      if (onSuccess) onSuccess(data.report);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Report Suspicious / Counterfeit Medicine</h3>
              <p className="text-xs text-red-300/80">Direct dispatch to National Drug Enforcement Directorate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Investigation Alert Dispatched</h4>
              <p className="text-xs text-slate-300">
                Your report has been securely registered in the TrueDose regulatory tracking system.
              </p>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl font-mono text-xs text-emerald-400 border border-slate-700">
              Tracking Case ID: <strong>{submittedId}</strong>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Reported Batch Number</span>
              <span className="font-bold text-red-400 text-sm font-mono">{batchId}</span>
              <span className="text-slate-400 block text-[11px] mt-0.5">Product: {medicineName || 'Unverified Medicine'}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Store / Pharmacy Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. Star Meds & Chemist, MG Road"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangalore, Karnataka"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Description & Observations
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Scanned QR code but blockchain returned counterfeit warning. Holographic seal on foil was missing."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Contact Info (Optional / Anonymous)
              </label>
              <input
                type="text"
                value={formData.reporterContact}
                onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                placeholder="Email or phone number for inspector follow-up"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

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
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Official Alert</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
