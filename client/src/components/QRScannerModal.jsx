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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">Scan Medicine QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'camera'
                ? 'border-teal-700 text-teal-900 font-semibold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 font-medium border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-teal-700 text-teal-900 font-semibold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sample Test Batches
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              {/* QR Reader Viewport */}
              <div className="relative w-64 h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center shadow-inner">
                <div id="qr-reader" className="w-full h-full"></div>
              </div>
              <div id="qr-reader-hidden" className="hidden"></div>

              {scanError && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Upload image alternative */}
              <div className="mt-5 w-full flex items-center justify-center">
                <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2 transition shadow-2xs">
                  <Upload className="w-4 h-4 text-teal-700" />
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
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500">
                Simulate scanning a physical packaging QR code with pre-configured lots:
              </p>

              <button
                onClick={() => handleDecoded('PCM001')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-mono">PCM001</span>
                    <span>Paracetamol 500mg</span>
                  </div>
                  <span className="text-[11px] text-slate-500">ABC Pharma • Genuine Authentic</span>
                </div>
                <Scan className="w-4 h-4 text-teal-700 shrink-0" />
              </button>

              <button
                onClick={() => handleDecoded('AMX404')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono">AMX404</span>
                    <span>Amoxicillin 250mg</span>
                  </div>
                  <span className="text-[11px] text-slate-500">In Reefer Transit • IoT Monitored</span>
                </div>
                <Scan className="w-4 h-4 text-blue-600 shrink-0" />
              </button>

              <button
                onClick={() => handleDecoded('EXP902')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-mono">EXP902</span>
                    <span>Expired Antibiotic Lot</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Expired Past Date • Safety Flag</span>
                </div>
                <Scan className="w-4 h-4 text-amber-600 shrink-0" />
              </button>

              <button
                onClick={() => handleDecoded('FAKE999')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-mono">FAKE999</span>
                    <span>Suspected Counterfeit Batch</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Unregistered on Blockchain • Flagged Alert</span>
                </div>
                <Scan className="w-4 h-4 text-rose-600 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
