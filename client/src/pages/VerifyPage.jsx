import React, { useState, useEffect } from 'react';
import {
  Search, Camera, ShieldCheck, AlertTriangle, XCircle, CheckCircle2,
  Clock, MapPin, Building2, ExternalLink, Copy, Check, Sparkles, ChevronRight,
  Pill, AlertOctagon, HelpCircle, FileCheck, Award, Thermometer, ShieldAlert,
  Hash
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRScannerModal from '../components/QRScannerModal';
import CertificateModal from '../components/CertificateModal';
import ReportModal from '../components/ReportModal';

export default function VerifyPage({ initialBatchId, onNavigateToAdmin }) {
  const [batchIdInput, setBatchIdInput] = useState(initialBatchId || 'PCM001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (initialBatchId) {
      setBatchIdInput(initialBatchId);
      performVerification(initialBatchId);
    } else {
      performVerification('PCM001');
    }
  }, [initialBatchId]);

  const performVerification = async (idToVerify) => {
    const id = (idToVerify || batchIdInput || '').trim().toUpperCase();
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
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }
      }
      setLoading(false);
    } catch (err) {
      setErrorResult({
        exists: false,
        batchId: id,
        alertTitle: "Connection Error",
        alertDescription: "Unable to query blockchain verification node.",
        recommendation: "Please ensure the TrueDose server is active."
      });
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(key);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Decentralized Pharmaceutical Verification Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Verify Medicine Authenticity
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Scan the packaging QR code or enter the batch identifier to inspect the tamper-evident provenance history anchored directly on the blockchain.
        </p>
      </div>

      {/* Search Bar & Quick Demo Pills */}
      <div className="max-w-2xl mx-auto space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performVerification(batchIdInput);
          }}
          className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/90 focus-within:border-emerald-500 transition"
        >
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={batchIdInput}
            onChange={(e) => setBatchIdInput(e.target.value)}
            placeholder="Enter Batch ID (e.g. PCM001)..."
            className="w-full bg-transparent px-3 py-4 text-sm text-white focus:outline-none uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-slate-500"
          />
          <div className="pr-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-400 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Scan with Camera"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Verify</span>
              )}
            </button>
          </div>
        </form>

        {/* Demo One-Click Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Test Presets:
          </span>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('PCM001');
              performVerification('PCM001');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-mono transition"
          >
            PCM001 (Genuine)
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('AMX404');
              performVerification('AMX404');
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-mono transition"
          >
            AMX404 (Cold Chain)
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('EXP902');
              performVerification('EXP902');
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-mono transition"
          >
            EXP902 (Expired)
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('FAKE999');
              performVerification('FAKE999');
            }}
            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-mono transition"
          >
            FAKE999 (Counterfeit)
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-300 font-medium">Interrogating Ethereum Smart Contract & Merkle Root...</p>
        </div>
      )}

      {/* Counterfeit / Error Alert State */}
      {!loading && errorResult && (
        <div className="max-w-3xl mx-auto bg-red-950/40 border-2 border-red-500/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 text-red-400 shrink-0">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                FLAGGED ALERT
              </span>
              <h2 className="text-xl font-bold text-white">{errorResult.alertTitle || "Batch Not Found"}</h2>
              <p className="text-sm text-red-200/90">{errorResult.alertDescription}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-red-500/20 space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Safety Recommendation</span>
            </div>
            <p className="text-slate-300">{errorResult.recommendation}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-red-500/20 text-xs">
            <div className="font-mono text-slate-400">
              Query Batch: <strong className="text-white">{errorResult.batchId}</strong> • Status: <span className="text-red-400 font-bold">REJECTED</span>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Counterfeit to Drug Controller</span>
            </button>
          </div>
        </div>
      )}

      {/* Genuine / Valid Verification Result */}
      {!loading && result && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Status Banner */}
          <div className={`p-6 rounded-2xl border shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            result.isRecalled
              ? 'bg-red-950/30 border-red-500/60'
              : result.isExpired
              ? 'bg-amber-950/30 border-amber-500/60'
              : 'bg-emerald-950/20 border-emerald-500/40'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl shrink-0 border ${
                result.isRecalled
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : result.isExpired
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {result.isRecalled ? (
                  <AlertOctagon className="w-8 h-8" />
                ) : result.isExpired ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider font-mono ${
                    result.isRecalled
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : result.isExpired
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {result.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">Verified via EVM Smart Contract</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {result.medicineName} <span className="text-emerald-400 font-normal">{result.dosage}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Batch: <strong className="text-slate-200 font-mono">{result.batchId}</strong> • Registered by <strong className="text-slate-200">{result.manufacturerName}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions & Expiry */}
            <div className="flex flex-col sm:items-end gap-2">
              <div className="sm:text-right shrink-0">
                <div className="text-xs text-slate-400 font-medium">Expiration Date</div>
                <div className={`text-base font-bold font-mono ${result.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                  {new Date(result.expiryDate).toLocaleDateString()}
                </div>
                <span className={`text-[11px] font-semibold ${result.isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                  {result.isExpired ? '⚠️ EXPIRED' : `${result.daysUntilExpiry} days remaining`}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Quality Lab CoA (IPFS)</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cold-Chain IoT Telemetry Box */}
          {result.telemetry && (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>IoT Cold-Chain Telemetry</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300">
                      LIVE SENSOR NODE
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Continuous reefer sensor readings verified on logistics transit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-center px-3 py-1.5 bg-slate-900/60 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Temperature</span>
                  <span className="font-bold text-blue-400 text-sm">{result.telemetry.currentTemperatureCelsius}°C</span>
                </div>
                <div className="text-center px-3 py-1.5 bg-slate-900/60 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Humidity</span>
                  <span className="font-bold text-slate-200 text-sm">{result.telemetry.humidityPercent}%</span>
                </div>
                <div className="text-center px-3 py-1.5 bg-slate-900/60 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Cold-Chain Status</span>
                  <span className="font-bold text-emerald-400 text-xs">PASSED ✓</span>
                </div>
              </div>
            </div>
          )}

          {/* Medicine Specifications Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              <span>Pharmaceutical Specifications & QA Credentials</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block text-[10px] uppercase">Batch ID</span>
                <span className="font-bold text-emerald-400 text-sm">{result.batchId}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block text-[10px] uppercase">Production Volume</span>
                <span className="font-bold text-slate-200 text-sm">{result.quantity?.toLocaleString()} {result.unit || 'units'}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block text-[10px] uppercase">Manufacturing Date</span>
                <span className="font-bold text-slate-200 text-sm">{new Date(result.manufacturingDate).toLocaleDateString()}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block text-[10px] uppercase">Current Custodian</span>
                <span className="font-bold text-amber-400 text-sm truncate block">{result.currentOwnerName}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-0.5">Active Ingredients</span>
                <span className="text-slate-300 font-sans">{result.activeIngredients || 'Standard active formulation'}</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-0.5">Storage Conditions</span>
                <span className="text-slate-300 font-sans">{result.storageConditions || 'Store below 25°C in dry conditions'}</span>
              </div>
            </div>
          </div>

          {/* Supply Chain Provenance Timeline */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>Tamper-Evident Supply Chain Journey</span>
                </h3>
                <p className="text-xs text-slate-400">Sequential ownership custody logged immutably on EVM blockchain</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 text-xs font-mono">
                {result.history.length} Handover{result.history.length > 1 ? 's' : ''} Logged
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
              {result.history.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-4 space-y-2 hover:border-emerald-500/40 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {step.stage || step.roleTo}
                        </span>
                        <h4 className="font-bold text-white text-sm">
                          {step.from} <span className="text-slate-500 font-normal">→</span> {step.to}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(step.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {step.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{step.location}</span>
                      </div>
                    )}

                    {step.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                        "{step.notes}"
                      </p>
                    )}

                    {step.txHash && (
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Transaction Hash:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 truncate max-w-[200px] sm:max-w-[320px]">
                            {step.txHash}
                          </span>
                          <button
                            onClick={() => handleCopy(step.txHash, `tx_${idx}`)}
                            className="p-1 hover:text-white transition"
                            title="Copy Tx Hash"
                          >
                            {copiedHash === `tx_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Ledger Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <span>Smart Contract: <span className="text-slate-200">{result.contractAddress}</span></span>
            </div>
            <div>
              <span>Network: <span className="text-emerald-400">{result.blockchainNetwork}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedId) => {
          setBatchIdInput(scannedId);
          performVerification(scannedId);
        }}
      />

      <CertificateModal
        batch={result}
        cert={result?.qualityCertificate}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

      <ReportModal
        batchId={errorResult ? errorResult.batchId : result?.batchId}
        medicineName={errorResult ? "Suspected Counterfeit Batch" : result?.medicineName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onNavigateToAdmin={onNavigateToAdmin}
      />
    </div>
  );
}
