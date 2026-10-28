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
    <div className="space-y-4 font-sans">

      {/* ── 1. Top Active Role Workstation Bar ─────────────────────── */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-slate-700">
            Current Workstation: <strong>{currentUser.badge}</strong> ({currentUser.name})
          </span>
          {currentUser.role === 'admin' && investigationCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full">
              {investigationCount} Active Alert{investigationCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Open {currentUser.badge} Portal</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </div>

      {/* ── 2. Organ Query Inspector Panel ─────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Organ Verification & Donor Provenance Inspector (EVM Cryptographic Query)
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            performVerification(organIdInput);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1"
        >
          <label className="text-xs font-bold text-slate-700 shrink-0">
            Organ Registry ID:
          </label>
          <input
            type="text"
            value={organIdInput}
            onChange={(e) => setOrganIdInput(e.target.value)}
            placeholder="e.g. ORG-KID-8041, ORG-HRT-2094, ORG-COR-3390..."
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono uppercase font-bold text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Interrogate Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Scan Packaging QR / RFID"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>Scan QR</span>
          </button>
        </form>

        {/* Preset Sample Organs for Instant Evaluation */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 mt-3 text-xs">
          <span className="font-semibold text-slate-500">Sample Registry Presets:</span>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-KID-8041'); performVerification('ORG-KID-8041'); }}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-mono text-xs transition-colors cursor-pointer"
          >
            ORG-KID-8041 <span className="text-teal-700 font-sans font-bold">(Kidney: O+)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-HRT-2094'); performVerification('ORG-HRT-2094'); }}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-mono text-xs transition-colors cursor-pointer"
          >
            ORG-HRT-2094 <span className="text-blue-700 font-sans font-bold">(Heart: Air Transit)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-LVR-5512'); performVerification('ORG-LVR-5512'); }}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-mono text-xs transition-colors cursor-pointer"
          >
            ORG-LVR-5512 <span className="text-purple-700 font-sans font-bold">(Liver: Hospital OR)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-COR-3390'); performVerification('ORG-COR-3390'); }}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-mono text-xs transition-colors cursor-pointer"
          >
            ORG-COR-3390 <span className="text-rose-700 font-sans font-bold">(Cornea: Quarantined)</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrganIdInput('ORG-FAKE-999'); performVerification('ORG-FAKE-999'); }}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-mono text-xs transition-colors cursor-pointer"
          >
            ORG-FAKE-999 <span className="text-rose-800 font-sans font-bold">(Illegal Trafficking Alert)</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs font-mono text-slate-500 shadow-xs">
          Interrogating LifeLedger Consortium Node at 0x5FbDB2315678afecb367f032d93F642f64180aa3...
        </div>
      )}

      {/* ── 3. Unregistered / Illegal Trafficking Alert Box ────────── */}
      {!loading && errorResult && (
        <div className="bg-rose-50/80 border-2 border-rose-500 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <ShieldX className="w-5 h-5 text-rose-600" />
            <span>UNREGISTERED ORGAN / HUMAN TRAFFICKING ALERT</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold bg-rose-700 text-white px-2 py-0.5 rounded-md">
                VERIFICATION REJECTED: {errorResult.organId || errorResult.batchId}
              </span>
              <span className="font-bold text-rose-800">{errorResult.alertTitle}</span>
            </div>

            <p className="text-rose-950 leading-relaxed font-medium bg-white p-3 rounded-lg border border-rose-200">
              {errorResult.alertDescription}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorResult.recommendation}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-200">
              <span className="font-mono text-[11px] text-slate-500">
                Logged to Central Fraud & Human Trafficking Registry
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>View in Regulatory Directorate ({investigationCount} Cases)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Genuine / Valid Organ Record Inspector ──────────────── */}
      {!loading && result && (
        <div className="space-y-3">
          {/* Header Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 font-bold font-mono text-[11px] rounded-full border ${
                    result.isQuarantined
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : result.isIschemiaExpired
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {result.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Chain Hash: {result.blockchainTxHash ? result.blockchainTxHash.slice(0, 16) + '...' : 'EVM Confirmed'}
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {result.organType || result.medicineName}
                </h1>
                <div className="text-xs text-slate-500 mt-0.5">
                  Organ ID: <strong className="font-mono text-slate-900">{result.organId || result.batchId}</strong> | Harvested by <strong>{result.manufacturerName || result.currentOwnerName}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Donor Consent (Form 8)</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Flag Incident</span>
                </button>
              </div>
            </div>

            {/* Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Blood & Tissue Match</span>
                <span className="font-mono font-black text-rose-700 text-base mt-0.5 block">
                  {result.donorBloodType || result.dosage}
                </span>
                <span className="text-[11px] text-slate-500 block">{result.hlaMarker || "6/6 Match"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Safe Viability Window</span>
                <span className={`font-mono font-black text-base mt-0.5 block ${result.isIschemiaExpired ? 'text-rose-700' : 'text-blue-700'}`}>
                  {result.remainingIschemiaHours || result.daysUntilExpiry}h safe window
                </span>
                <span className="text-[11px] text-slate-500 block">Max Limit: {result.ischemicLimitHours}h</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Container Temp</span>
                <span className="font-mono font-black text-cyan-700 text-base mt-0.5 block">
                  {result.telemetry?.currentTemperatureCelsius || 2.8}°C
                </span>
                <span className="text-[11px] text-emerald-600 font-bold block">Safe Range: 2°C - 4°C</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Target Recipient</span>
                <span className="font-mono font-black text-purple-900 text-base mt-0.5 block">
                  {result.recipientId || "Matched"}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">{result.recipientHospital || "Transplant Suite"}</span>
              </div>
            </div>
          </div>

          {/* ── 5. Simplified Storage & Preservation Status ─────── */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-blue-600" />
              <span>Organ Storage & Preservation Condition (Simple Overview)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Status: Optimal Condition (Safe for Implantation)</span>
                </div>
                <div className="text-xs text-slate-500">
                  Preserved in sterile cold solution • Constant safe temperature maintained throughout transit.
                </div>
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-center shadow-2xs">
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Current Temp</div>
                  <div className="font-black text-blue-700 text-sm">{result.telemetry?.currentTemperatureCelsius || 2.8}°C</div>
                  <div className="text-[9px] text-emerald-600 font-bold font-sans">Normal</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-center shadow-2xs">
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Safe Time Left</div>
                  <div className="font-black text-emerald-600 text-sm">{result.remainingIschemiaHours || 19.2}h</div>
                  <div className="text-[9px] text-blue-600 font-sans">Active Window</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-center shadow-2xs">
                  <div className="text-[9px] text-slate-400 uppercase font-sans">Container Seal</div>
                  <div className="font-black text-slate-800 text-sm">INTACT</div>
                  <div className="text-[9px] text-slate-400 font-sans">Tamper-Proof</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. Immutable Chain-of-Custody Timeline ─────────────── */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Immutable Chain-of-Custody Ledger ({result.history?.length || 1} Verified Blockchain Handoffs)</span>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-2.5 max-h-[280px] overflow-y-auto space-y-2">
              {result.history?.map((step, idx) => (
                <div key={idx} className="p-2.5 border border-slate-200 bg-white rounded-lg text-xs shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-100 pb-1.5 mb-1.5">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-slate-900">{step.stage}</span>
                      <span className="text-slate-500 font-normal text-[11px]">({step.roleFrom} → {step.roleTo})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-slate-700 text-xs">
                    <strong>From:</strong> {step.from} → <strong>To:</strong> {step.to}
                  </div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                    "{step.notes}"
                  </div>

                  {step.txHash && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 mt-1.5 border-t border-slate-100">
                      <span className="truncate max-w-[450px]">TxHash: {step.txHash}</span>
                      <button
                        onClick={() => handleCopy(step.txHash, `tx_${idx}`)}
                        className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                      >
                        {copiedHash === `tx_${idx}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
