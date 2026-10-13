import React, { useState, useEffect } from 'react';
import {
  Search, Camera, ShieldCheck, AlertTriangle, CheckCircle2,
  Clock, MapPin, ExternalLink, Copy, Check, ChevronRight,
  Pill, AlertOctagon, Award, Thermometer, ShieldAlert,
  FileCheck, Hash, Info, ArrowRight, ShieldX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import QRScannerModal from '../components/QRScannerModal';
import CertificateModal from '../components/CertificateModal';
import ReportModal from '../components/ReportModal';

export default function VerifyPage({ initialBatchId, onNavigateToAdmin }) {
  const { currentUser, switchRole, investigationCount } = useAuth();
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
              particleCount: 40,
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
        alertTitle: "Node Query Error",
        alertDescription: "Unable to query blockchain verification node.",
        recommendation: "Ensure the TrueDose consortium backend is running on port 5000."
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Active Role Indicator Bar */}
      {currentUser && currentUser.role !== 'customer' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-700">
              Active Role Workspace: <strong className="text-slate-900 font-bold">{currentUser.badge}</strong> — {currentUser.name}
            </span>
            {currentUser.role === 'admin' && investigationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                {investigationCount} Active Counterfeit Case{investigationCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs self-end sm:self-auto"
          >
            <span>Open {currentUser.badge} Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Consortium Drug Verification Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verify Medicine Authenticity
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Scan packaging QR codes or query batch identifiers to inspect immutable chain-of-custody, formulation specifications, and cold-chain compliance.
        </p>
      </div>

      {/* Search Bar & Test Presets */}
      <div className="max-w-2xl mx-auto space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performVerification(batchIdInput);
          }}
          className="relative flex items-center rounded-xl bg-white border border-slate-300 shadow-sm focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 transition"
        >
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={batchIdInput}
            onChange={(e) => setBatchIdInput(e.target.value)}
            placeholder="Enter Batch Identifier (e.g. PCM001)..."
            className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 focus:outline-none uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:text-slate-400"
          />
          <div className="pr-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Scan with Camera or Image"
            >
              <Camera className="w-4 h-4 text-teal-700" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Verify</span>
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 text-xs font-medium">Sample Test Lots:</span>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('PCM001');
              performVerification('PCM001');
            }}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px] font-medium transition shadow-2xs"
          >
            PCM001 <span className="text-teal-700 font-sans">(Genuine)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('AMX404');
              performVerification('AMX404');
            }}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px] font-medium transition shadow-2xs"
          >
            AMX404 <span className="text-blue-700 font-sans">(Cold Chain)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('EXP902');
              performVerification('EXP902');
            }}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px] font-medium transition shadow-2xs"
          >
            EXP902 <span className="text-amber-700 font-sans">(Expired)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchIdInput('FAKE999');
              performVerification('FAKE999');
            }}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-300 font-mono text-[11px] font-medium transition shadow-2xs"
          >
            FAKE999 <span className="text-rose-700 font-sans">(Counterfeit)</span>
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-700 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-600 font-medium">Interrogating Ethereum Smart Contract & Registry...</p>
        </div>
      )}

      {/* Counterfeit / Flagged Warning Alert */}
      {!loading && errorResult && (
        <div className="max-w-3xl mx-auto bg-white border-2 border-rose-400 rounded-xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 shrink-0">
              <ShieldX className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                  VERIFICATION FAILED
                </span>
                <span className="text-xs text-slate-500 font-mono">Batch: {errorResult.batchId}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{errorResult.alertTitle || "Batch Not Found"}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{errorResult.alertDescription}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Public Safety Protocol</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{errorResult.recommendation}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="text-slate-500 font-mono">
              Identifier: <strong className="text-slate-900">{errorResult.batchId}</strong> • Clearance: <span className="text-rose-700 font-bold">REJECTED</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Report Counterfeit to Drug Controller</span>
              </button>
              {investigationCount > 0 && (
                <button
                  onClick={() => {
                    switchRole('admin');
                    if (onNavigateToAdmin) onNavigateToAdmin();
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>View in Admin Portal ({investigationCount} Cases)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Genuine / Valid Verification Result */}
      {!loading && result && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Status Header Card */}
          <div className={`p-6 rounded-xl border shadow-xs bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
            result.isRecalled
              ? 'border-rose-300'
              : result.isExpired
              ? 'border-amber-300'
              : 'border-slate-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 border ${
                result.isRecalled
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : result.isExpired
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {result.isRecalled ? (
                  <AlertOctagon className="w-7 h-7" />
                ) : result.isExpired ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <ShieldCheck className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                    result.isRecalled
                      ? 'bg-rose-100 text-rose-800'
                      : result.isExpired
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {result.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500">Cryptographically Verified</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {result.medicineName} <span className="text-slate-500 font-normal text-lg">({result.dosage})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Batch: <strong className="text-slate-800 font-mono">{result.batchId}</strong> • Manufactured by <strong className="text-slate-800">{result.manufacturerName}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions & Expiry */}
            <div className="flex flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <div className="sm:text-right shrink-0">
                <div className="text-[11px] text-slate-500 font-medium">Expiry Clearance</div>
                <div className={`text-sm font-bold font-mono ${result.isExpired ? 'text-rose-700' : 'text-slate-900'}`}>
                  {new Date(result.expiryDate).toLocaleDateString()}
                </div>
                <span className={`text-[11px] font-medium ${result.isExpired ? 'text-rose-700 font-bold' : 'text-emerald-700'}`}>
                  {result.isExpired ? 'EXPIRED' : `${result.daysUntilExpiry} days remaining`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lab CoA (IPFS)</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cold-Chain IoT Telemetry Box */}
          {result.telemetry && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>IoT Cold-Chain Telemetry</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-800">
                      LIVE SENSOR NODE
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Automated temperature telemetry logged during refrigerated transit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-center px-3.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Temperature</span>
                  <span className="font-bold text-blue-700 text-sm">{result.telemetry.currentTemperatureCelsius}°C</span>
                </div>
                <div className="text-center px-3.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Humidity</span>
                  <span className="font-bold text-slate-800 text-sm">{result.telemetry.humidityPercent}%</span>
                </div>
                <div className="text-center px-3.5 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 text-[10px] block">Status</span>
                  <span className="font-bold text-emerald-800 text-xs">Compliant</span>
                </div>
              </div>
            </div>
          )}

          {/* Specifications Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-700" />
              <span>Pharmaceutical Specifications & Release Credentials</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Batch ID</span>
                <span className="font-bold text-slate-900 text-sm">{result.batchId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Production Volume</span>
                <span className="font-bold text-slate-800 text-sm">{result.quantity?.toLocaleString()} {result.unit || 'units'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Manufacturing Date</span>
                <span className="font-bold text-slate-800 text-sm">{new Date(result.manufacturingDate).toLocaleDateString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Current Custodian</span>
                <span className="font-bold text-teal-700 text-sm truncate block">{result.currentOwnerName}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase mb-0.5">Active Ingredients</span>
                <span className="text-slate-700 font-sans">{result.activeIngredients || 'Standard active formulation'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase mb-0.5">Storage Recommendations</span>
                <span className="text-slate-700 font-sans">{result.storageConditions || 'Store below 25°C in controlled dry conditions'}</span>
              </div>
            </div>
          </div>

          {/* Supply Chain Provenance Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-teal-700" />
                  <span>Tamper-Evident Chain of Custody</span>
                </h3>
                <p className="text-xs text-slate-500">Chronological custody handoffs signed by authorized consortium entities</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                {result.history.length} Event{result.history.length > 1 ? 's' : ''} Recorded
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {result.history.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  </div>

                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-teal-50 text-teal-800 border border-teal-200">
                          {step.stage || step.roleTo}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {step.from} <span className="text-slate-400 font-normal">→</span> {step.to}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(step.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {step.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{step.location}</span>
                      </div>
                    )}

                    {step.notes && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        "{step.notes}"
                      </p>
                    )}

                    {step.txHash && (
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1.5 border-t border-slate-200">
                        <span className="text-slate-400 text-[10px] uppercase">Transaction Hash:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-teal-700 truncate max-w-[200px] sm:max-w-[340px]">
                            {step.txHash}
                          </span>
                          <button
                            onClick={() => handleCopy(step.txHash, `tx_${idx}`)}
                            className="p-1 hover:text-slate-900 transition"
                            title="Copy Tx Hash"
                          >
                            {copiedHash === `tx_${idx}` ? <Check className="w-3 h-3 text-teal-700" /> : <Copy className="w-3 h-3" />}
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Contract Address: <span className="text-slate-900 font-semibold">{result.contractAddress}</span></span>
            </div>
            <div>
              <span>Network: <span className="text-teal-700 font-semibold">{result.blockchainNetwork}</span></span>
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
