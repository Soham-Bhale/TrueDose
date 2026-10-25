import React, { useState, useEffect } from 'react';
import { X, Printer, Copy, Check, ExternalLink, QrCode, ShieldCheck, Heart, Thermometer, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md swing-raised shadow-2xl overflow-hidden flex flex-col">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar">
          <div className="flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-yellow-200" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: Specimen RFID/QR Manifest [LifeLedger v2.0]
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

        {/* Printable Cryo-Shipper Manifest Tag */}
        <div className="p-4 bg-[#ECE9D8] overflow-y-auto max-h-[80vh]">
          <div
            id="printable-label"
            className="bg-white border-2 border-black p-4 text-black font-sans shadow-sm"
          >
            {/* Tag Header */}
            <div className="border-b-2 border-black pb-2 mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase text-red-700">
                  CRITICAL HUMAN ORGAN SPECIMEN
                </div>
                <div className="text-sm font-black tracking-tight font-mono">
                  {organId}
                </div>
                <div className="text-[9px] text-[#555555]">
                  LifeLedger National Allocation Tag
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                  {bloodType}
                </span>
                <div className="text-[9px] text-[#555555] mt-0.5 font-bold">
                  PRIORITY 1A
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center py-2 bg-[#FAFAFA] border border-[#CCCCCC] mb-3">
              {loading ? (
                <div className="h-44 flex items-center justify-center text-xs text-[#555555]">
                  Rendering Cryptographic QR...
                </div>
              ) : qrData?.qrDataUrl ? (
                <img
                  src={qrData.qrDataUrl}
                  alt={`Specimen QR for ${organId}`}
                  className="w-44 h-44 border border-black shadow-2xs"
                />
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-red-600 font-mono">
                  QR Render Failed
                </div>
              )}
              <div className="text-[9px] text-[#555555] mt-1 font-mono text-center">
                Scan via any smartphone or handheld terminal to verify proof-of-custody
              </div>
            </div>

            {/* Specimen Key-Value Manifest */}
            <div className="space-y-1 text-[10px] border-t border-black pt-2 font-mono">
              <div className="flex justify-between">
                <span className="text-[#555555]">SPECIMEN:</span>
                <span className="font-bold">{organType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">HISTOCOMPATIBILITY:</span>
                <span className="font-bold">{hlaMarker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">ISCHEMIA WINDOW:</span>
                <span className="font-bold text-red-700">{batch.ischemicLimitHours || 24} Hours Maximum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">TARGET RECIPIENT:</span>
                <span className="font-bold">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">SURGICAL CENTER:</span>
                <span className="font-bold truncate max-w-[180px]">{hospital}</span>
              </div>
            </div>

            {/* Barcode representation line */}
            <div className="mt-3 pt-2 border-t border-dashed border-[#888888] text-center">
              <div className="text-[8px] font-mono tracking-widest text-[#666666]">
                *LL-{organId.replace(/[^A-Z0-9]/g, '')}-CHAIN*
              </div>
              <div className="text-[8px] text-[#888888]">
                Protected under National Organ Transplantation Act (NOTA) & EVM PoA Consortium
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={handleCopy}
              className="swing-btn text-[11px] py-1 px-2.5 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5 text-[#555555]" />}
              <span>{copied ? 'URL Copied!' : 'Copy Verify URL'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="swing-btn swing-btn-primary text-[11px] py-1 px-3 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5 text-[#0A246A]" />
              <span>Print Carrier Tag</span>
            </button>
          </div>
        </div>

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: QRCodeModal</div>
          <div className="swing-status-pane font-mono">{organId}</div>
          <div className="swing-status-pane flex-1 text-right">EVM Verified: OK</div>
        </div>
      </div>
    </div>
  );
}
