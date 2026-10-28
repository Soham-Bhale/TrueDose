import React, { useState, useEffect } from 'react';
import { X, Printer, Copy, Check, QrCode } from 'lucide-react';

export default function QRCodeModal({ batch, isOpen, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const organId = batch ? (batch.organId || batch.batchId) : '';

  useEffect(() => {
    if (isOpen && organId) {
      setLoading(true);
      fetch(`/api/organs/${organId}/qrcode`)
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
  }, [isOpen, organId]);

  if (!isOpen || !batch) return null;

  const organType = batch.organType || batch.medicineName || 'Organ';
  const bloodType = batch.donorBloodType || 'O+';
  const hlaMarker = batch.hlaMarker || '6/6 Match';
  const recipient = batch.recipientId || 'RCP-7704';
  const hospital = batch.recipientHospital || 'Apollo Surgical Center';
  const verifyUrl = qrData?.verifyUrl || `${window.location.origin}/verify/${organId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Modern Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Specimen RFID/QR Manifest</h3>
              <p className="text-xs text-slate-400">Chain-of-Custody Verification Barcode</p>
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

        {/* Printable Cryo-Shipper Manifest Tag */}
        <div className="p-5 bg-slate-50 overflow-y-auto max-h-[80vh]">
          <div
            id="printable-label"
            className="bg-white border-2 border-slate-900 p-4 rounded-xl text-slate-900 font-sans shadow-md"
          >
            {/* Tag Header */}
            <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase text-red-600">
                  CRITICAL HUMAN ORGAN SPECIMEN
                </div>
                <div className="text-sm font-black tracking-tight font-mono text-slate-950">
                  {organId}
                </div>
                <div className="text-[10px] text-slate-500">
                  LifeLedger National Allocation Tag
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  {bloodType}
                </span>
                <div className="text-[9px] text-slate-500 mt-0.5 font-bold">
                  PRIORITY 1A
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-lg border border-slate-200 mb-3">
              {loading ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-500">
                  Rendering Cryptographic QR...
                </div>
              ) : qrData?.qrDataUrl ? (
                <img
                  src={qrData.qrDataUrl}
                  alt={`Specimen QR for ${organId}`}
                  className="w-44 h-44 rounded border border-slate-300 shadow-2xs"
                />
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-red-600 font-mono">
                  QR Render Failed
                </div>
              )}
              <div className="text-[10px] text-slate-500 mt-1 font-mono text-center">
                Scan via any smartphone to verify cryptographic custody
              </div>
            </div>

            {/* Specimen Key-Value Manifest */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">SPECIMEN:</span>
                <span className="font-bold text-slate-900">{organType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HISTOCOMPATIBILITY:</span>
                <span className="font-bold text-slate-900">{hlaMarker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ISCHEMIA LIMIT:</span>
                <span className="font-bold text-red-600">{batch.ischemicLimitHours || 24} Hours Maximum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TARGET RECIPIENT:</span>
                <span className="font-bold text-slate-900">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SURGICAL CENTER:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{hospital}</span>
              </div>
            </div>

            {/* Barcode representation line */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-center">
              <div className="text-[9px] font-mono tracking-widest text-slate-500">
                *LL-{organId.replace(/[^A-Z0-9]/g, '')}-CHAIN*
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Protected under National Organ Transplantation Act (NOTA) & EVM PoA Consortium
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 flex items-center justify-between gap-2.5">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'URL Copied!' : 'Copy Verify URL'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Carrier Tag</span>
            </button>
          </div>
        </div>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="font-bold text-slate-700">{organId}</span>
          <span className="text-emerald-700 font-semibold">EVM Verified Manifest</span>
        </div>
      </div>
    </div>
  );
}
