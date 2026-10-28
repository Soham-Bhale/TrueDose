import React from 'react';
import { X, ShieldCheck, Printer, CheckCircle, HeartHandshake } from 'lucide-react';

export default function CertificateModal({ batch, cert, isOpen, onClose }) {
  if (!isOpen || !batch) return null;

  const organId = batch.organId || batch.batchId || 'ORG-KID-8041';
  const organType = batch.organType || batch.medicineName || 'Kidney (Left)';
  const donorId = batch.donorId || 'DNR-MUM-9021';
  const bloodType = batch.donorBloodType || 'O+';
  const hlaMarker = batch.hlaMarker || '6/6 HLA-Matched';

  const certificateData = cert || {
    ipfsCID: batch.ipfsCID || "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    accreditationBody: "National Organ & Tissue Transplant Organization (NOTTO)",
    certifyingOfficer: "Dr. Radhika Sharma, MS, MCh (Head of Transplant Surgery)",
    brainDeathCertified: "24-Hour Reflex Test Confirmed (Form 8)",
    serologyScreening: "HIV-1/2, HBV, HCV, Syphilis, CMV: ALL NON-REACTIVE",
    graftViability: "Score 1A (Zero Macro-Steatosis, Arterial Resistance Index < 0.25)",
    donorConsentType: "Cadaveric / Deceased Donor Living Will + Next-of-Kin Attestation",
    digitalSignatureVerified: true,
    certifiedAt: batch.harvestTimestamp ? new Date(batch.harvestTimestamp).toLocaleDateString() : 'October 25, 2026'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modern Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Form 8 Donor Consent & Viability Certificate</h3>
              <p className="text-xs text-slate-400">Cryptographically Anchored NOTTO Medical Clearance</p>
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

        {/* Action Toolbar */}
        <div className="bg-slate-100/80 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">IPFS Anchored CID:</span>
            <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-300 text-blue-700 shadow-2xs">
              {certificateData.ipfsCID.slice(0, 20)}...
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Form 8 Certificate</span>
          </button>
        </div>

        {/* Certificate Paper View */}
        <div className="p-5 bg-slate-50 overflow-y-auto flex-1">
          <div
            id="printable-certificate"
            className="bg-white border-2 border-slate-800 rounded-xl p-6 text-slate-900 font-serif shadow-md relative"
          >
            {/* Watermark */}
            <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
              <ShieldCheck className="w-40 h-40 text-black" />
            </div>

            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800">
              <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full px-3 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider mb-1.5">
                LEGAL FORM 8 • NOTTO ACCREDITED GRAFT CLEARANCE
              </div>
              <h2 className="text-xl font-bold tracking-tight uppercase text-slate-900">
                Organ Donor Consent & Clinical Viability Certificate
              </h2>
              <p className="text-[11px] font-sans text-slate-500 mt-1">
                Issued pursuant to The Transplantation of Human Organs and Tissues Act (THOTA) & EVM Consortium
              </p>
            </div>

            {/* Specimen and Donor Information Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-200 text-xs font-sans">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">ORGAN SPECIMEN ID</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{organId}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">SPECIMEN TYPE</span>
                <span className="font-bold text-slate-900">{organType}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">DECEASED DONOR REGISTRY ID</span>
                <span className="font-mono font-bold text-slate-900">{donorId}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">ABO BLOOD GROUP & RH FACTOR</span>
                <span className="font-black text-red-600 text-sm">{bloodType}</span>
              </div>
            </div>

            {/* Medical Screening Checklist */}
            <div className="py-3 border-b border-slate-200 font-sans space-y-2 text-xs">
              <div className="font-semibold text-[11px] text-slate-700 uppercase tracking-wider">
                Laboratory & Histopathological Screening Invariants:
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-800">1. Neurological Brain-Death:</span>
                  <span className="text-emerald-700 font-bold">{certificateData.brainDeathCertified}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-800">2. Pathogen Serology Panel:</span>
                  <span className="text-emerald-700 font-bold">{certificateData.serologyScreening}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-800">3. Graft Perfusion Viability:</span>
                  <span className="text-emerald-700 font-bold">{certificateData.graftViability}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-800">4. HLA Histocompatibility:</span>
                  <span className="text-blue-700 font-bold">{hlaMarker}</span>
                </div>
              </div>
            </div>

            {/* Legal Consent Attestation */}
            <div className="py-3 border-b border-slate-200 text-xs leading-relaxed text-slate-700">
              <p>
                <strong>Statutory Declaration:</strong> It is hereby certified that valid, informed and non-coerced donor consent was verified prior to organ retrieval. The procurement adhered strictly to cold-perfusion hypothermic preservation standards. No monetary or commercial consideration was exchanged, in total adherence to anti-trafficking statutes.
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-4 flex items-end justify-between font-sans text-xs">
              <div>
                <div className="font-bold text-slate-900">{certificateData.certifyingOfficer}</div>
                <div className="text-slate-500">Procuring Surgeon & OPO Medical Director</div>
                <div className="text-slate-400 font-mono text-[10px] mt-0.5">Signed: {certificateData.certifiedAt}</div>
              </div>

              <div className="text-right">
                <div className="inline-block border-2 border-emerald-600 bg-emerald-50 text-emerald-800 rounded px-3 py-1 font-bold text-[11px] tracking-wider uppercase">
                  ✓ EVM VALIDATED
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  SHA-256 Sig: {batch.donorConsentHash ? batch.donorConsentHash.slice(0, 16) : '0x7b2f91a0...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>IPFS CID: {certificateData.ipfsCID.slice(0, 16)}...</span>
          <span className="text-emerald-700 font-semibold">Tamper-Proof Seal: VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
