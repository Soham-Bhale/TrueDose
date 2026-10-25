import React from 'react';
import { X, Award, FileCheck, ShieldCheck, Printer, ExternalLink, CheckCircle, Hash, HeartHandshake } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl swing-raised shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar">
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-green-300" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: Form 8 Donor Consent & Brain Death Clearance [CID Proof]
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

        {/* Action Toolbar */}
        <div className="bg-[#ECE9D8] px-3 py-2 border-b border-[#808080] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-[#333333]">
            <CheckCircle className="w-3.5 h-3.5 text-green-700" />
            <span className="font-bold">Cryptographically Anchored:</span>{' '}
            <span className="font-mono text-[10px] bg-white px-1 border border-[#808080] text-[#0A246A]">
              IPFS: {certificateData.ipfsCID.slice(0, 18)}...
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="swing-btn swing-btn-primary text-xs py-0.5 px-3 flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5 text-[#0A246A]" />
            <span>Print Form 8 Certificate</span>
          </button>
        </div>

        {/* Certificate Paper View */}
        <div className="p-4 bg-[#ECE9D8] overflow-y-auto flex-1">
          <div
            id="printable-certificate"
            className="bg-white border-2 border-[#1a1a1a] p-6 text-[#1a1a1a] font-serif shadow-sm relative"
          >
            {/* Watermark */}
            <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
              <ShieldCheck className="w-40 h-40 text-black" />
            </div>

            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-[#1a1a1a]">
              <div className="inline-block bg-green-100 text-green-900 border border-green-400 px-3 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider mb-1">
                LEGAL FORM 8 • NOTTO ACCREDITED GRAFT CLEARANCE
              </div>
              <h2 className="text-xl font-bold tracking-tight uppercase text-black">
                Organ Donor Consent & Clinical Viability Certificate
              </h2>
              <p className="text-[10px] font-sans text-[#555555] mt-0.5">
                Issued pursuant to The Transplantation of Human Organs and Tissues Act (THOTA) & EVM Consortium
              </p>
            </div>

            {/* Specimen and Donor Information Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-[#CCCCCC] text-[11px] font-sans">
              <div>
                <span className="text-[#666666] text-[10px] block">ORGAN SPECIMEN ID</span>
                <span className="font-mono font-bold text-black text-sm">{organId}</span>
              </div>
              <div>
                <span className="text-[#666666] text-[10px] block">SPECIMEN TYPE</span>
                <span className="font-bold text-black">{organType}</span>
              </div>
              <div>
                <span className="text-[#666666] text-[10px] block">DECEASED DONOR REGISTRY ID</span>
                <span className="font-mono font-bold text-black">{donorId}</span>
              </div>
              <div>
                <span className="text-[#666666] text-[10px] block">ABO BLOOD GROUP & RH FACTOR</span>
                <span className="font-black text-red-800 text-sm">{bloodType}</span>
              </div>
            </div>

            {/* Medical Screening Checklist */}
            <div className="py-3 border-b border-[#CCCCCC] font-sans space-y-2 text-[11px]">
              <div className="font-bold text-[10px] text-[#333333] uppercase tracking-wider">
                Laboratory & Histopathological Screening Invariants:
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-[#F8F9FA] p-2 border border-[#E0E0E0]">
                  <span className="font-bold block text-black">1. Neurological Brain-Death:</span>
                  <span className="text-green-800 font-bold">{certificateData.brainDeathCertified}</span>
                </div>
                <div className="bg-[#F8F9FA] p-2 border border-[#E0E0E0]">
                  <span className="font-bold block text-black">2. Pathogen Serology Panel:</span>
                  <span className="text-green-800 font-bold">{certificateData.serologyScreening}</span>
                </div>
                <div className="bg-[#F8F9FA] p-2 border border-[#E0E0E0]">
                  <span className="font-bold block text-black">3. Graft Perfusion Viability:</span>
                  <span className="text-green-800 font-bold">{certificateData.graftViability}</span>
                </div>
                <div className="bg-[#F8F9FA] p-2 border border-[#E0E0E0]">
                  <span className="font-bold block text-black">4. HLA Histocompatibility:</span>
                  <span className="text-[#0A246A] font-bold">{hlaMarker}</span>
                </div>
              </div>
            </div>

            {/* Legal Consent Attestation */}
            <div className="py-3 border-b border-[#CCCCCC] text-[11px] leading-relaxed">
              <p>
                <strong>Statutory Declaration:</strong> It is hereby certified that valid, informed and non-coerced donor consent was verified prior to organ retrieval. The procurement adhered strictly to cold-perfusion hypothermic preservation standards. No monetary or commercial consideration was exchanged, in total adherence to anti-trafficking statutes.
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-4 flex items-end justify-between font-sans text-[10px]">
              <div>
                <div className="font-bold text-black">{certificateData.certifyingOfficer}</div>
                <div className="text-[#666666]">Procuring Surgeon & OPO Medical Director</div>
                <div className="text-[#888888] font-mono text-[9px] mt-0.5">Signed: {certificateData.certifiedAt}</div>
              </div>

              <div className="text-right">
                <div className="inline-block border-2 border-green-800 text-green-900 px-3 py-1 font-bold text-[10px] tracking-wider uppercase rotate-[-2deg]">
                  ✓ EVM VALIDATED
                </div>
                <div className="text-[9px] font-mono text-[#666666] mt-1">
                  SHA-256 Sig: {batch.donorConsentHash ? batch.donorConsentHash.slice(0, 16) : '0x7b2f91a0...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: CertificateModal</div>
          <div className="swing-status-pane font-mono">IPFS CID: {certificateData.ipfsCID.slice(0, 14)}...</div>
          <div className="swing-status-pane flex-1 text-right">Tamper-Proof Seal: VERIFIED</div>
        </div>
      </div>
    </div>
  );
}
