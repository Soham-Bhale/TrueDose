import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, AlertCircle, Scan, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

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
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        (errorMessage) => {
          // Frame by frame scan errors are normal, do not spam state
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn("Camera scan init failed:", err);
      setScanError("Camera access unavailable or permission denied. You can select a test batch below or upload a QR image.");
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
    // Check if URL or JSON or raw batchId
    let batchId = text.trim();
    if (batchId.includes('/verify/')) {
      const parts = batchId.split('/verify/');
      batchId = parts[1].split('?')[0].split('#')[0];
    } else if (batchId.startsWith('{')) {
      try {
        const parsed = JSON.parse(batchId);
        if (parsed.batchId) batchId = parsed.batchId;
      } catch (e) {}
    }

    onScanSuccess(batchId.toUpperCase());
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
      .catch(err => {
        setScanError("No valid QR code found in uploaded image. Please try another image or use quick presets.");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Scan Medicine QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'camera'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📹 Live Camera
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ One-Click Demo Batches
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              {/* QR Reader Viewport */}
              <div className="relative w-64 h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center shadow-inner">
                <div id="qr-reader" className="w-full h-full"></div>
                {/* Laser scan animation overlay */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce pointer-events-none"></div>
              </div>
              <div id="qr-reader-hidden" className="hidden"></div>

              {scanError && (
                <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Upload image alternative */}
              <div className="mt-5 w-full flex items-center justify-center">
                <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Upload QR Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Instantly simulate scanning a physical packaging QR code for testing:
              </p>

              <button
                onClick={() => handleDecoded('PCM001')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono">PCM001</span>
                    <span>Paracetamol 500mg (ABC Pharma)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Manufactured 01/09/2026 • Status: Genuine Authentic</span>
                </div>
                <Scan className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>

              <button
                onClick={() => handleDecoded('AMX404')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-500/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-mono">AMX404</span>
                    <span>Azithromycin 500mg</span>
                  </div>
                  <span className="text-[11px] text-slate-400">In Transit • Current: Metro Wholesalers</span>
                </div>
                <Scan className="w-4 h-4 text-blue-400 shrink-0" />
              </button>

              <button
                onClick={() => handleDecoded('EXP902')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-mono">EXP902</span>
                    <span>Amoxicillin 250mg (Expired)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Expired 2025 • Status: Auto-Expired Safety Flag</span>
                </div>
                <Scan className="w-4 h-4 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => handleDecoded('FAKE999')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-mono">FAKE999</span>
                    <span>Counterfeit / Fake Batch Label</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Not in blockchain • Status: Counterfeit Warning</span>
                </div>
                <Scan className="w-4 h-4 text-red-400 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
