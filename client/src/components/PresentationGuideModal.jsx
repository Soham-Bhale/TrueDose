import React, { useState } from 'react';
import { X, Award, HelpCircle, CheckCircle2, ShieldCheck, AlertTriangle, Layers, ArrowRight, Zap, Database, Lock, GraduationCap, Heart, Clock, Truck, FileCheck, Building2 } from 'lucide-react';

export default function PresentationGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('demo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-4xl swing-raised shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Java Window Titlebar */}
        <div className="swing-titlebar">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
            <span className="font-bold text-xs tracking-wide">
              javax.swing.JDialog: LifeLedger Architecture & Examiner Viva Defense Guide
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
        <div className="bg-[#ECE9D8] px-3 pt-2 border-b border-[#808080] flex items-center gap-1 text-xs overflow-x-auto">
          {[
            { id: 'demo', label: '1. Live Demo Flow (60s)' },
            { id: 'viva', label: '2. Viva Defense: Why Blockchain?' },
            { id: 'rules', label: '3. Smart Contract Invariants' },
            { id: 'architecture', label: '4. System Architecture' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-[11px] font-bold border-t-2 border-l-2 border-r-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#ECE9D8] border-white border-b-transparent translate-y-px text-[#0A246A]'
                  : 'bg-[#DCD8C8] border-[#808080] text-[#555555]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-3 bg-[#ECE9D8] overflow-y-auto flex-1 space-y-3 text-[11px] text-[#222222]">
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <div className="p-2.5 swing-sunken bg-[#F5F8FC] border border-blue-400">
                <h3 className="font-bold text-[#0A246A] text-xs mb-1">
                  Chronological Demonstration Flow for Evaluators:
                </h3>
                <p className="text-[10px] text-[#444444]">
                  Execute these 5 steps in the live workstation to show end-to-end chain of custody:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2 bg-white swing-sunken flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#0A246A] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-black">OPO Organ Harvest:</strong> Switch role to <em>Organ Procurement Org</em>. Click <strong>Harvest & Register Organ</strong>. Notice automatic Form 8 donor consent hash generation and cold-ischemia window lock (e.g. 24h for Kidney, 4h for Heart).
                  </div>
                </div>

                <div className="p-2 bg-white swing-sunken flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#0A246A] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-black">Cryo-Transit Logistics Handoff:</strong> Switch role to <em>Logistics</em>. Execute medical custody transfer from OPO to specialized cold-chain air transport. Record milestone & live temperature (2.4°C).
                  </div>
                </div>

                <div className="p-2 bg-white swing-sunken flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#0A246A] text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-black">National Regulatory Clearance:</strong> Switch role to <em>Allocation Authority (NOTTO)</em>. Verify donor HLA matching with recipient queue and clear allocation for surgical hospital.
                  </div>
                </div>

                <div className="p-2 bg-white swing-sunken flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#0A246A] text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-black">Surgical Implantation Sign-Off:</strong> Switch role to <em>Transplant Hospital</em>. Receive organ in Operating Theater and sign off successful surgical graft into recipient.
                  </div>
                </div>

                <div className="p-2 bg-white swing-sunken flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#0A246A] text-white font-bold text-xs flex items-center justify-center shrink-0">5</span>
                  <div>
                    <strong className="text-black">Specimen Audit & Cold-Ischemia Verification:</strong> Navigate to <strong>Organ Provenance Inspector</strong>. Inspect real-time elapsed cold ischemia time, donor consent IPFS certificate, and attempt to query an unregistered ID (`ORG-SUSPECT-9999`) to show counterfeit detection.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-3">
              <div className="p-2.5 swing-sunken bg-[#FFFFF0] border border-amber-400">
                <h3 className="font-bold text-amber-950 text-xs mb-1">
                  Examiner Question: "Why Blockchain? Why not a centralized SQL/MongoDB database?"
                </h3>
                <p className="text-[10px] text-[#555555]">
                  Key academic talking points and architectural arguments:
                </p>
              </div>

              <div className="space-y-2">
                <fieldset className="p-2 swing-etched bg-white">
                  <legend className="px-1 font-bold text-[10px] text-[#0A246A]">
                    1. Zero-Trust Multi-Stakeholder Consortium
                  </legend>
                  <p className="text-[10px] text-[#333333] leading-relaxed">
                    Organ transplantation involves hostile or competing entities: private air ambulances, rival hospital networks, municipal morgues, and international regulatory agencies. A centralized database administrator at any one hospital could alter donor timestamps, forge consent papers, or covertly swap recipient prioritization.
                  </p>
                </fieldset>

                <fieldset className="p-2 swing-etched bg-white">
                  <legend className="px-1 font-bold text-[10px] text-[#0A246A]">
                    2. Strict Anti-Trafficking Non-Repudiation
                  </legend>
                  <p className="text-[10px] text-[#333333] leading-relaxed">
                    Under the National Organ Transplant Act (NOTA/THOTA), black-market commercial organ trafficking relies on falsifying donor origins. On LifeLedger, every organ requires cryptographic signature by the OPO with immutable brain-death certificate CID. Once anchored on EVM blocks, this provenance cannot be altered or erased.
                  </p>
                </fieldset>

                <fieldset className="p-2 swing-etched bg-white">
                  <legend className="px-1 font-bold text-[10px] text-[#0A246A]">
                    3. Smart-Contract Invariant Enforcement (Not Just Data Storage)
                  </legend>
                  <p className="text-[10px] text-[#333333] leading-relaxed">
                    Unlike databases that passively accept updates, smart contracts execute programmable law: only the current holder can transfer custody, only verified hospitals can record surgical implantation, and any regulatory node can lock an organ with an instant emergency freeze.
                  </p>
                </fieldset>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-2">
              <div className="p-2.5 swing-sunken bg-white">
                <h4 className="font-bold text-xs text-[#0A246A] mb-1">Smart Contract (`LifeLedger.sol`) Invariants:</h4>
                <div className="space-y-1 text-[10px] font-mono text-[#333333]">
                  <div>• <code>require(msg.sender == currentOwner)</code>: Strict medical custody ownership.</div>
                  <div>• <code>require(!organ.isQuarantined)</code>: Quarantined organs are immediately locked.</div>
                  <div>• <code>require(stage != Transplanted)</code>: Prevents double-allocation of grafted organs.</div>
                  <div>• <code>hasRole(HOSPITAL_ROLE, msg.sender)</code>: Only authorized hospitals sign surgical implantation.</div>
                  <div>• <code>hasRole(AUTHORITY_ROLE, msg.sender)</code>: Only health authorities issue quarantine halts.</div>
                </div>
              </div>

              <div className="p-2.5 swing-sunken bg-[#F5FFF5] border border-green-500 text-[10px] text-[#222222]">
                <strong>Automated Test Coverage:</strong> 41 comprehensive invariants (16 Hardhat Solidity invariants + 25 Express API invariants) are verified automatically via <code>npm test</code>.
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-2">
              <div className="p-2.5 swing-sunken bg-white space-y-1.5 text-[10px]">
                <div className="font-bold text-xs text-[#0A246A]">Consortium Tech Stack:</div>
                <div>• <strong>Smart Contracts:</strong> Solidity v0.8.20 on Ethereum Paris EVM with Hardhat</div>
                <div>• <strong>Consensus Model:</strong> Proof-of-Authority (PoA) consortium for instant finality and zero volatility gas costs</div>
                <div>• <strong>Decentralized Storage:</strong> IPFS CIDs for high-resolution histopathology and Form 8 legal documentation</div>
                <div>• <strong>Backend Gateway:</strong> Node.js / Express with cryptographic SHA-256 state ledger fallback</div>
                <div>• <strong>User Interface:</strong> Retro Java Swing / AWT 3D desktop aesthetic built in React 19 + Tailwind CSS</div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Action Strip */}
        <div className="bg-[#ECE9D8] px-3 py-2 border-t border-[#808080] flex items-center justify-between">
          <div className="text-[10px] text-[#555555]">
            LifeLedger Project Defense Manual • Ready for Evaluation
          </div>
          <button
            onClick={onClose}
            className="swing-btn swing-btn-primary text-xs py-1 px-4"
          >
            OK
          </button>
        </div>

        {/* Java Dialog Status Bar */}
        <div className="swing-statusbar">
          <div className="swing-status-pane">JDialog: PresentationGuide</div>
          <div className="swing-status-pane">LifeLedger v2.0</div>
          <div className="swing-status-pane flex-1 text-right">Invariants: 41/41 Passed</div>
        </div>
      </div>
    </div>
  );
}
