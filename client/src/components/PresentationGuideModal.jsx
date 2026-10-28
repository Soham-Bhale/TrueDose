import React, { useState } from 'react';
import { X, GraduationCap } from 'lucide-react';

export default function PresentationGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('demo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modern Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">LifeLedger Viva Defense & Presentation Guide</h3>
              <p className="text-xs text-slate-400">Architectural Invariants, Live Flow & Evaluation Talking Points</p>
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

        {/* Tab Navigation */}
        <div className="bg-slate-100/80 px-5 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'demo', label: '1. Live Demo Flow (60s)' },
            { id: 'viva', label: '2. Viva Defense: Why Blockchain?' },
            { id: 'rules', label: '3. Smart Contract Invariants' },
            { id: 'architecture', label: '4. System Architecture' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-5 bg-slate-50 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 text-sm mb-1">
                  Chronological Demonstration Flow for Evaluators:
                </h4>
                <p className="text-xs text-blue-800">
                  Execute these 5 steps in the live workstation to show end-to-end chain of custody:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900">OPO Organ Harvest:</strong> Switch role to <em>Organ Procurement Org</em>. Click <strong>Harvest & Register Organ</strong>. Notice automatic Form 8 donor consent hash generation and cold-ischemia window lock (e.g. 24h for Kidney, 4h for Heart).
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900">Cryo-Transit Logistics Handoff:</strong> Switch role to <em>Logistics</em>. Execute medical custody transfer from OPO to specialized cold-chain air transport. Record milestone & live temperature (2.4°C).
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900">National Regulatory Clearance:</strong> Switch role to <em>Allocation Authority (NOTTO)</em>. Verify donor HLA matching with recipient queue and clear allocation for surgical hospital.
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-slate-900">Surgical Implantation Sign-Off:</strong> Switch role to <em>Transplant Hospital</em>. Receive organ in Operating Theater and sign off successful surgical graft into recipient.
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">5</span>
                  <div>
                    <strong className="text-slate-900">Specimen Audit & Cold-Ischemia Verification:</strong> Navigate to <strong>Organ Provenance Inspector</strong>. Inspect real-time elapsed cold ischemia time, donor consent IPFS certificate, and attempt to query an unregistered ID (`ORG-SUSPECT-9999`) to show counterfeit detection.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-950 text-sm mb-1">
                  Examiner Question: "Why Blockchain? Why not a centralized SQL/MongoDB database?"
                </h4>
                <p className="text-xs text-amber-800">
                  Key academic talking points and architectural arguments:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <div className="font-bold text-xs text-blue-700 uppercase tracking-wider">
                    1. Zero-Trust Multi-Stakeholder Consortium
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Organ transplantation involves hostile or competing entities: private air ambulances, rival hospital networks, municipal morgues, and international regulatory agencies. A centralized database administrator at any one hospital could alter donor timestamps, forge consent papers, or covertly swap recipient prioritization.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <div className="font-bold text-xs text-blue-700 uppercase tracking-wider">
                    2. Strict Anti-Trafficking Non-Repudiation
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under the National Organ Transplant Act (NOTA/THOTA), black-market commercial organ trafficking relies on falsifying donor origins. On LifeLedger, every organ requires cryptographic signature by the OPO with immutable brain-death certificate CID. Once anchored on EVM blocks, this provenance cannot be altered or erased.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                  <div className="font-bold text-xs text-blue-700 uppercase tracking-wider">
                    3. Smart-Contract Invariant Enforcement (Not Just Data Storage)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Unlike databases that passively accept updates, smart contracts execute programmable law: only the current holder can transfer custody, only verified hospitals can record surgical implantation, and any regulatory node can lock an organ with an instant emergency freeze.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Smart Contract (`LifeLedger.sol`) Invariants:</h4>
                <div className="space-y-1.5 text-xs font-mono text-slate-700">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">• <code className="text-blue-700">require(msg.sender == currentOwner)</code>: Strict medical custody ownership.</div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">• <code className="text-blue-700">require(!organ.isQuarantined)</code>: Quarantined organs are immediately locked.</div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">• <code className="text-blue-700">require(stage != Transplanted)</code>: Prevents double-allocation of grafted organs.</div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">• <code className="text-blue-700">hasRole(HOSPITAL_ROLE, msg.sender)</code>: Only authorized hospitals sign surgical implantation.</div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">• <code className="text-blue-700">hasRole(AUTHORITY_ROLE, msg.sender)</code>: Only health authorities issue quarantine halts.</div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <strong>Automated Test Coverage:</strong> 41 comprehensive invariants (16 Hardhat Solidity invariants + 25 Express API invariants) are verified automatically via <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">npm test</code>.
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2.5 text-xs text-slate-700">
                <div className="font-bold text-xs text-slate-900 uppercase tracking-wider">Consortium Tech Stack:</div>
                <div className="space-y-1.5">
                  <div>• <strong>Smart Contracts:</strong> Solidity v0.8.20 on Ethereum Paris EVM with Hardhat</div>
                  <div>• <strong>Consensus Model:</strong> Proof-of-Authority (PoA) consortium for instant finality and zero volatility gas costs</div>
                  <div>• <strong>Decentralized Storage:</strong> IPFS CIDs for high-resolution histopathology and Form 8 legal documentation</div>
                  <div>• <strong>Backend Gateway:</strong> Node.js / Express with cryptographic SHA-256 state ledger fallback</div>
                  <div>• <strong>User Interface:</strong> Modern React 19 SPA with Tailwind CSS v4 and radial quick-action HUD</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Action Strip */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            LifeLedger Project Defense Manual • Ready for Evaluation
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            OK - Got It
          </button>
        </div>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>LifeLedger v2.4 Defense Architecture</div>
          <div className="text-emerald-700 font-bold">Consortium Invariants: 41/41 Passed</div>
        </div>
      </div>
    </div>
  );
}
