import React, { useState, useEffect } from 'react';
import { X, Printer, Copy, Check, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';

export default function QRCodeModal({ batch, isOpen, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && batch) {
      setLoading(true);
      fetch(`/api/batches/${batch.batchId}/qrcode`)
        .then(res => res.json())
        .then(data => {
          setQrData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("QR Fetch error:", err);
          setLoading(false);
        });
    }
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const verifyUrl = qrData?.verifyUrl || `${window.location.origin}/verify/${batch.batchId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Pharmaceutical QR Label</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Section */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Packaging Box Style Card */}
          <div id="printable-label" className="w-full bg-white text-slate-900 p-5 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            {/* Header branding */}
            <div className="w-full flex items-center justify-between border-b pb-2 mb-3 text-left">
              <div>
                <span className="text-xs font-black tracking-widest text-emerald-700 uppercase">TRUEDOSE CERTIFIED</span>
                <p className="text-[10px] text-slate-500 font-mono">Blockchain Cryptographic Seal</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Medicine Name */}
            <h4 className="text-lg font-black text-slate-900">{batch.medicineName}</h4>
            <p className="text-xs font-semibold text-emerald-700 mb-3">{batch.dosage} • {batch.quantity} units</p>

            {/* QR Code Container */}
            <div className="w-48 h-48 bg-slate-50 p-2 rounded-lg border border-slate-300 flex items-center justify-center mb-3">
              {loading ? (
                <div className="text-xs text-slate-500 animate-pulse">Generating Secure QR...</div>
              ) : qrData?.qrDataUrl ? (
                <img
                  src={qrData.qrDataUrl}
                  alt={`QR for ${batch.batchId}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-slate-400">QR unavailable</div>
              )}
            </div>

            {/* Batch details info box */}
            <div className="w-full grid grid-cols-2 gap-2 text-left text-[11px] bg-slate-100 p-2.5 rounded-lg border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Batch ID</span>
                <span className="font-bold text-slate-800">{batch.batchId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Manufacturer</span>
                <span className="font-bold text-slate-800 truncate block">{batch.manufacturerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Mfg Date</span>
                <span className="font-medium text-slate-700">{new Date(batch.manufacturingDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Exp Date</span>
                <span className="font-bold text-emerald-800">{new Date(batch.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-2 text-[9px] text-slate-500 text-center">
              Scan with any mobile camera to verify genuine batch on blockchain
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Link!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
