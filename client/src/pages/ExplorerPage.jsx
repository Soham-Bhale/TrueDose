import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldCheck, Database, Check, RefreshCw,
  Boxes, Server, Lock, Cpu, Globe, ArrowRight, ShieldAlert
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
    <div className="p-3 max-w-[1300px] mx-auto space-y-3 font-sans">
      {/* 1. Header Toolbar */}
      <div className="swing-raised p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="text-[12px] font-bold text-[#0A246A] flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-[#0A246A]" />
            <span>Consortium Distributed EVM Ledger & Node Monitor</span>
          </div>
          <div className="text-[10px] text-gray-500">
            Real-time cryptographic audit trail of organ custody handoffs, ischemic time invariants, and PoA validator consensus
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="swing-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger (F5)</span>
        </button>
      </div>

      {/* 2. Top Stats Panes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className="swing-panel-sunken p-2">
          <div className="text-[10px] uppercase font-bold text-gray-600">Smart Contract Address</div>
          <div className="font-mono font-bold text-[#0A246A] text-[11px] truncate">
            {stats?.network?.smartContractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
          </div>
          <div className="text-[9px] text-gray-500">LifeLedger.sol (Paris EVM)</div>
        </div>
        <div className="swing-panel-sunken p-2">
          <div className="text-[10px] uppercase font-bold text-gray-600">Consortium Network</div>
          <div className="font-mono font-bold text-blue-800 text-[11px]">
            {stats?.network?.networkName || "Hardhat / Local EVM"} (ID: {stats?.network?.chainId || 1337})
          </div>
          <div className="text-[9px] text-green-700 font-bold">PoA Consensus: Active</div>
        </div>
        <div className="swing-panel-sunken p-2">
          <div className="text-[10px] uppercase font-bold text-gray-600">Validated Organs</div>
          <div className="font-mono font-bold text-green-800 text-lg">
            {stats?.organs?.total || stats?.batches?.total || 5}
          </div>
          <div className="text-[9px] text-gray-500">Cryptographically Signed</div>
        </div>
        <div className="swing-panel-sunken p-2">
          <div className="text-[10px] uppercase font-bold text-gray-600">Active Alert Cases</div>
          <div className="font-mono font-bold text-red-800 text-lg">
            {stats?.investigations?.length || 2}
          </div>
          <div className="text-[9px] text-red-600">Trafficking / Excursions</div>
        </div>
      </div>

      {/* 3. Approved Consortium Stakeholder Nodes (JTable) */}
      <fieldset className="swing-etched bg-[#ECE9D8] p-2">
        <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8]">
          Approved Medical Stakeholder Nodes (PoA Authority Validators)
        </legend>

        <div className="swing-sunken overflow-x-auto max-h-[300px]">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="swing-th">Stakeholder Organization</th>
                <th className="swing-th">Transplant Role</th>
                <th className="swing-th">Operating Facility</th>
                <th className="swing-th">Consortium Ethereum Address</th>
                <th className="swing-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, idx) => (
                <tr
                  key={p.id || idx}
                  className={`border-b border-[#E0DFD8] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F8F5]'}`}
                >
                  <td className="p-2 font-bold text-black">{p.name}</td>
                  <td className="p-2 uppercase font-mono font-bold text-blue-900">{p.role}</td>
                  <td className="p-2 text-gray-600">{p.location}</td>
                  <td className="p-2 font-mono text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <span>{p.ethAddress}</span>
                      <button
                        onClick={() => handleCopy(p.ethAddress, p.id)}
                        className="swing-btn text-[9px] py-0 px-1"
                      >
                        {copiedKey === p.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.5 bg-green-100 border border-green-400 text-green-900 font-mono font-bold text-[10px]">
                      VALIDATOR ONLINE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* 4. Recent Cryptographic Verifications Log */}
      <fieldset className="swing-etched bg-[#ECE9D8] p-2">
        <legend className="px-1.5 font-bold text-[11px] text-[#0A246A] bg-[#ECE9D8]">
          Recent Cryptographic Verification Queries & Telemetry Pings
        </legend>

        <div className="swing-sunken overflow-x-auto max-h-[220px]">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="swing-th">Verification ID</th>
                <th className="swing-th">Organ Record</th>
                <th className="swing-th">Timestamp</th>
                <th className="swing-th">Query Terminal / Device</th>
                <th className="swing-th">Consortium Result</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentVerifications?.map((v, i) => (
                <tr key={v.id || i} className={`border-b border-[#E0DFD8] ${i % 2 === 0 ? 'bg-white' : 'bg-[#F9F8F5]'}`}>
                  <td className="p-2 font-mono text-gray-600">{v.id}</td>
                  <td className="p-2 font-mono font-bold text-[#0A246A]">{v.organId || v.batchId}</td>
                  <td className="p-2 text-gray-600 font-mono">{new Date(v.timestamp).toLocaleString()}</td>
                  <td className="p-2 text-gray-500 text-[10px] truncate max-w-[200px]">{v.device}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 font-mono font-bold text-[10px] border ${
                      v.result === 'GENUINE_AUTHENTIC'
                        ? 'bg-green-100 text-green-900 border-green-300'
                        : 'bg-red-100 text-red-900 border-red-300'
                    }`}>
                      {v.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
    </div>
  );
}
