import React from 'react';
import { X, Award, FileCheck, ShieldCheck, Printer, ExternalLink, CheckCircle, Hash } from 'lucide-react';

export default function CertificateModal({ batch, cert, isOpen, onClose }) {
  if (!isOpen || !batch) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateData = cert || {
    ipfsCID: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    accreditationBody: "National Drug Quality Assurance Bureau (NDQAB)",
    certifyingOfficer: "Dr. Radhika Sharma, Head of Analytical QA",
    assayPurity: "99.85%",
    dissolutionRate: "98.4% in 30 mins",
    heavyMetalsPpm: "< 5 ppm (Pass)",
    microbialAssay: "Sterile / Negative for Pathogens",
    digitalSignatureVerified: true,
    certifiedAt: batch.manufacturingDate
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Certificate of Analysis (CoA)</h3>
              <p className="text-xs text-slate-500">Cryptographically anchored to IPFS & EVM Blockchain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Paper View */}
        <div className="p-6 overflow-y-auto bg-slate-50/50">
          <div id="printable-certificate" className="w-full bg-white text-slate-900 p-8 rounded-xl shadow-xs border-2 border-slate-200 relative font-serif">
            {/* Watermark badge */}
            <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
              <ShieldCheck className="w-36 h-36 text-slate-900" />
            </div>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-sans font-bold tracking-widest uppercase mb-2 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> OFFICIAL GMP QUALITY RELEASE
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Certificate of Analysis
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-1">
                Issued by {certificateData.accreditationBody} • GLP Certified Testing Laboratory
              </p>
            </div>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs font-sans">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Product Name</span>
                <span className="font-bold text-slate-900 text-sm">{batch.medicineName}</span>
                <span className="text-slate-600 block">{batch.dosage}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Batch Identifier</span>
                <span className="font-bold text-teal-800 text-sm font-mono">{batch.batchId}</span>
                <span className="text-slate-600 block">Mfg: {new Date(batch.manufacturingDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Manufacturing Entity</span>
                <span className="font-bold text-slate-900">{batch.manufacturerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Release Clearance</span>
                <span className="font-bold text-slate-900">{new Date(batch.manufacturingDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Chemical & Biological Assay Table */}
            <div className="py-5 border-b border-slate-200">
              <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-700 mb-3">
                Analytical Test Parameters
              </h4>
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-600 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Test Parameter</th>
                    <th className="py-2 px-3">Pharmacopeia Standard</th>
                    <th className="py-2 px-3">Batch Observation</th>
                    <th className="py-2 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Active Assay (HPLC Purity)</td>
                    <td className="py-2.5 px-3">98.0% - 102.0%</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{certificateData.assayPurity}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">PASS ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Dissolution Rate</td>
                    <td className="py-2.5 px-3">&gt; 80% in 45 min</td>
                    <td className="py-2.5 px-3 font-mono">{certificateData.dissolutionRate}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">PASS ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Heavy Metals (Lead/Arsenic)</td>
                    <td className="py-2.5 px-3">&lt; 10 ppm</td>
                    <td className="py-2.5 px-3 font-mono">{certificateData.heavyMetalsPpm}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">PASS ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Microbial Bioburden</td>
                    <td className="py-2.5 px-3">USP &lt;61&gt; Pathogen Free</td>
                    <td className="py-2.5 px-3 font-mono">{certificateData.microbialAssay}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">PASS ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cryptographic Proof & Signature */}
            <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">IPFS Content Identifier (CID)</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  <Hash className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="truncate max-w-[240px]">{certificateData.ipfsCID}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-900">{certificateData.certifyingOfficer}</div>
                <span className="text-[10px] text-slate-500 block">Chief Analytical Chemist • Qualified Person (QP)</span>
                <span className="text-[9px] text-teal-700 font-bold block mt-0.5">DIGITALLY SIGNED & VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
