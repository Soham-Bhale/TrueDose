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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <QrCode className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Packaging Verification QR Label</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Section */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Packaging Box Style Card */}
          <div id="printable-label" className="w-full bg-white text-slate-900 p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center">
            {/* Header branding */}
            <div className="w-full flex items-center justify-between border-b pb-2 mb-3 text-left">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-teal-800 uppercase">TRUEDOSE AUTHENTICATED</span>
                <p className="text-[10px] text-slate-500 font-mono">Consortium Cryptographic Seal</p>
              </div>
              <div className="w-5 h-5 rounded-md bg-teal-700 flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Medicine Name */}
            <h4 className="text-base font-bold text-slate-900">{batch.medicineName}</h4>
            <p className="text-xs font-medium text-slate-600 mb-3">{batch.dosage} • {batch.quantity?.toLocaleString()} units</p>

            {/* QR Code Container */}
            <div className="w-44 h-44 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-center mb-3">
              {loading ? (
                <div className="text-xs text-slate-400 animate-pulse">Generating Secure QR...</div>
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
            <div className="w-full grid grid-cols-2 gap-2 text-left text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Batch ID</span>
                <span className="font-bold text-slate-900">{batch.batchId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Manufacturer</span>
                <span className="font-bold text-slate-900 truncate block">{batch.manufacturerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Mfg Date</span>
                <span className="text-slate-700">{new Date(batch.manufacturingDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Expiry Date</span>
                <span className="text-slate-700">{new Date(batch.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2">
              Scan packaging QR with camera or TrueDose verifier to inspect blockchain provenance.
            </p>
          </div>

          {/* Copy URL bar */}
          <div className="w-full mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono">
            <span className="text-slate-500 truncate flex-1 text-[11px]">{verifyUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-slate-900 text-slate-400 transition"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-teal-700" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
}
