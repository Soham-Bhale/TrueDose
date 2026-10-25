import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Camera, ShieldCheck, AlertTriangle, CheckCircle2,
  Clock, MapPin, ExternalLink, Copy, Check, ChevronRight,
  Pill, AlertOctagon, Award, Thermometer, ShieldAlert,
  FileCheck, Hash, Info, ArrowRight, ShieldX, HeartHandshake,
  Heart, Activity, Building2, Truck, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import QRScannerModal from '../components/QRScannerModal';
import CertificateModal from '../components/CertificateModal';
import ReportModal from '../components/ReportModal';

export default function VerifyPage({ initialBatchId, onNavigateToAdmin }) {
  const { currentUser, switchRole, investigationCount } = useAuth();
  const [organIdInput, setOrganIdInput] = useState(initialBatchId || 'ORG-KID-8041');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const performVerification = useCallback(async (idToVerify) => {
    const id = (idToVerify || organIdInput || '').trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setResult(null);
    setErrorResult(null);

    try {
      const res = await fetch(`/api/verify/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorResult(data);
      } else {
        setResult(data);
        if (data.status === 'GENUINE_AUTHENTIC') {
          try {
            confetti({
              particleCount: 35,
              spread: 50,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // non-fatal if canvas-confetti fails
          }
        }
      }
      setLoading(false);
    } catch (err) {
      setErrorResult({
        exists: false,
        organId: id,
        batchId: id,
        alertTitle: "Consortium Query Exception",
        alertDescription: "Unable to query blockchain verification node on port 5000.",
        recommendation: "Ensure LifeLedger API server is running on http://localhost:5000."
      });
      setLoading(false);
    }
  }, [organIdInput]);

  useEffect(() => {
    if (initialBatchId) {
      setOrganIdInput(initialBatchId);
      performVerification(initialBatchId);
    } else {
      performVerification('ORG-KID-8041');
    }
  }, [initialBatchId, performVerification]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(key);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="p-3 max-w-[1200px] mx-auto space-y-3 font-sans">

      {/* ── 1. Top Active Role Workstation Bar ─────────────────────── */}
      <div className="swing-raised p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-600 rounded-full border border-black animate-pulse"></span>
          <span className="text-[11px] text-gray-800">
            Current Workstation Role: <strong>{currentUser.badge}</strong> ({currentUser.name})
          </span>
          {currentUser.role === 'admin' && investigationCount > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white font-bold text-[10px]">
              {investigationCount} Active Trafficking Alert{investigationCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
          className="swing-btn swing-btn-primary text-[10px] py-0.5 px-2 self-end sm:self-auto"
        >
          <span>Open {currentUser.badge} Portal</span>
          <ArrowRight className="w-3 h-3 text-[#0A246A]" />
        </button>
      </div>

      {/* ── 2. Organ Query Inspector Panel ─────────────────────────── */}
      <fieldset className="swing-etched bg-[#ECE9D8] p-3">
        <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8]">
          Organ Verification & Donor Provenance Inspector (EVM Cryptographic Query)
        </legend>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            performVerification(organIdInput);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1"
        >
          <label className="text-[11px] font-bold text-gray-700 shrink-0">
            Organ Registry ID:
          </label>
          <input
            type="text"
            value={organIdInput}
            onChange={(e) => setOrganIdInput(e.target.value)}
            placeholder="e.g. ORG-KID-8041, ORG-HRT-2094, ORG-COR-3390..."
            className="swing-input flex-1 font-mono uppercase font-bold text-[12px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="swing-btn swing-btn-primary py-1.5 px-3"
          >
            <Search className="w-3.5 h-3.5 text-[#0A246A]" />
            <span>Interrogate Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="swing-btn py-1.5 px-2.5"
            title="Scan Packaging QR / RFID"
          >
            <Camera className="w-3.5 h-3.5 text-gray-700" />
            <span>Scan QR / RFID</span>
          </button>
        </form>

        {/* Preset Sample Organs for Instant Evaluation */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D4D0C8] mt-2 text-[10px]">
          <span className="font-bold text-gray-600">Sample Registry Presets:</span>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-KID-8041'); performVerification('ORG-KID-8041'); }}
            className="swing-btn text-[10px] py-0.5 px-1.5 font-mono"
          >
            ORG-KID-8041 <span className="text-teal-700 font-sans font-bold">(Kidney: O+)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-HRT-2094'); performVerification('ORG-HRT-2094'); }}
            className="swing-btn text-[10px] py-0.5 px-1.5 font-mono"
          >
            ORG-HRT-2094 <span className="text-blue-700 font-sans font-bold">(Heart: Air Transit)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-LVR-5512'); performVerification('ORG-LVR-5512'); }}
            className="swing-btn text-[10px] py-0.5 px-1.5 font-mono"
          >
            ORG-LVR-5512 <span className="text-purple-700 font-sans font-bold">(Liver: Hospital OR)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-COR-3390'); performVerification('ORG-COR-3390'); }}
            className="swing-btn swing-btn-danger text-[10px] py-0.5 px-1.5 font-mono"
          >
            ORG-COR-3390 <span className="text-red-700 font-sans font-bold">(Cornea: Quarantined)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-FAKE-999'); performVerification('ORG-FAKE-999'); }}
            className="swing-btn swing-btn-danger text-[10px] py-0.5 px-1.5 font-mono"
          >
            ORG-FAKE-999 <span className="text-red-800 font-sans font-bold">(Illegal Trafficking Alert)</span>
          </button>
        </div>
      </fieldset>

      {/* Loading */}
      {loading && (
        <div className="swing-sunken p-6 text-center text-[11px] font-mono text-gray-600">
          Interrogating LifeLedger Consortium Node at 0x5FbDB2315678afecb367f032d93F642f64180aa3...
        </div>
      )}

      {/* ── 3. Unregistered / Illegal Trafficking Alert Box ────────── */}
      {!loading && errorResult && (
        <fieldset className="swing-etched bg-[#FFF0F0] border-2 border-red-600 p-3">
          <legend className="px-1.5 font-bold text-[11px] text-red-900 bg-[#FFF0F0] flex items-center gap-1">
            <ShieldX className="w-4 h-4 text-red-700" />
            <span>UNREGISTERED ORGAN / TRAFFICKING ALERT</span>
          </legend>

          <div className="space-y-2 pt-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold bg-red-800 text-white px-2 py-0.5">
                VERIFICATION REJECTED: {errorResult.organId || errorResult.batchId}
              </span>
              <span className="font-bold text-red-800">{errorResult.alertTitle}</span>
            </div>

            <p className="text-red-900 leading-relaxed font-medium bg-white p-2 border border-red-300">
              {errorResult.alertDescription}
            </p>

            <div className="bg-[#FFF8E8] border border-amber-300 p-2 text-amber-900 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorResult.recommendation}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-red-200">
              <span className="font-mono text-[10px] text-gray-600">
                Logged to Central Fraud & Human Trafficking Registry
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="swing-btn swing-btn-danger text-[11px]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report Trafficking Violation to NOTTO</span>
                </button>
                {investigationCount > 0 && (
                  <button
                    onClick={() => {
                      switchRole('admin');
                      if (onNavigateToAdmin) onNavigateToAdmin();
                    }}
                    className="swing-btn swing-btn-primary text-[11px]"
                  >
                    <span>View in Regulatory Directorate ({investigationCount} Cases)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {/* ── 4. Genuine / Valid Organ Record Inspector ──────────────── */}
      {!loading && result && (
        <div className="space-y-2.5">
          {/* Header Card */}
          <div className="swing-raised p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#808080] pb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 font-bold font-mono text-[10px] border ${
                    result.isQuarantined
                      ? 'bg-red-200 text-red-900 border-red-400'
                      : result.isIschemiaExpired
                      ? 'bg-amber-200 text-amber-900 border-amber-400'
                      : 'bg-green-200 text-green-900 border-green-400'
                  }`}>
                    {result.status}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Chain Hash: {result.blockchainTxHash ? result.blockchainTxHash.slice(0, 16) + '...' : 'EVM Confirmed'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-[#0A246A] tracking-tight">
                  {result.organType || result.medicineName}
                </h1>
                <div className="text-[11px] text-gray-700 mt-0.5">
                  Organ ID: <strong className="font-mono text-black">{result.organId || result.batchId}</strong> | Harvested by <strong>{result.manufacturerName || result.currentOwnerName}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="swing-btn swing-btn-primary"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Donor Consent (Form 8)</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="swing-btn swing-btn-danger"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                  <span>Flag Incident</span>
                </button>
              </div>
            </div>

            {/* Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
              <div className="swing-panel-sunken p-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Donor Blood & HLA</span>
                <span className="font-mono font-bold text-red-700 text-sm">
                  {result.donorBloodType || result.dosage}
                </span>
                <span className="text-[10px] text-gray-600 block">{result.hlaMarker || "6/6 Match"}</span>
              </div>
              <div className="swing-panel-sunken p-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Cold Ischemia Clock</span>
                <span className={`font-mono font-bold text-sm ${result.isIschemiaExpired ? 'text-red-700' : 'text-blue-800'}`}>
                  {result.remainingIschemiaHours || result.daysUntilExpiry}h safe window
                </span>
                <span className="text-[10px] text-gray-600 block">Limit: {result.ischemicLimitHours}h safe</span>
              </div>
              <div className="swing-panel-sunken p-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Cryo-Reefer Temp</span>
                <span className="font-mono font-bold text-cyan-800 text-sm">
                  {result.telemetry?.currentTemperatureCelsius || 2.8}°C
                </span>
                <span className="text-[10px] text-green-700 font-bold block">Preserved: 2°C - 4°C</span>
              </div>
              <div className="swing-panel-sunken p-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Target Recipient</span>
                <span className="font-mono font-bold text-purple-900 text-sm">
                  {result.recipientId || "Matched"}
                </span>
                <span className="text-[10px] text-gray-600 truncate block">{result.recipientHospital || "Transplant Suite"}</span>
              </div>
            </div>
          </div>

          {/* ── 5. Cold-Chain IoT Cryo-Preservation Telemetry ─────── */}
          <fieldset className="swing-etched bg-[#ECE9D8] p-2.5">
            <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8] flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-blue-700" />
              <span>Real-Time Hypothermic Cryo-Preservation IoT Telemetry</span>
            </legend>

            <div className="p-2 bg-white border border-[#808080] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
              <div className="space-y-0.5">
                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-green-600" />
                  <span>Preservation Protocol: {result.preservationProtocol || "Custodiol HTK Hypothermic Perfusion"}</span>
                </div>
                <div className="text-[10px] text-gray-500">
                  Continuous Perfusion Flow: 45 mL/min | Sensor Node ID: {result.telemetry?.sensorNodeId || "IOT-CRYO-8041"}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <div className="swing-panel-sunken px-2 py-1 text-center">
                  <div className="text-[9px] text-gray-500">Probe Temp</div>
                  <div className="font-bold text-blue-800 text-[12px]">{result.telemetry?.currentTemperatureCelsius || 2.8}°C</div>
                </div>
                <div className="swing-panel-sunken px-2 py-1 text-center">
                  <div className="text-[9px] text-gray-500">Safe Range</div>
                  <div className="font-bold text-green-700 text-[12px]">2.0°C - 4.0°C</div>
                </div>
                <div className="swing-panel-sunken px-2 py-1 text-center">
                  <div className="text-[9px] text-gray-500">Seal Integrity</div>
                  <div className="font-bold text-[#0A246A] text-[12px]">UNBROKEN</div>
                </div>
              </div>
            </div>
          </fieldset>

          {/* ── 6. Immutable Chain-of-Custody Timeline ─────────────── */}
          <fieldset className="swing-etched bg-[#ECE9D8] p-2.5">
            <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-700" />
              <span>Immutable Chain-of-Custody Ledger ({result.history?.length || 1} Verified Blockchain Handoffs)</span>
            </legend>

            <div className="swing-sunken p-2 bg-white max-h-[260px] overflow-y-auto space-y-2">
              {result.history?.map((step, idx) => (
                <div key={idx} className="p-2 border border-[#D4D0C8] bg-[#FAF8F5] text-[11px]">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#E0DFD8] pb-1 mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-4 h-4 rounded-full bg-[#0A246A] text-white text-[9px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-[#0A246A]">{step.stage}</span>
                      <span className="text-gray-500 text-[10px]">({step.roleFrom} → {step.roleTo})</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-gray-700 text-[11px]">
                    <strong>From:</strong> {step.from} → <strong>To:</strong> {step.to}
                  </div>
                  <div className="text-[10px] text-gray-500 italic mt-0.5">
                    "{step.notes}"
                  </div>

                  {step.txHash && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 mt-1 border-t border-[#EAE8E0]">
                      <span className="truncate max-w-[450px]">TxHash: {step.txHash}</span>
                      <button
                        onClick={() => handleCopy(step.txHash, `tx_${idx}`)}
                        className="swing-btn text-[9px] py-0 px-1"
                      >
                        {copiedHash === `tx_${idx}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Modals */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedId) => {
          setOrganIdInput(scannedId);
          performVerification(scannedId);
        }}
      />

      <CertificateModal
        batch={result}
        cert={result?.donorConsentCertificate || result?.qualityCertificate}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

      <ReportModal
        batchId={errorResult ? errorResult.organId : result?.organId}
        medicineName={errorResult ? "Suspected Organ Transit Incident" : result?.organType}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onNavigateToAdmin={onNavigateToAdmin}
      />
    </div>
  );
}
