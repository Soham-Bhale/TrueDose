import React, { useState } from 'react';
import { X, Award, HelpCircle, CheckCircle2, ShieldCheck, AlertTriangle, Layers, ArrowRight, Zap, Database, Lock } from 'lucide-react';

export default function PresentationGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('demo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Project Presentation & Viva Defense Guide</h2>
              <p className="text-xs text-slate-400">Everything you need to demonstrate and defend TrueDose to evaluators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 pt-2">
          {[
            { id: 'demo', label: '🎯 1-Minute Live Demo Flow' },
            { id: 'viva', label: '❓ "Why Blockchain vs MongoDB?"' },
            { id: 'rules', label: '🛡️ Smart Contract Rules' },
            { id: 'features', label: '✨ Project Contributions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <h3 className="font-semibold text-emerald-400 text-base mb-1">Recommended Presentation Script (Step-by-Step)</h3>
                <p className="text-xs text-slate-300">
                  Follow these 5 steps in front of your examiner to show a complete, living pharmaceutical supply chain:
                </p>
              </div>

              <div className="grid gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">1</span>
                  <div>
                    <p className="font-semibold text-white">Create Batch as ABC Pharma (Manufacturer)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Switch role to <strong>Manufacturer</strong> → Click <strong>"Create New Batch"</strong> → Enter Batch ID <code className="text-emerald-300">PCM001</code>, Medicine <em>Paracetamol 500mg</em>, Qty <em>5000</em>. Click <em>"Commit Batch to Blockchain"</em>.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">2</span>
                  <div>
                    <p className="font-semibold text-white">Transfer to Distributor & Wholesaler</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click <strong>"Transfer Batch"</strong> → Select <em>Apex Logistics (Distributor)</em>. Switch role to <strong>Distributor</strong> and forward to <em>Metro Wholesalers</em>. Each step writes an immutable event on EVM!</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">3</span>
                  <div>
                    <p className="font-semibold text-white">Wholesaler delivers to Pharmacy & Pharmacy dispenses</p>
                    <p className="text-xs text-slate-400 mt-0.5">Switch to <strong>Wholesaler</strong> → Transfer to <em>HealthPlus Pharmacy</em>. Switch to <strong>Pharmacy</strong> → Click <strong>"Dispense to Customer"</strong>. Medicine is now marked as reached consumer!</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0">4</span>
                  <div>
                    <p className="font-semibold text-white">Customer Scans QR Code</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click <strong>"Verify Medicine"</strong> → Search <code className="text-emerald-300">PCM001</code> or scan the QR code. Show the examiner the genuine certificate and the 4-stage blockchain ledger timeline with tx hashes!</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold text-xs shrink-0">5</span>
                  <div>
                    <p className="font-semibold text-white">Show Fake Batch & Expired Batch Edge Cases</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click the demo pills: <code className="text-red-300">FAKE999</code> (shows instant Counterfeit Alert: batch not found on chain) and <code className="text-amber-300">EXP902</code> (shows automatic Expiry Warning with safety block).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl">
                <h3 className="font-semibold text-blue-300 text-base mb-1">Guide/Examiner Question: "Why didn't you just use MongoDB?"</h3>
                <p className="text-xs text-slate-300">
                  Examiners ask this to test whether you truly understand the role of blockchain. Give this exact response:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                    <Database className="w-4 h-4" /> Traditional Database (MongoDB / SQL)
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
                    <li>Single point of failure & central control (any DBA or attacker with write permissions can alter history or delete records).</li>
                    <li>No cryptographic non-repudiation: A manufacturer or distributor can deny having shipped or received a tainted batch.</li>
                    <li>Disparate silos: Different companies don't trust sharing one company's private database.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                    <Lock className="w-4 h-4" /> TrueDose Blockchain Smart Contract
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
                    <li><strong>Tamper-Evident History:</strong> Transactions are cryptographically chained; once recorded, past ownership transfers cannot be secretly rewritten.</li>
                    <li><strong>Enforced State Machine:</strong> Smart contract code prevents unauthorized jumps (e.g. Pharmacy cannot manufacture; unauthorized party cannot transfer what they don't own).</li>
                    <li><strong>Public Non-Repudiable Verification:</strong> End consumers and regulators independently verify provenance without needing access to any proprietary corporate server.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                <h3 className="font-semibold text-amber-300 text-base mb-1">Smart Contract Enforced Business Rules</h3>
                <p className="text-xs text-slate-300">
                  In our Solidity contract (<code className="text-amber-200">PharmaSupplyChain.sol</code>), these rules are enforced by code rather than trusting human operators:
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Rule 1: Role-Gated Genesis: </span>
                    <span>Only approved manufacturers with verified licenses can call <code>createBatch()</code>.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Rule 2: Sequential Custody Transfer: </span>
                    <span>Manufacturer → Distributor → Wholesaler → Pharmacy. Reversing or skipping stages (e.g. Pharmacy selling directly back to Manufacturer) is rejected by contract modifiers.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Rule 3: Current Custodian Ownership Guard: </span>
                    <span>Only the address recorded as the current owner on the blockchain can transfer that batch.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Rule 4: Expiry Lock: </span>
                    <span>The smart contract compares the block timestamp with the batch expiry date and prevents distribution of expired medicines.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Rule 5: Emergency Quarantine Recall: </span>
                    <span>The regulatory authority or the issuing manufacturer can trigger an emergency recall on-chain that instantly flags every downstream unit in real-time.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                <h3 className="font-semibold text-purple-300 text-base mb-1">TrueDose Architectural Contribution</h3>
                <p className="text-xs text-slate-300">
                  What makes TrueDose a complete, production-ready prototype:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="font-bold text-white mb-1">⚡ Hybrid Storage Model</div>
                  <p className="text-slate-400">Stores critical state, owner, hashes, and audit history on-chain, while metadata, user licenses, and fast queries use high-speed backend storage to keep gas costs low.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="font-bold text-white mb-1">📱 Zero-Friction QR Verification</div>
                  <p className="text-slate-400">Customers require NO Ethereum wallet, NO MetaMask, and NO crypto funds. They scan the packaging QR code with any camera or phone browser for instant verification.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="font-bold text-white mb-1">🚨 Multi-Threat Protection</div>
                  <p className="text-slate-400">Protects against 3 distinct threats: Counterfeit fake batches (not found on-chain), Expired medicines (safety block), and Recalled contaminated lots (quarantine notice).</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Got it, Let's Demo!
          </button>
        </div>
      </div>
    </div>
  );
}
