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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md swing-raised shadow-2xl overflow-hidden flex flex-col">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar">
          <div className="flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5 text-blue-200" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: Specimen Barcode & QR Scanner [AWT]
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

        {/* Tab Header */}
        <div className="bg-[#ECE9D8] px-3 pt-2 border-b border-[#808080] flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1 text-[11px] font-bold border-t-2 border-l-2 border-r-2 ${
              activeTab === 'camera'
                ? 'bg-[#ECE9D8] border-white border-b-transparent translate-y-px'
                : 'bg-[#DCD8C8] border-[#808080] text-[#555555]'
            }`}
          >
            Webcam Scanner
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 text-[11px] font-bold border-t-2 border-l-2 border-r-2 ${
              activeTab === 'presets'
                ? 'bg-[#ECE9D8] border-white border-b-transparent translate-y-px'
                : 'bg-[#DCD8C8] border-[#808080] text-[#555555]'
            }`}
          >
            Demo Presets
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3 bg-[#ECE9D8]">
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="swing-sunken p-2 bg-black flex flex-col items-center justify-center min-h-[220px]">
                <div id="qr-reader" className="w-full max-w-[280px]" />
                <div id="qr-reader-hidden" style={{ display: 'none' }} />
              </div>

              {scanError && (
                <div className="p-2 swing-sunken bg-[#FFFBEB] border border-amber-500 text-amber-950 text-[10px] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Upload image button */}
              <div className="flex items-center justify-between text-[11px]">
                <label className="swing-btn cursor-pointer flex items-center gap-1 text-[11px] py-1 px-2.5">
                  <Upload className="w-3.5 h-3.5 text-[#0A246A]" />
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
                  className="swing-btn text-[11px] py-1 px-2.5 text-[#0A246A]"
                >
                  Use Demo Presets &gt;&gt;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#333333] font-bold mb-1">
                Select an Organ Specimen to Simulate Optical Scan:
              </div>

              <div className="space-y-1.5">
                {ORGAN_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleDecoded(p.id)}
                    className="w-full text-left swing-btn p-2 flex items-center justify-between hover:bg-[#FFFFF0]"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-[#0A246A]">{p.label}</div>
                      <div className="text-[10px] text-[#555555]">{p.desc}</div>
                    </div>
                    <span className="text-[10px] text-blue-900 font-bold bg-[#E2DFD2] px-1.5 py-0.5 border border-[#808080]">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dialog Action Strip */}
          <div className="mt-3 pt-2 border-t border-[#808080] flex justify-end">
            <button
              onClick={onClose}
              className="swing-btn text-xs py-1 px-3"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: Scanner</div>
          <div className="swing-status-pane">Mode: {activeTab.toUpperCase()}</div>
          <div className="swing-status-pane flex-1 text-right">Status: Ready</div>
        </div>
      </div>
    </div>
  );
}
