import React, { useState, useRef, useEffect } from 'react';
import {
  Pill, ShieldCheck, Search, LayoutDashboard, Boxes, GraduationCap,
  ChevronDown, Check, Factory, Truck, Warehouse, Store, ShieldAlert,
  UserCheck, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_ICONS = {
  manufacturer: Factory,
  distributor: Truck,
  wholesaler: Warehouse,
  pharmacy: Store,
  admin: ShieldAlert,
  customer: UserCheck
};

export default function Navbar({ activePage, setActivePage, onOpenGuide }) {
  const { currentUser, switchRole, demoUsers, investigationCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const CurrentRoleIcon = ROLE_ICONS[currentUser.role] || Factory;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActivePage('verify')}
          >
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Pill className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  True<span className="text-teal-700">Dose</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200/80 rounded">
                  EVM Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                Pharmaceutical Chain-of-Custody & Verification
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActivePage('verify')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activePage === 'verify'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-teal-700" />
              <span>Verify Medicine</span>
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activePage === 'dashboard'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-700" />
              <span>Supply Chain Portal</span>
              {investigationCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-bold font-mono">
                  {investigationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePage('explorer')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activePage === 'explorer'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-teal-700" />
              <span>Ledger Explorer</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 ml-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Defense Guide</span>
            </button>
          </nav>

          {/* Role Switcher Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition text-left shadow-2xs"
            >
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-2xs">
                <CurrentRoleIcon className="w-4 h-4" />
              </div>
              <div className="text-left pr-1">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Active Role</div>
                <div className="font-semibold text-xs text-slate-800 flex items-center gap-1">
                  <span>{currentUser.badge}</span>
                  {currentUser.role === 'admin' && investigationCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-3.5 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Simulated Supply Chain Roles</span>
                  <span className="text-teal-700 font-mono font-medium">PoA Consortium</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {demoUsers.map((u) => {
                    const isSelected = currentUser.role === u.role;
                    const ItemIcon = ROLE_ICONS[u.role] || Factory;

                    return (
                      <button
                        key={u.role}
                        onClick={() => {
                          switchRole(u.role);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          isSelected ? 'bg-teal-50/70 text-teal-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-white text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.badge}</span>
                              {u.role === 'admin' && investigationCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">
                                  {investigationCount} Alerts
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{u.name}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex border-t border-slate-200 bg-white px-2 py-1 justify-around text-xs">
        <button
          onClick={() => setActivePage('verify')}
          className={`py-1.5 px-2 rounded font-medium flex items-center gap-1 ${activePage === 'verify' ? 'text-teal-700 font-semibold' : 'text-slate-600'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Verify</span>
        </button>
        <button
          onClick={() => setActivePage('dashboard')}
          className={`py-1.5 px-2 rounded font-medium flex items-center gap-1 ${activePage === 'dashboard' ? 'text-teal-700 font-semibold' : 'text-slate-600'}`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Portal</span>
          {investigationCount > 0 && (
            <span className="text-rose-700 text-[10px] font-bold">({investigationCount})</span>
          )}
        </button>
        <button
          onClick={() => setActivePage('explorer')}
          className={`py-1.5 px-2 rounded font-medium flex items-center gap-1 ${activePage === 'explorer' ? 'text-teal-700 font-semibold' : 'text-slate-600'}`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Ledger</span>
        </button>
        <button
          onClick={onOpenGuide}
          className="py-1.5 px-2 text-slate-700 rounded font-medium flex items-center gap-1"
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
          <span>Guide</span>
        </button>
      </div>
    </header>
  );
}
