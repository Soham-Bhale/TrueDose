import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert, Search, LayoutDashboard, Boxes, GraduationCap,
  ChevronDown, Check, Truck, Building2, UserCheck,
  Plus, FileCheck, HeartHandshake, AlertTriangle,
  Zap, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_ICONS = {
  admin: ShieldAlert,
  opo: HeartHandshake,
  logistics: Truck,
  authority: FileCheck,
  hospital: Building2,
  customer: UserCheck,
  // aliases
  manufacturer: HeartHandshake,
  distributor: Truck,
  wholesaler: FileCheck,
  pharmacy: Building2
};

export default function Navbar({ activePage, setActivePage, onOpenGuide, onHarvestClick, onOpenWheel }) {
  const { currentUser, switchRole, demoUsers, investigationCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const CurrentRoleIcon = ROLE_ICONS[currentUser.role] || HeartHandshake;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard',  label: 'Custody Portal',         icon: LayoutDashboard, shortcut: 'F2' },
    { id: 'verify',     label: 'Verify Provenance',      icon: Search,          shortcut: 'F3' },
    { id: 'explorer',   label: 'Consortium EVM Ledger',  icon: Boxes,           shortcut: 'F4' },
    { id: 'visualizer', label: 'Visual Block Chain',     icon: LinkIcon,        shortcut: 'F5' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 select-none shadow-xs sticky top-0 z-40">
      {/* 1. Modern Top Brand & Consortium Status Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white text-base shadow-sm">
              🫀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  LifeLedger
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono">
                  v2.4 PoA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5 hidden sm:block">
                Decentralized Organ Procurement & Chain-of-Custody Network
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Consortium Online</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ChainID: 31337
            </span>
          </div>
        </div>

        {/* Right side: Alerts & Active Stakeholder Node Selector */}
        <div className="flex items-center gap-3">
          {investigationCount > 0 && (
            <button
              onClick={() => {
                switchRole('admin');
                setActivePage('dashboard');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-100 transition-colors animate-pulse"
              title="View Active Investigations in Directorate"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{investigationCount} Active Alert{investigationCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* Stakeholder Node Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all text-left shadow-2xs"
            >
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CurrentRoleIcon className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold leading-tight text-slate-900">{currentUser.badge}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[130px] leading-none">{currentUser.name}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs py-1 animate-fadeIn">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider">
                    Switch Stakeholder Node
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">PoA Network</span>
                </div>
                <div className="p-1 space-y-0.5">
                  {demoUsers.map((u) => {
                    const Icon = ROLE_ICONS[u.role] || HeartHandshake;
                    const isSelected = currentUser.role === u.role;
                    return (
                      <button
                        key={u.role}
                        onClick={() => {
                          switchRole(u.role);
                          if (u.role === 'customer') setActivePage('verify');
                          else setActivePage('dashboard');
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs">{u.badge}</div>
                            <div className="text-[11px] text-slate-500">{u.name}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Modern Navigation Tabs & Quick Action Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <ItemIcon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                  [{item.shortcut}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Action Toolbar Buttons (Seamlessly Integrated) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActivePage('dashboard');
              if (onHarvestClick) onHarvestClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            title="Procure & Harvest Donor Organ (Ctrl+H)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Harvest Organ</span>
          </button>

          {/* Radial Action Wheel Launcher (Seamlessly integrated into navbar) */}
          <button
            onClick={() => onOpenWheel && onOpenWheel()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs shadow-xs transition-all cursor-pointer border border-slate-700"
            title="Open Quick Command Radial Wheel (Shortcut: Press Tab or Q)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Action Wheel [Tab]</span>
          </button>

          <button
            onClick={() => onOpenGuide()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs shadow-2xs transition-all cursor-pointer"
            title="Transplant System Defense Guide (F1)"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
            <span>Guide [F1]</span>
          </button>
        </div>
      </div>
    </header>
  );
}
