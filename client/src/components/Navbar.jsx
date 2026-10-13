import React, { useState, useRef, useEffect } from 'react';
import {
  Pill, Search, LayoutDashboard, Boxes, GraduationCap,
  ChevronDown, Check, Factory, Truck, Warehouse, Store, ShieldAlert,
  UserCheck
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

  // Close dropdown when clicking outside
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
    { id: 'verify',    label: 'Verify Medicine',     icon: Search },
    { id: 'dashboard', label: 'Supply Chain Portal', icon: LayoutDashboard },
    { id: 'explorer',  label: 'Ledger Explorer',     icon: Boxes },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <button
            onClick={() => setActivePage('verify')}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <Pill className="w-4 h-4 text-white -rotate-45" />
            </div>
            <span className="font-bold text-base text-slate-900">
              True<span className="text-teal-700">Dose</span>
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activePage === id
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {id === 'dashboard' && investigationCount > 0 && (
                  <span className="ml-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {investigationCount}
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={onOpenGuide}
              className="ml-1 px-3 py-1.5 rounded-md text-sm font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Defense Guide
            </button>
          </nav>

          {/* Role Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center">
                <CurrentRoleIcon className="w-3.5 h-3.5 text-teal-700" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-none">Role</div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  {currentUser.badge}
                  {currentUser.role === 'admin' && investigationCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                  )}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Switch Role</span>
                  <span className="text-[10px] text-teal-700 font-mono">Live Simulation</span>
                </div>
                {demoUsers.map((u) => {
                  const Icon = ROLE_ICONS[u.role] || Factory;
                  const active = currentUser.role === u.role;
                  return (
                    <button
                      key={u.role}
                      onClick={() => {
                        switchRole(u.role);
                        if (u.role === 'customer') {
                          setActivePage('verify');
                        } else {
                          setActivePage('dashboard');
                        }
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                        active ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${
                        active ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {u.badge}
                          {u.role === 'admin' && investigationCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold">{investigationCount}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{u.name}</div>
                      </div>
                      {active && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-slate-100 px-2 pb-1 justify-around">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded text-xs font-medium ${
              activePage === id ? 'text-teal-700' : 'text-slate-500'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={onOpenGuide}
          className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded text-xs font-medium text-amber-600"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Guide</span>
        </button>
      </div>
    </header>
  );
}
