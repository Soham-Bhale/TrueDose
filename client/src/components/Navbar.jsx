import React from 'react';
import { Pill, Shield, ShieldCheck, Box, Activity, GraduationCap, ChevronDown, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, onOpenGuide }) {
  const { currentUser, switchRole, demoUsers, investigationCount } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActivePage('verify')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Pill className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">True<span className="text-emerald-400">Dose</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  EVM Blockchain
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Pharma Provenance & Verification</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActivePage('verify')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activePage === 'verify'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              🔍 Verify Medicine (Public)
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activePage === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>📊 Supply Chain Portal</span>
              {investigationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold font-mono animate-pulse">
                  🚨 {investigationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePage('explorer')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activePage === 'explorer'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              ⛓️ Blockchain Explorer
            </button>

            <button
              onClick={onOpenGuide}
              className="px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Viva Guide</span>
            </button>
          </nav>

          {/* Role Switcher Pill */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition text-left shadow-sm">
                <span className="text-base">{currentUser.icon || "👨‍💼"}</span>
                <div className="text-xs">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Active Role:</div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{currentUser.badge}</span>
                    {currentUser.role === 'admin' && investigationCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex items-center justify-between">
                  <span>Switch Role (Live Simulation)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Instant Mode</span>
                </div>
                {demoUsers.map((u) => {
                  const isSelected = currentUser.role === u.role;
                  return (
                    <button
                      key={u.role}
                      onClick={() => switchRole(u.role)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-750 transition ${
                        isSelected ? 'bg-slate-700/60 text-emerald-400 font-semibold' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg mt-0.5">{u.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{u.badge}</span>
                            {u.role === 'admin' && investigationCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-red-500 text-white text-[9px] font-black">
                                {investigationCount} ALERTS
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[190px]">{u.name}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900 px-2 py-1 justify-around text-xs">
        <button
          onClick={() => setActivePage('verify')}
          className={`py-1.5 px-2 rounded font-medium ${activePage === 'verify' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          🔍 Verify
        </button>
        <button
          onClick={() => setActivePage('dashboard')}
          className={`py-1.5 px-2 rounded font-medium flex items-center gap-1 ${activePage === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          📊 Portal {investigationCount > 0 && <span className="text-red-400 text-[10px] font-bold">({investigationCount})</span>}
        </button>
        <button
          onClick={() => setActivePage('explorer')}
          className={`py-1.5 px-2 rounded font-medium ${activePage === 'explorer' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          ⛓️ Explorer
        </button>
        <button
          onClick={onOpenGuide}
          className="py-1.5 px-2 text-amber-400 rounded font-medium flex items-center gap-1"
        >
          <GraduationCap className="w-3.5 h-3.5" /> Guide
        </button>
      </div>
    </header>
  );
}
