import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, AlertCircle, Scan, Sparkles, Heart } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const ORGAN_PRESETS = [
  { id: 'ORG-KID-8041', label: 'ORG-KID-8041', desc: 'Kidney (Left) - In Transit (Cryo)' },
  { id: 'ORG-HRT-2094', label: 'ORG-HRT-2094', desc: 'Heart (Whole) - Surgical Suite (Urgent 4h)' },
  { id: 'ORG-LVR-5512', label: 'ORG-LVR-5512', desc: 'Liver (Whole) - Allocation Cleared' },
  { id: 'ORG-COR-3390', label: 'ORG-COR-3390', desc: 'Cornea (Pair) - Transplanted (Grafted)' },
  { id: 'ORG-SUSPECT-9999', label: 'ORG-SUSPECT-9999', desc: 'Unregistered / Counterfeit Organ (Test Invariant)' }
];

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'presets'
  const [scanError, setScanError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    if (activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab]);

  const startScanner = async () => {
    try {
      setScanError(null);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.warn("Camera scan init failed:", err);
      setScanError("Optical camera sensor unavailable. Switch to Quick Presets or upload a QR image.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setIsScanning(false);
      }).catch(err => {
        console.warn("Stop scanner error:", err);
      });
    }
  };

  const handleDecoded = (text) => {
    stopScanner();
    let organId = text.trim();
    if (organId.includes('/verify/')) {
      const parts = organId.split('/verify/');
      organId = parts[1].split('?')[0].split('#')[0];
    } else if (organId.startsWith('{')) {
      try {
        const parsed = JSON.parse(organId);
        if (parsed.organId) organId = parsed.organId;
        else if (parsed.batchId) organId = parsed.batchId;
      } catch (e) {}
    }

    onScanSuccess(organId.toUpperCase());
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader-hidden");
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        handleDecoded(decodedText);
      })
      .catch(() => {
        setScanError("No valid QR code barcode detected in image. Please try another or select a preset.");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Modern Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Optical QR & Barcode Scanner</h3>
              <p className="text-xs text-slate-400">Scan Cryo-Shipper Tag or Sim-Test</p>
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

        {/* Tab Header */}
        <div className="bg-slate-100/80 px-5 pt-3 border-b border-slate-200 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'camera'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            Webcam Scanner
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'presets'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            Demo Presets
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 bg-slate-50 space-y-4">
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl flex flex-col items-center justify-center min-h-[220px] border border-slate-800">
                <div id="qr-reader" className="w-full max-w-[280px]" />
                <div id="qr-reader-hidden" style={{ display: 'none' }} />
              </div>

              {scanError && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Upload image button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Load QR Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setActiveTab('presets')}
                  className="px-3 py-2 text-xs text-blue-700 font-semibold hover:underline"
                >
                  Use Demo Presets &gt;&gt;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <div className="text-xs text-slate-600 font-medium mb-1">
                Select an Organ Specimen to Simulate Optical Scan:
              </div>

              <div className="space-y-2">
                {ORGAN_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleDecoded(p.id)}
                    className="w-full text-left p-3 bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs flex items-center justify-between transition-all group"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-blue-700 group-hover:text-blue-800">{p.label}</div>
                      <div className="text-[11px] text-slate-500">{p.desc}</div>
                    </div>
                    <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dialog Action Strip */}
          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>Mode: {activeTab.toUpperCase()}</div>
          <div className="text-emerald-700 font-bold">Scanner Ready</div>
        </div>
      </div>
    </div>
  );
}
