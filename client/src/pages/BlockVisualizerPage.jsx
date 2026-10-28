import React, { useState } from 'react';
import {
  Boxes, Link as LinkIcon, ShieldCheck, AlertTriangle, CheckCircle2,
  Cpu, Play, RefreshCw, Lock, Unlock,
  Activity, Zap, Info, HeartHandshake,
  Truck, Building2, FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Real cryptographic SHA-256 hashing using Web Cryptography API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial realistic blockchain dataset
const INITIAL_BLOCKS = [
  {
    blockNumber: 0,
    timestamp: '2026-10-28 08:00:00 UTC',
    validator: 'Genesis Consortium (NOTTO Multi-Sig)',
    validatorAddr: '0x0000000000000000000000000000000000000000',
    prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    hash: '0x8f2a1b9c3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    tampered: false,
    transactions: [
      {
        txHash: '0xgen01',
        type: 'CONTRACT_DEPLOYMENT',
        desc: 'LifeLedger.sol deployed on Ethereum PoA Consortium network',
        sender: 'NOTTO Directorate',
        receiver: 'Consortium Contract'
      },
      {
        txHash: '0xgen02',
        type: 'VALIDATOR_ENROLLMENT',
        desc: 'Enrolled Lilavati OPO, AeroMed Logistics & Apollo Hospitals as PoA signers',
        sender: 'NOTTO Directorate',
        receiver: 'Validator Set'
      }
    ]
  },
  {
    blockNumber: 1,
    timestamp: '2026-10-28 09:15:22 UTC',
    validator: 'Lilavati Hospital OPO Node',
    validatorAddr: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    prevHash: '0x8f2a1b9c3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    hash: '0x1c3e5a7b9d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c',
    tampered: false,
    transactions: [
      {
        txHash: '0xharv01',
        type: 'ORGAN_HARVEST',
        desc: 'Harvested ORG-KID-8041 (Kidney, Donor: DNR-DEL-9021, O+)',
        sender: 'Lilavati OPO',
        receiver: 'Cryo Container #8041',
        details: 'Brain death verified. Form 8 consent pinned to IPFS CID: QmZ9...v31'
      },
      {
        txHash: '0xharv02',
        type: 'ISCHEMIA_CLOCK_INIT',
        desc: 'Cold ischemia clock started: 24h max safe window',
        sender: 'Lilavati OPO',
        receiver: 'Ledger Monitor'
      }
    ]
  },
  {
    blockNumber: 2,
    timestamp: '2026-10-28 10:40:11 UTC',
    validator: 'AeroMed CryoTransit Node',
    validatorAddr: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    prevHash: '0x1c3e5a7b9d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c',
    hash: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    tampered: false,
    transactions: [
      {
        txHash: '0xtran01',
        type: 'CUSTODY_HANDOFF',
        desc: 'Custody transferred from Lilavati OPO to AeroMed Air Ambulance',
        sender: 'Lilavati OPO',
        receiver: 'AeroMed Transit',
        details: 'Green Corridor Air Ambulance Terminal 1D. Container sealed.'
      },
      {
        txHash: '0xtran02',
        type: 'THERMAL_ATTESTATION',
        desc: 'Cryo-storage temperature verified nominal at 2.4°C (Safe)',
        sender: 'AeroMed Transit',
        receiver: 'Ledger Monitor'
      }
    ]
  },
  {
    blockNumber: 3,
    timestamp: '2026-10-28 12:05:45 UTC',
    validator: 'NOTTO Central Directorate',
    validatorAddr: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    prevHash: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    hash: '0x4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e',
    tampered: false,
    transactions: [
      {
        txHash: '0xalloc01',
        type: 'RECIPIENT_ALLOCATION',
        desc: 'Cleared matching allocation to Recipient RCP-4109 at Apollo Hospital',
        sender: 'NOTTO Allocation Engine',
        receiver: 'Apollo Hospitals',
        details: '6/6 HLA compatibility match confirmed by algorithmic waitlist queue.'
      }
    ]
  }
];

export default function BlockVisualizerPage() {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [activeTab, setActiveTab] = useState('chain'); // 'chain' | 'mint' | 'network' | 'guide'
  const [highlightHash, setHighlightHash] = useState(null);
  const [tamperedBlockIndex, setTamperedBlockIndex] = useState(null);

  // Minting Simulator State
  const [mempoolTx] = useState([
    {
      id: 'tx-pending-1',
      type: 'CUSTODY_HANDOFF',
      title: 'Handover ORG-KID-8041 to Apollo Transplant OR Suite #3',
      sender: 'AeroMed Air Transit',
      receiver: 'Apollo Hospitals',
      gasEstimate: '0.00 Gwei (PoA Free)',
      details: 'Container seal verified intact at hospital receiving dock.'
    },
    {
      id: 'tx-pending-2',
      type: 'SURGICAL_PREP',
      title: 'Pre-Op Surgical Crossmatch Verified Negative for Recipient RCP-4109',
      sender: 'Apollo Surgical Suite',
      receiver: 'Transplant Board',
      gasEstimate: '0.00 Gwei (PoA Free)',
      details: 'Recipient anesthetized. Primary transplant surgeon Dr. S. Rao ready.'
    },
    {
      id: 'tx-pending-3',
      type: 'ISCHEMIA_WINDOW_CHECK',
      title: 'Ischemia Window Confirmed Nominal: 19.2h Safe Time Remaining',
      sender: 'Ledger Audit Daemon',
      receiver: 'NOTTO Directorate',
      gasEstimate: '0.00 Gwei (PoA Free)',
      details: 'Current temperature 2.8°C. Safe threshold respected.'
    }
  ]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState(0); // 0: Idle, 1: Bundling, 2: Merkle, 3: Signatures, 4: Chaining

  // Consensus Validators
  const CONSENSUS_NODES = [
    {
      name: 'Lilavati Hospital OPO',
      role: 'Harvesting Node',
      icon: HeartHandshake,
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      status: 'ONLINE',
      color: '#ef4444'
    },
    {
      name: 'AeroMed Transit',
      role: 'Cold-Chain Carrier',
      icon: Truck,
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      status: 'ONLINE',
      color: '#3b82f6'
    },
    {
      name: 'NOTTO Directorate',
      role: 'National Regulatory Authority',
      icon: FileCheck,
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      status: 'ONLINE',
      color: '#10b981'
    },
    {
      name: 'Apollo Hospital',
      role: 'Transplant Surgery Center',
      icon: Building2,
      address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      status: 'ONLINE',
      color: '#8b5cf6'
    }
  ];

  // Tamper simulation: mutate a block and recalculate subsequent invalidity
  const handleTamperBlock = async (blockIndex) => {
    const updated = [...blocks];
    const target = { ...updated[blockIndex] };

    // Falsify the transaction details inside target block
    target.tampered = true;
    target.transactions = target.transactions.map((t, i) => {
      if (i === 0) {
        return {
          ...t,
          desc: '⚠️ FORGED: Organ redirected to unauthorized private buyer (TAMPER BREACH)',
          receiver: '0xILLEGAL_BLACK_MARKET'
        };
      }
      return t;
    });

    // Recompute target block's hash using real SHA-256
    const rawData = JSON.stringify({
      num: target.blockNumber,
      prev: target.prevHash,
      txs: target.transactions,
      salt: 'TAMPERED_DATA'
    });
    target.hash = await sha256(rawData);
    updated[blockIndex] = target;

    // Mark all subsequent blocks as broken
    for (let i = blockIndex + 1; i < updated.length; i++) {
      updated[i] = {
        ...updated[i],
        isBroken: true
      };
    }

    setBlocks(updated);
    setTamperedBlockIndex(blockIndex);
  };

  // Restore blockchain integrity
  const handleRestoreLedger = () => {
    setBlocks(INITIAL_BLOCKS);
    setTamperedBlockIndex(null);
  };

  // Live Minting Simulator Execution
  const handleMintNewBlock = async () => {
    if (isMinting) return;
    setIsMinting(true);
    setMintStep(1);

    // Step 1: Bundling Mempool Transactions
    await new Promise(r => setTimeout(r, 700));
    setMintStep(2);

    // Step 2: Merkle Tree Calculation
    await new Promise(r => setTimeout(r, 700));
    setMintStep(3);

    // Step 3: PoA Multi-Signatures
    await new Promise(r => setTimeout(r, 800));
    setMintStep(4);

    // Step 4: Cryptographic Hashing & Chaining
    await new Promise(r => setTimeout(r, 700));

    const lastBlock = blocks[blocks.length - 1];
    const newBlockNumber = blocks.length;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    const newTransactions = mempoolTx.map((tx) => ({
      txHash: '0xmint' + Math.floor(1000 + Math.random() * 9000),
      type: tx.type,
      desc: tx.title,
      sender: tx.sender,
      receiver: tx.receiver,
      details: tx.details
    }));

    const rawBlockContent = JSON.stringify({
      num: newBlockNumber,
      prev: lastBlock.hash,
      txs: newTransactions,
      time: now
    });
    const newHash = await sha256(rawBlockContent);

    const newBlock = {
      blockNumber: newBlockNumber,
      timestamp: now,
      validator: 'Apollo Transplant Center (Consortium Node)',
      validatorAddr: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      prevHash: lastBlock.hash,
      hash: newHash,
      tampered: false,
      transactions: newTransactions
    };

    setBlocks(prev => [...prev, newBlock]);
    setIsMinting(false);
    setMintStep(0);
    setActiveTab('chain');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="p-3 max-w-[1240px] mx-auto space-y-3 font-sans">
      {/* ── 1. Page Header & Navigation Tabs ─────────────────────── */}
      <div className="swing-raised p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#0A246A] text-white font-mono font-bold text-[10px]">
              EVM POA PROTOCOL
            </span>
            <span className="text-gray-500 text-[10px] font-mono">
              ChainID: 31337 • Block Time: 2.0s • Zero-Gas Consortium
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#0A246A] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-700" />
            <span>Consortium Blockchain Visualizer & Block Chaining Architecture</span>
          </h1>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Visual explanation of how organ custody transactions are packaged, cryptographically hashed with SHA-256, and chained into an immutable decentralized ledger.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#ECE9D8] p-1 border border-[#808080] rounded-xs shrink-0">
          <button
            onClick={() => setActiveTab('chain')}
            className={`swing-btn text-[11px] py-1 px-2.5 flex items-center gap-1.5 ${
              activeTab === 'chain' ? 'swing-btn-active bg-[#DFDBD0] font-bold text-[#0A246A]' : ''
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-700" />
            <span>Block Chain [{blocks.length} Blocks]</span>
          </button>
          <button
            onClick={() => setActiveTab('mint')}
            className={`swing-btn text-[11px] py-1 px-2.5 flex items-center gap-1.5 ${
              activeTab === 'mint' ? 'swing-btn-active bg-[#DFDBD0] font-bold text-[#0A246A]' : ''
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Mint Next Block</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`swing-btn text-[11px] py-1 px-2.5 flex items-center gap-1.5 ${
              activeTab === 'network' ? 'swing-btn-active bg-[#DFDBD0] font-bold text-[#0A246A]' : ''
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-green-700" />
            <span>Validator Nodes (PoA)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`swing-btn text-[11px] py-1 px-2.5 flex items-center gap-1.5 ${
              activeTab === 'guide' ? 'swing-btn-active bg-[#DFDBD0] font-bold text-[#0A246A]' : ''
            }`}
          >
            <Info className="w-3.5 h-3.5 text-purple-700" />
            <span>How It Works</span>
          </button>
        </div>
      </div>

      {/* ── 2. Tamper Alert Banner (If simulated) ─────────────────── */}
      {tamperedBlockIndex !== null && (
        <div className="p-3 bg-red-100 border-2 border-red-600 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
            <div>
              <strong className="text-red-900 uppercase">
                Tamper Attack Simulated in Block #{tamperedBlockIndex}!
              </strong>
              <div className="text-[10px] text-red-800">
                Data was altered. SHA-256 hash changed avalanche style, causing cryptographic mismatch with Block #{tamperedBlockIndex + 1}'s previous hash. All downstream blocks are rejected by PoA consensus!
              </div>
            </div>
          </div>
          <button
            onClick={handleRestoreLedger}
            className="swing-btn swing-btn-primary text-[11px] py-1 px-3 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-green-700" />
            <span>Restore Blockchain Integrity</span>
          </button>
        </div>
      )}

      {/* ── 3. TAB 1: VISUAL BLOCK CHAIN EXPLORER ──────────────────── */}
      {activeTab === 'chain' && (
        <div className="space-y-3">
          <div className="bg-[#FAF8F5] p-2 border border-[#D4D0C8] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Ledger Visualizer Controls:</span>
              <span className="text-gray-500">
                Hover over any hash to see its cryptographic link to the next block. Try clicking <strong>"Simulate Data Tamper"</strong> on Block #1.
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                <span>Verified Chain</span>
              </span>
              <span className="flex items-center gap-1 ml-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                <span>Broken Link</span>
              </span>
            </div>
          </div>

          {/* Sequential Block Chain Visualization */}
          <div className="space-y-4">
            {blocks.map((block, idx) => {
              const isLast = idx === blocks.length - 1;
              const isTampered = block.tampered;
              const isBroken = block.isBroken;
              const nextBlock = blocks[idx + 1];

              // Is this block's hash matching the next block's prevHash?
              const isLinkValid = nextBlock ? nextBlock.prevHash.toLowerCase() === block.hash.toLowerCase() : true;

              return (
                <div key={block.blockNumber} className="relative">
                  {/* The Block Container */}
                  <div
                    className={`swing-raised p-3 transition-all ${
                      isTampered
                        ? 'border-2 border-red-600 bg-[#FFF5F5] shadow-lg shadow-red-200'
                        : isBroken
                        ? 'border-2 border-amber-600 bg-[#FFFBF0] opacity-85'
                        : 'bg-[#ECE9D8]'
                    }`}
                  >
                    {/* Top Block Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#808080] pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xs flex items-center justify-center font-mono font-bold text-xs ${
                            isTampered
                              ? 'bg-red-700 text-white'
                              : isBroken
                              ? 'bg-amber-700 text-white'
                              : 'bg-[#0A246A] text-white'
                          }`}
                        >
                          #{block.blockNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0A246A]">
                              BLOCK #{block.blockNumber.toString().padStart(3, '0')}
                            </span>
                            {block.blockNumber === 0 && (
                              <span className="px-1.5 py-0.2 bg-purple-700 text-white font-bold text-[9px] uppercase">
                                Genesis Block
                              </span>
                            )}
                            {isTampered && (
                              <span className="px-1.5 py-0.2 bg-red-600 text-white font-bold text-[9px] uppercase animate-pulse">
                                TAMPERED
                              </span>
                            )}
                            {isBroken && (
                              <span className="px-1.5 py-0.2 bg-amber-600 text-white font-bold text-[9px] uppercase">
                                CONSENSUS REJECTED
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Timestamp: {block.timestamp} • Mined by: <strong className="text-gray-800">{block.validator}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Tamper Button */}
                      <div className="flex items-center gap-2">
                        {block.blockNumber > 0 && !isTampered && !isBroken && (
                          <button
                            onClick={() => handleTamperBlock(idx)}
                            className="swing-btn swing-btn-danger text-[10px] py-1 px-2 flex items-center gap-1"
                            title="Simulate unauthorized tampering with transaction data inside this block"
                          >
                            <Unlock className="w-3 h-3 text-red-700" />
                            <span>Simulate Data Tamper</span>
                          </button>
                        )}
                        {isTampered && (
                          <button
                            onClick={handleRestoreLedger}
                            className="swing-btn swing-btn-primary text-[10px] py-1 px-2 flex items-center gap-1"
                          >
                            <Lock className="w-3 h-3 text-green-700" />
                            <span>Restore Integrity</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle Cryptographic Hash Ribbons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2 text-[11px] font-mono">
                      {/* Previous Hash */}
                      <div
                        onMouseEnter={() => setHighlightHash(block.prevHash)}
                        onMouseLeave={() => setHighlightHash(null)}
                        className={`swing-sunken p-2 transition-all ${
                          highlightHash === block.prevHash
                            ? 'bg-yellow-100 border-yellow-500'
                            : 'bg-white'
                        }`}
                      >
                        <div className="text-[9px] font-sans font-bold text-gray-500 uppercase flex items-center justify-between">
                          <span>Previous Block Hash (prevHash)</span>
                          {block.blockNumber === 0 && <span className="text-gray-400">0x0 (Root)</span>}
                        </div>
                        <div className="text-[11px] font-bold truncate text-gray-700 mt-0.5">
                          {block.prevHash}
                        </div>
                      </div>

                      {/* Current Hash */}
                      <div
                        onMouseEnter={() => setHighlightHash(block.hash)}
                        onMouseLeave={() => setHighlightHash(null)}
                        className={`swing-sunken p-2 transition-all ${
                          isTampered
                            ? 'bg-red-50 border-red-500 text-red-900'
                            : highlightHash === block.hash
                            ? 'bg-yellow-100 border-yellow-500'
                            : 'bg-white'
                        }`}
                      >
                        <div className="text-[9px] font-sans font-bold text-gray-500 uppercase flex items-center justify-between">
                          <span>Current Block SHA-256 Hash</span>
                          <span className="text-green-700 font-bold font-sans">
                            {isTampered ? 'FORGED HASH' : 'VERIFIED PROOF'}
                          </span>
                        </div>
                        <div className={`text-[11px] font-bold truncate mt-0.5 ${isTampered ? 'text-red-700' : 'text-[#0A246A]'}`}>
                          {block.hash}
                        </div>
                      </div>
                    </div>

                    {/* Transactions packaged inside this block */}
                    <div className="border border-[#D4D0C8] bg-white p-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-600 mb-1 border-b border-[#EAE8E0] pb-1">
                        <span>Packaged Transactions ({block.transactions.length})</span>
                        <span className="font-mono">Validator: {block.validatorAddr}</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        {block.transactions.map((tx, tIdx) => (
                          <div key={tIdx} className="p-1.5 bg-[#FAF8F5] border border-[#E0DFD8] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1 bg-blue-100 text-[#0A246A] border border-blue-200 text-[9px] font-mono font-bold">
                                  {tx.type}
                                </span>
                                <span className="font-bold text-gray-900">{tx.desc}</span>
                              </div>
                              {tx.details && (
                                <div className="text-[10px] text-gray-500 italic">
                                  "{tx.details}"
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 shrink-0">
                              {tx.sender} → {tx.receiver}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Link Cable / Connector between Block N and Block N+1 */}
                  {!isLast && (
                    <div className="flex flex-col items-center justify-center my-1 select-none">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#808080] rounded-xs shadow-xs text-[10px] font-mono">
                        {isLinkValid ? (
                          <>
                            <LinkIcon className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-800 font-bold">
                              prevHash Match verified: Current Block Hash == Next Block prevHash
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                            <span className="text-red-800 font-bold uppercase">
                              CRYPTOGRAPHIC LINK BROKEN! Hash mismatch rejected by PoA Consensus
                            </span>
                          </>
                        )}
                      </div>
                      <div className={`w-0.5 h-4 ${isLinkValid ? 'bg-green-600' : 'bg-red-600 animate-pulse'}`}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. TAB 2: LIVE BLOCK MINTING SIMULATOR ─────────────────── */}
      {activeTab === 'mint' && (
        <div className="space-y-3">
          <div className="swing-raised p-3">
            <h2 className="text-sm font-bold text-[#0A246A] flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Interactive PoA Block Minting & Transaction Packaging Simulator</span>
            </h2>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              In traditional public blockchains like Bitcoin, blocks require high-energy Proof-of-Work mining. In LifeLedger's healthcare consortium, blocks are minted instantly via <strong>Proof-of-Authority (PoA)</strong>: authorized hospital and regulatory nodes cryptographically sign off on the batch with zero transaction fees and guaranteed 2-second finality.
            </p>

            {/* Minting Progress Stepper */}
            {isMinting && (
              <div className="my-3 p-3 bg-white border-2 border-[#0A246A] space-y-2">
                <div className="text-[11px] font-bold text-[#0A246A] flex items-center justify-between">
                  <span>MINTING BLOCK #{blocks.length} IN PROGRESS...</span>
                  <span className="font-mono">STAGE {mintStep} / 4</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-xs overflow-hidden">
                  <div
                    className="bg-[#0A246A] h-full transition-all duration-300"
                    style={{ width: `${(mintStep / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[11px] font-mono text-gray-700">
                  {mintStep === 1 && "▶ 1/4: Collecting pending transactions from consortium Mempool..."}
                  {mintStep === 2 && "▶ 2/4: Computing Merkle Tree root hash of organ transit logs..."}
                  {mintStep === 3 && "▶ 3/4: Collecting multi-party PoA validator digital signatures (Lilavati, NOTTO, Apollo)..."}
                  {mintStep === 4 && "▶ 4/4: Generating SHA-256 block hash and appending link to previous block..."}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-3 pt-2 border-t border-[#808080] flex items-center justify-between">
              <div className="text-[11px] text-gray-600">
                Mempool: <strong>{mempoolTx.length} Verified Transactions</strong> ready to bundle
              </div>
              <button
                onClick={handleMintNewBlock}
                disabled={isMinting || mempoolTx.length === 0}
                className="swing-btn swing-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-green-700" />
                <span>{isMinting ? "Minting in Progress..." : `Mint Block #${blocks.length} (PoA Consensus)`}</span>
              </button>
            </div>
          </div>

          {/* Pending Mempool Transactions */}
          <fieldset className="swing-etched bg-[#ECE9D8] p-3">
            <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8]">
              Pending Consortium Transactions (Mempool Queue)
            </legend>
            <div className="space-y-2 pt-1">
              {mempoolTx.map((tx) => (
                <div key={tx.id} className="p-2.5 bg-white border border-[#808080] flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[9px]">
                        PENDING
                      </span>
                      <span className="font-bold text-gray-900">{tx.title}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      Sender: {tx.sender} → Target: {tx.receiver} | Gas: {tx.gasEstimate}
                    </div>
                    <div className="text-[10px] text-gray-600 italic">
                      "{tx.details}"
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] text-green-700 font-bold">PoA Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* ── 5. TAB 3: VALIDATOR NODES & POA CONSENSUS ──────────────── */}
      {activeTab === 'network' && (
        <div className="space-y-3">
          <div className="swing-raised p-3">
            <h2 className="text-sm font-bold text-[#0A246A] flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-green-700" />
              <span>Consortium Validator Node Topology (Proof-of-Authority Network)</span>
            </h2>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Unlike anonymous public networks, every node on the LifeLedger network is a legally registered healthcare institution authorized by NOTTO under the Transplantation of Human Organs and Tissues Act (THOTA). Nodes maintain peer-to-peer connections and sign blocks using their private keys.
            </p>
          </div>

          {/* Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {CONSENSUS_NODES.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={i} className="swing-raised p-3 space-y-2 bg-white">
                  <div className="flex items-start justify-between border-b border-[#D4D0C8] pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: node.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900">{node.name}</div>
                        <div className="text-[10px] text-gray-500">{node.role}</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.2 bg-green-100 text-green-800 border border-green-300 font-mono font-bold text-[9px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                      <span>{node.status}</span>
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Validator Public Key:</span>
                      <span className="font-mono text-gray-800 text-[10px]">{node.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Consensus Weight:</span>
                      <span className="font-mono font-bold text-[#0A246A]">25.0% (1 of 4 Signers)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Peer Latency:</span>
                      <span className="font-mono text-green-700">~14ms (P2P Gossip Nominal)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 6. TAB 4: EDUCATIONAL ARCHITECTURE GUIDE ───────────────── */}
      {activeTab === 'guide' && (
        <div className="swing-raised p-4 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#0A246A] flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-purple-700" />
              <span>How Blockchain Guarantees Organ Safety & Tamper-Proof Custody</span>
            </h2>
            <p className="text-[11px] text-gray-600">
              Fundamental principles of cryptographic ledgers applied to human organ donation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="swing-panel-sunken p-3 space-y-1.5 bg-white">
              <div className="font-bold text-xs text-[#0A246A] flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-blue-700" />
                <span>1. The Cryptographic Hash Chain</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Each block stores the SHA-256 hash of the block before it (<code className="font-mono text-[#0A246A]">prevHash</code>). This forms an unbroken mathematical chain. If anyone tampers with a single character in Block #1, its hash changes completely (the avalanche effect). Because Block #2 stores Block #1's old hash, the cryptographic link breaks instantly.
              </p>
            </div>

            <div className="swing-panel-sunken p-3 space-y-1.5 bg-white">
              <div className="font-bold text-xs text-[#0A246A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-700" />
                <span>2. Proof-of-Authority (PoA) Consensus</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Unlike public cryptocurrencies that waste massive electricity on mining, LifeLedger runs on Proof-of-Authority. Only verified hospitals, procurement agencies, and government directorates are granted private keys to sign transactions. This ensures zero transaction fees and 100% legal compliance with organ transplant regulations.
              </p>
            </div>

            <div className="swing-panel-sunken p-3 space-y-1.5 bg-white">
              <div className="font-bold text-xs text-[#0A246A] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-700" />
                <span>3. Real-Time Cold Ischemia Tracking</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Human organs have strict ischemic preservation limits (e.g., hearts: 4-6 hours, kidneys: 24 hours). The smart contract automatically verifies timestamps upon every custody handoff. If an organ exceeds its permissible ischemic limit, the smart contract automatically prevents surgical sign-off and flags the case.
              </p>
            </div>

            <div className="swing-panel-sunken p-3 space-y-1.5 bg-white">
              <div className="font-bold text-xs text-[#0A246A] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-red-700" />
                <span>4. Anti-Trafficking Emergency Quarantine</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                If an observer flags an illegal commercial organ sale or thermal excursion, authorized regulatory directorates can execute an emergency quarantine transaction. Once quarantined on-chain, all downstream hospital nodes are locked from implanting the organ.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}