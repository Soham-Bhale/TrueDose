import React, { useState } from 'react';
import { X, Award, HelpCircle, CheckCircle2, ShieldCheck, AlertTriangle, Layers, ArrowRight, Zap, Database, Lock, GraduationCap } from 'lucide-react';

export default function PresentationGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('demo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Presentation & Viva Defense Guide</h2>
              <p className="text-xs text-slate-500">Structured demonstration flow and academic examiner defense arguments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          {[
            { id: 'demo', label: '1-Minute Live Demonstration Flow' },
            { id: 'viva', label: 'Defense: Why Blockchain vs MongoDB?' },
            { id: 'rules', label: 'Smart Contract Business Rules' },
            { id: 'features', label: 'Core Technical Contributions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-700 text-teal-950 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <h3 className="font-bold text-teal-900 text-sm mb-1">Recommended Presentation Sequence</h3>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Walk through these 5 chronological steps to illustrate end-to-end provenance:
                </p>
              </div>

              <div className="grid gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Genesis: Register Batch as Manufacturer (ABC Pharma)</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">Switch role to <strong>Manufacturer</strong> → Click <strong>"Register New Batch"</strong> → Enter Batch ID <code className="text-teal-800 font-mono font-semibold">PCM001</code>, Medicine <em>Paracetamol 500mg</em>, Qty <em>5000</em>. Commit batch to blockchain.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Sequential Custody: Dispatch to Distributor & Wholesaler</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">Click <strong>"Transfer"</strong> → Select <em>Apex Logistics (Distributor)</em>. Switch role to <strong>Distributor</strong> and forward to <em>Metro Wholesalers</em>. Each handoff emits an on-chain event with timestamp and signatures.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs shrink-0">3</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Retail Delivery & Dispensary Patient Sale</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">Switch to <strong>Wholesaler</strong> → Transfer to <em>HealthPlus Pharmacy</em>. Switch to <strong>Pharmacy</strong> → Click <strong>"Dispense"</strong>. Medicine is logged as reached consumer.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs shrink-0">4</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Public Zero-Wallet Verification</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">Navigate to <strong>"Verify Medicine"</strong> → Search <code className="text-teal-800 font-mono font-semibold">PCM001</code> or scan the packaging QR. Display the genuine verification document and full sequential timeline.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs shrink-0">5</span>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Demonstrate Edge Cases (Counterfeit & Expired)</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">Click test presets: <code className="text-rose-700 font-mono font-semibold">FAKE999</code> (illustrating unverified counterfeit rejection and regulatory reporting) and <code className="text-amber-700 font-mono font-semibold">EXP902</code> (illustrating automatic expiration safety lock).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-900 text-sm mb-1">Key Examiner Question: "Why not simply use MongoDB / SQL?"</h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Examiners frequently ask this to test architectural depth. Provide this precise contrast:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold">
                    <Database className="w-4 h-4" /> Traditional Centralized Database (MongoDB / SQL)
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>Single point of compromise: Database administrators or compromised servers can secretly mutate history, dates, or ownership records without an audit trail.</li>
                    <li>No cryptographic non-repudiation: A distributor can deny having handled a contaminated or diverted medicine lot.</li>
                    <li>Lack of cross-organizational trust: Multiple competing pharmaceutical manufacturers and distributors refuse to rely on each other's private databases.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-teal-800 font-bold">
                    <Lock className="w-4 h-4" /> TrueDose Consortium Blockchain
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li><strong>Tamper-Evident Chaining:</strong> Records are sealed via cryptographic Merkle trees. Once written, past transactions cannot be secretly rewritten.</li>
                    <li><strong>Enforced Code State Machine:</strong> Smart contract logic strictly enforces transition rules (e.g. non-owners cannot transfer; expired medicines cannot be sold).</li>
                    <li><strong>Public Independent Verification:</strong> End consumers and hospital staff verify provenance directly against the ledger without requiring proprietary credentials.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h3 className="font-bold text-amber-900 text-sm mb-1">Smart Contract Enforced Invariants</h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  In our Solidity smart contract (<code className="font-mono">PharmaSupplyChain.sol</code>), these rules are enforced by code:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Rule 1: Role-Gated Genesis: </span>
                    <span>Only licensed manufacturers with verified addresses can mint new medicine batches via <code>createBatch()</code>.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Rule 2: Sequential Custody Pipeline: </span>
                    <span>Transfers must follow the physical lifecycle: Manufacturer → Distributor → Wholesaler → Pharmacy. Unauthorized jumps are rejected.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Rule 3: Current Custodian Ownership Guard: </span>
                    <span>Only the address currently recorded as custodian on the blockchain is authorized to execute a handoff.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Rule 4: Automatic Expiry Clearance Lock: </span>
                    <span>The smart contract compares the block timestamp with the batch expiry date and prevents distribution of expired medicines.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Rule 5: Emergency Quarantine Recall: </span>
                    <span>The regulatory authority or the manufacturing entity can trigger an emergency recall on-chain, quarantining all downstream lots.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Key Architectural Highlights</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Technical characteristics engineered into the TrueDose platform:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Hybrid On/Off-Chain Architecture</div>
                  <p className="text-slate-600 leading-relaxed">Anchors state, custody, and verification hashes immutably on-chain while keeping telemetry and certificates in IPFS and indexed storage for low gas footprint.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Zero-Wallet Citizen Verification</div>
                  <p className="text-slate-600 leading-relaxed">Patients need no crypto knowledge or wallet extensions. Packaging QR codes verify instantly via browser.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Tri-Vector Safety Shield</div>
                  <p className="text-slate-600 leading-relaxed">Comprehensive detection for counterfeit unlisted batches, expired pharmaceutical lots, and manufacturer emergency recalls.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
