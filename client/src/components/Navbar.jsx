import React, { useState, useRef, useEffect } from 'react';
import {
  Heart, ShieldAlert, Search, LayoutDashboard, Boxes, GraduationCap,
  ChevronDown, Check, Truck, Building2, UserCheck, RefreshCw,
  Plus, Shield, Activity, FileCheck, HeartHandshake, AlertTriangle
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

export default function Navbar({ activePage, setActivePage, onOpenGuide, onHarvestClick }) {
  const { currentUser, switchRole, demoUsers, investigationCount, refreshStats } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const dropdownRef = useRef(null);
  const menuBarRef = useRef(null);

  const CurrentRoleIcon = ROLE_ICONS[currentUser.role] || HeartHandshake;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Procurement & Custody Portal', shortcut: 'F2' },
    { id: 'verify',    label: 'Organ Verification Inspector', shortcut: 'F3' },
    { id: 'explorer',  label: 'Consortium EVM Ledger',        shortcut: 'F4' },
  ];

  return (
    <header className="bg-[#ECE9D8] select-none border-b-2 border-[#808080]">
      {/* 1. Classic Java Swing Title Bar */}
      <div className="swing-titlebar">
        <div className="flex items-center gap-2">
          {/* Java Coffee Cup / Medical Heart Icon */}
          <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center text-white font-bold text-[10px] shadow-inner">
            🫀
          </div>
          <span className="tracking-wide">
            LifeLedger — Organ Procurement & Chain-of-Custody Workstation v2.4.2 [EVM PoA Consortium]
          </span>
        </div>

        {/* Java Window Control Buttons [_] [口] [X] */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => alert("Java Workstation: Window Minimized to Medical Taskbar.")}
            className="w-4 h-3.5 bg-[#ECE9D8] text-black font-bold text-[9px] flex items-center justify-center border-t border-l border-white border-b border-r border-[#808080] hover:bg-white active:border-t-[#808080] active:border-l-[#808080]"
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={() => alert("Java Workstation: Running in Full Medical Display Mode.")}
            className="w-4 h-3.5 bg-[#ECE9D8] text-black font-bold text-[9px] flex items-center justify-center border-t border-l border-white border-b border-r border-[#808080] hover:bg-white active:border-t-[#808080] active:border-l-[#808080]"
            title="Maximize"
          >
            □
          </button>
          <button
            onClick={() => {
              if (window.confirm("Exit LifeLedger Workstation session?")) {
                window.location.reload();
              }
            }}
            className="w-4 h-3.5 bg-[#ECE9D8] hover:bg-red-600 hover:text-white text-black font-bold text-[9px] flex items-center justify-center border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080]"
            title="Close Application"
          >
            ×
          </button>
        </div>
      </div>

      {/* 2. Classic Java JMenuBar */}
      <div className="bg-[#ECE9D8] border-b border-[#808080] px-1 py-0.5 flex items-center text-[11px] relative" ref={menuBarRef}>
        <div className="flex items-center gap-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-0.5 text-black hover:bg-[#0A246A] hover:text-white ${activeMenu === 'file' ? 'bg-[#0A246A] text-white' : ''}`}
            >
              <u>F</u>ile
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-md z-50 text-[11px] py-1">
                <button
                  onClick={() => { setActivePage('dashboard'); setActiveMenu(null); if (onHarvestClick) onHarvestClick(); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>Harvest Organ Record...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+H</span>
                </button>
                <button
                  onClick={() => { setActivePage('verify'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>Verify Organ Barcode...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+V</span>
                </button>
                <div className="my-1 border-t border-[#808080] border-b border-white"></div>
                <button
                  onClick={() => { window.print(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>Print Cryo-Carrier Manifest</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+P</span>
                </button>
                <div className="my-1 border-t border-[#808080] border-b border-white"></div>
                <button
                  onClick={() => { if (window.confirm("Disconnect active Java SE terminal?")) window.location.reload(); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white"
                >
                  Exit Workstation
                </button>
              </div>
            )}
          </div>

          {/* Navigation View Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-2 py-0.5 text-black hover:bg-[#0A246A] hover:text-white ${activeMenu === 'view' ? 'bg-[#0A246A] text-white' : ''}`}
            >
              <u>V</u>iew
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 top-full mt-0.5 w-60 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-md z-50 text-[11px] py-1">
                <button
                  onClick={() => { setActivePage('dashboard'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between items-center"
                >
                  <span>Procurement & Custody Portal</span>
                  {activePage === 'dashboard' && <Check className="w-3 h-3 text-black" />}
                </button>
                <button
                  onClick={() => { setActivePage('verify'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between items-center"
                >
                  <span>Organ Verification Inspector</span>
                  {activePage === 'verify' && <Check className="w-3 h-3 text-black" />}
                </button>
                <button
                  onClick={() => { setActivePage('explorer'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between items-center"
                >
                  <span>Consortium EVM Ledger Explorer</span>
                  {activePage === 'explorer' && <Check className="w-3 h-3 text-black" />}
                </button>
              </div>
            )}
          </div>

          {/* Stakeholder Switch Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'stakeholders' ? null : 'stakeholders')}
              className={`px-2 py-0.5 text-black hover:bg-[#0A246A] hover:text-white ${activeMenu === 'stakeholders' ? 'bg-[#0A246A] text-white' : ''}`}
            >
              <u>S</u>takeholder Node
            </button>
            {activeMenu === 'stakeholders' && (
              <div className="absolute left-0 top-full mt-0.5 w-72 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-md z-50 text-[11px] py-1">
                {demoUsers.map((u) => (
                  <button
                    key={u.role}
                    onClick={() => {
                      switchRole(u.role);
                      if (u.role === 'customer') setActivePage('verify');
                      else setActivePage('dashboard');
                      setActiveMenu(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#0A246A] hover:text-white flex items-center justify-between ${
                      currentUser.role === u.role ? 'font-bold bg-[#E2DFD2]' : ''
                    }`}
                  >
                    <span>{u.badge}</span>
                    {currentUser.role === u.role && <Check className="w-3 h-3 text-[#0A246A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              className={`px-2 py-0.5 text-black hover:bg-[#0A246A] hover:text-white ${activeMenu === 'help' ? 'bg-[#0A246A] text-white' : ''}`}
            >
              <u>H</u>elp
            </button>
            {activeMenu === 'help' && (
              <div className="absolute left-0 top-full mt-0.5 w-60 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-md z-50 text-[11px] py-1">
                <button
                  onClick={() => { onOpenGuide(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>Transplant Defense Guide</span>
                  <span className="text-gray-500 text-[10px]">F1</span>
                </button>
                <div className="my-1 border-t border-[#808080] border-b border-white"></div>
                <button
                  onClick={() => { alert("LifeLedger v2.4 (Java 8 SE VM Emulation)\nDecentralized Organ Procurement & Transplant Network\nConsortium: EVM Proof-of-Authority\nSolidity Invariants: 16 Passing\nAPI Invariants: 25 Passing"); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white"
                >
                  About LifeLedger...
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side notification pill */}
        {investigationCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{investigationCount} Active Trafficking / Excursion Alert{investigationCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* 3. Classic Java JToolBar with Beveled Push-Buttons */}
      <div className="bg-[#ECE9D8] p-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#808080]">
        <div className="flex items-center gap-1.5">
          {/* Main Navigation Tabs in classic JTab style */}
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`swing-btn ${isActive ? 'swing-btn-active bg-[#DFDBD0] font-bold' : ''}`}
              >
                {item.id === 'dashboard' && <LayoutDashboard className="w-3.5 h-3.5 text-[#0A246A]" />}
                {item.id === 'verify' && <Search className="w-3.5 h-3.5 text-teal-700" />}
                {item.id === 'explorer' && <Boxes className="w-3.5 h-3.5 text-indigo-700" />}
                <span>{item.label}</span>
                <span className="text-gray-400 text-[9px] font-mono">[{item.shortcut}]</span>
              </button>
            );
          })}

          <div className="h-5 w-[2px] bg-[#808080] border-r border-white mx-1"></div>

          {/* Quick Action Buttons */}
          <button
            onClick={() => {
              setActivePage('dashboard');
              if (onHarvestClick) onHarvestClick();
            }}
            className="swing-btn swing-btn-primary"
            title="Harvest & Register Donor Organ"
          >
            <Plus className="w-3 h-3 text-green-700" />
            <span>Harvest Organ</span>
          </button>

          <button
            onClick={() => onOpenGuide()}
            className="swing-btn"
            title="Transplant System Defense Guide"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
            <span>Defense Guide [F1]</span>
          </button>
        </div>

        {/* Right side: JComboBox Active Stakeholder Node Selector */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <span className="text-[11px] font-bold text-gray-700">Active Node:</span>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="swing-btn flex items-center gap-1.5 py-1 px-2.5 min-w-[210px] justify-between bg-white text-left font-normal"
            >
              <div className="flex items-center gap-1.5 truncate">
                <CurrentRoleIcon className="w-3.5 h-3.5 text-[#0A246A] shrink-0" />
                <span className="font-bold text-[11px] truncate">{currentUser.badge}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-600 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-xl z-50 text-[11px] py-1">
                <div className="px-2 py-1 bg-[#0A246A] text-white font-bold text-[10px] uppercase flex justify-between">
                  <span>Select Active Node (Java VM Simulation)</span>
                  <span className="font-mono">PoA 1337</span>
                </div>
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#0A246A] hover:text-white border-b border-[#D4D0C8] ${
                        isSelected ? 'bg-[#DFDBD0] font-bold' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 mt-0.5 text-gray-700" />
                        <div>
                          <div className="text-[11px] font-bold">{u.badge}</div>
                          <div className="text-[10px] text-gray-500 leading-tight">{u.name}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0A246A]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
