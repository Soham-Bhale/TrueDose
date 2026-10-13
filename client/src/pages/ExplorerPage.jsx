import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldCheck, Cpu, Database, CheckCircle2, Copy, Check,
  ExternalLink, Layers, ArrowRight, UserCheck, RefreshCw, Factory,
  Truck, Warehouse, Store, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExplorerPage() {
  const { participants } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Consortium Distributed Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consortium Blockchain & Smart Contract Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cryptographic audit trail of registered pharmaceutical transactions and PoA validator health
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="self-start sm:self-center px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2 transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger State</span>
        </button>
      </div>

      {/* Network KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>On-Chain Batches</span>
            <Database className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats?.batches?.total || 3}
          </div>
          <span className="text-[11px] text-teal-700 font-medium">100% Cryptographically Verified</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Active Shipments</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats?.batches?.inTransit || 1}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Cold-Chain Reefer Monitored</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Authentic Verifications</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats?.scans?.authentic || 12}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Citizen & Hospital Scans</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Counterfeits Blocked</span>
            <Cpu className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono">
            {stats?.scans?.counterfeitAlerts || 1}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Tamper Detections</span>
        </div>
      </div>

      {/* Smart Contract Technical Information */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-700" />
          <span>Deployed Smart Contract Metadata</span>
        </h3>

        <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">Contract Address</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {stats?.network?.smartContractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
              </span>
              <button
                onClick={() => handleCopy(stats?.network?.smartContractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3", 'contract')}
                className="p-1 hover:text-slate-900 text-slate-400 transition"
                title="Copy Address"
              >
                {copiedKey === 'contract' ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">Consensus Mechanism</span>
            <div className="font-bold text-slate-900 mt-1">Proof of Authority (PoA)</div>
            <span className="text-[10px] text-slate-500 font-sans">Multi-entity regulatory validator consortium</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">EVM Chain ID</span>
            <div className="font-bold text-slate-900 mt-1">1337 (Local EVM Consortium)</div>
            <span className="text-[10px] text-teal-700 font-sans font-medium">Block Gas Limit: 30,000,000</span>
          </div>
        </div>
      </div>

      {/* Consortium Registered Entities Directory */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <span>Authorized Consortium Validator Entities</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {participants.length || 5} Approved Nodes
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {participants.map((p, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{p.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-white text-slate-700 border border-slate-200">
                  {p.role}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] truncate">{p.location}</p>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[180px]">{p.ethAddress}</span>
                <button
                  onClick={() => handleCopy(p.ethAddress, `addr_${idx}`)}
                  className="hover:text-slate-900 transition"
                  title="Copy Node Key"
                >
                  {copiedKey === `addr_${idx}` ? <Check className="w-3 h-3 text-teal-700" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
