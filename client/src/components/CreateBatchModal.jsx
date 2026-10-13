import React, { useState } from 'react';
import { X, Plus, Sparkles, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreateBatchModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    batchId: 'PCM002',
    medicineName: 'Paracetamol',
    dosage: '500 mg',
    quantity: '5000',
    manufacturingDate: '2026-09-01',
    expiryDate: '2028-08-31',
    notes: 'Formulated in compliance with WHO GMP guidelines. Tamper-evident holographic seal #IND-901 applied.'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const loadPreset = (type) => {
    if (type === 'paracetamol') {
      setFormData({
        batchId: 'PCM' + Math.floor(100 + Math.random() * 900),
        medicineName: 'Paracetamol',
        dosage: '500 mg',
        quantity: '5000',
        manufacturingDate: '2026-09-01',
        expiryDate: '2028-08-31',
        notes: 'Formulated in compliance with WHO GMP guidelines. Tamper-evident holographic seal applied.'
      });
    } else if (type === 'amoxicillin') {
      setFormData({
        batchId: 'AMX' + Math.floor(100 + Math.random() * 900),
        medicineName: 'Amoxicillin Trihydrate',
        dosage: '250 mg',
        quantity: '2500',
        manufacturingDate: '2026-09-10',
        expiryDate: '2028-09-10',
        notes: 'Broad-spectrum antibiotic. Humidity-controlled packaging.'
      });
    } else if (type === 'insulin') {
      setFormData({
        batchId: 'INS' + Math.floor(100 + Math.random() * 900),
        medicineName: 'Human Regular Insulin',
        dosage: '100 IU/mL',
        quantity: '1000',
        manufacturingDate: '2026-09-15',
        expiryDate: '2028-03-15',
        notes: 'Cold chain strictly required (2°C - 8°C). Cryo-vial verification passed.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentUser.role
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create batch');
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
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Register Medicine Batch on Blockchain</h3>
              <p className="text-xs text-slate-500">Genesis record minted by authorized manufacturer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="px-6 pt-4 pb-1 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Formulation Presets:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadPreset('paracetamol')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium transition shadow-2xs"
            >
              Paracetamol 500mg
            </button>
            <button
              type="button"
              onClick={() => loadPreset('amoxicillin')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium transition shadow-2xs"
            >
              Amoxicillin 250mg
            </button>
            <button
              type="button"
              onClick={() => loadPreset('insulin')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium transition shadow-2xs"
            >
              Insulin (Cold Chain)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Batch ID / Lot Number</label>
              <input
                type="text"
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value.toUpperCase() })}
                placeholder="e.g. PCM002"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Production Volume (Units)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Medicine Name</label>
              <input
                type="text"
                required
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                placeholder="e.g. Paracetamol"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Strength / Dosage</label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 500 mg"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Manufacturing Date</label>
              <input
                type="date"
                required
                value={formData.manufacturingDate}
                onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Expiry Date</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">Quality Assurance & Release Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Upon submission, an EVM transaction will execute <code className="font-mono text-teal-800">createBatch()</code>, issuing a cryptographic genesis event and attaching an immutable CoA hash.
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
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Minting on Blockchain...' : 'Commit Batch to Blockchain'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
