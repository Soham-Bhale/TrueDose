import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportModal({ batchId, medicineName, isOpen, onClose, onSuccess, onNavigateToAdmin }) {
  const { switchRole, refreshStats } = useAuth();
  const [formData, setFormData] = useState({
    storeName: '',
    location: '',
    description: '',
    reporterContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
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
          medicineName: medicineName || 'Unknown Formulation',
          storeName: formData.storeName,
          location: formData.location,
          description: formData.description,
          reporterContact: formData.reporterContact
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white text-rose-700 rounded-lg border border-rose-200 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Report Suspected Counterfeit Medicine</h3>
              <p className="text-xs text-slate-500">Alert National Drug Regulatory & Enforcement Directorate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedReport ? (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Investigation Case Filed</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your report has been logged to the National Drug Regulatory Authority. It is now active in the Regulator Command Center.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs text-left border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Case Identifier:</span>
                <span className="font-bold text-rose-700">{submittedReport.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Suspect Pharmacy:</span>
                <span className="font-bold text-slate-900">{submittedReport.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-700">{submittedReport.status}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={handleGoToAdmin}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>View in Regulator Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Flagged Batch:</span>
                <span className="font-bold text-rose-700">{batchId || 'UNVERIFIED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-900">{medicineName || 'Unknown Product'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Pharmacy / Vendor Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. CareWell Chemist, MG Road"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Store Location / City</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangalore, Karnataka"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Observation Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe packaging defect, missing holographic seal, or failed barcode scan..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Your Contact (Phone / Email)</label>
              <input
                type="text"
                required
                value={formData.reporterContact}
                onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                placeholder="e.g. inspector@fda.gov or +91 98765 43210"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
              />
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
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Submit Incident Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
