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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Register Medicine Batch on Blockchain</h3>
              <p className="text-xs text-slate-400">Genesis record minted by authorized manufacturer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Autofill:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadPreset('paracetamol')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 font-medium transition"
            >
              Paracetamol 500mg
            </button>
            <button
              type="button"
              onClick={() => loadPreset('amoxicillin')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 font-medium transition"
            >
              Amoxicillin 250mg
            </button>
            <button
              type="button"
              onClick={() => loadPreset('insulin')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg border border-slate-700 font-medium transition"
            >
              Insulin 100IU
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Batch ID <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value.toUpperCase() })}
                placeholder="e.g. PCM001"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Batch Quantity (Units) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Medicine Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                placeholder="e.g. Paracetamol"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dosage & Form <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 500 mg Tablets"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Manufacturing Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.manufacturingDate}
                onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expiry Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quality Assurance & Certificate Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
                  <span>Minting on Blockchain...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Commit Batch to Blockchain</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
