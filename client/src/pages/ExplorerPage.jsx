import React, { useState, useEffect } from 'react';
import { Boxes, RefreshCw } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Consortium Distributed EVM Ledger & Node Monitor</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cryptographic audit trail of organ custody handoffs, ischemic time invariants, and PoA validator consensus
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>Refresh Ledger (F5)</span>
        </button>
      </div>

      {/* 2. Top Stats Panes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Smart Contract Address</div>
          <div className="font-mono font-bold text-blue-700 text-xs truncate">
            {stats?.network?.smartContractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
          </div>
          <div className="text-[11px] text-slate-400">LifeLedger.sol (Paris EVM)</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Consortium Network</div>
          <div className="font-mono font-bold text-slate-900 text-xs">
            {stats?.network?.networkName || "Hardhat / Local EVM"} (ID: {stats?.network?.chainId || 1337})
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>PoA Consensus: Active</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Validated Organs</div>
          <div className="font-mono font-bold text-emerald-600 text-2xl">
            {stats?.organs?.total || stats?.batches?.total || 5}
          </div>
          <div className="text-[11px] text-slate-400">Cryptographically Signed</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Active Alert Cases</div>
          <div className="font-mono font-bold text-red-600 text-2xl">
            {stats?.investigations?.length || 2}
          </div>
          <div className="text-[11px] text-red-500">Trafficking / Excursions</div>
        </div>
      </div>

      {/* 3. Approved Consortium Stakeholder Nodes (Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Approved Medical Stakeholder Nodes (PoA Authority Validators)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {participants.length} Active Validators
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <th className="px-4 py-3">Stakeholder Organization</th>
                <th className="px-4 py-3">Transplant Role</th>
                <th className="px-4 py-3">Operating Facility</th>
                <th className="px-4 py-3">Consortium Ethereum Address</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map((p, idx) => (
                <tr
                  key={p.id || idx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-4 py-3.5">
                    <span className="uppercase font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{p.location}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-600">{p.ethAddress}</span>
                      <button
                        onClick={() => handleCopy(p.ethAddress, p.id)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedKey === p.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-semibold text-[11px] rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ONLINE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Recent Cryptographic Verifications Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Recent Cryptographic Verification Queries & Telemetry Pings
          </h3>
          <span className="text-xs text-slate-500 font-mono">Audit Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <th className="px-4 py-3">Verification ID</th>
                <th className="px-4 py-3">Organ Record</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Query Terminal / Device</th>
                <th className="px-4 py-3">Consortium Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentVerifications?.map((v, i) => (
                <tr key={v.id || i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">{v.id}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-700">{v.organId || v.batchId}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">{new Date(v.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-[11px] truncate max-w-[200px]">{v.device}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 font-mono font-semibold text-[11px] rounded-full border ${
                      v.result === 'GENUINE_AUTHENTIC'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {v.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
