import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Heart, Truck, FileCheck, Building2, ShieldAlert,
  Search, Boxes, Layers, X, Zap, CornerDownLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Synthesized high-tech HUD audio feedback using native Web Audio API
function playWheelTick(pitch = 750) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // AudioContext might be blocked until user gesture, safe to ignore
  }
}

function playSelectChirp() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

export default function RadialActionWheel({
  isOpen,
  onClose,
  onNavigate,
  onOpenHarvest
}) {
  const { switchRole } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wheelRef = useRef(null);
  const lastIndexRef = useRef(0);

  // 8 Stakeholder action slots
  const WHEEL_OPTIONS = useMemo(() => [
    {
      id: 'harvest',
      number: '1',
      title: 'OPO Harvest Organ',
      category: 'Procurement Node',
      role: 'opo',
      icon: Heart,
      color: '#ef4444',
      description: 'Procure & mint new donor organ record with Form 8 consent on blockchain.',
      execute: () => {
        switchRole('opo');
        if (onOpenHarvest) onOpenHarvest();
        else onNavigate('dashboard');
      }
    },
    {
      id: 'logistics',
      number: '2',
      title: 'AeroMed Transit',
      category: 'Air & Ground Fleet',
      role: 'logistics',
      icon: Truck,
      color: '#3b82f6',
      description: 'Assume cold-chain transit custody in green corridor ambulance fleet.',
      execute: () => {
        switchRole('logistics');
        onNavigate('dashboard');
      }
    },
    {
      id: 'notto',
      number: '3',
      title: 'NOTTO Allocation',
      category: 'National Registry',
      role: 'authority',
      icon: FileCheck,
      color: '#10b981',
      description: 'Review HLA matching, algorithm allocation, and recipient queue clearance.',
      execute: () => {
        switchRole('authority');
        onNavigate('dashboard');
      }
    },
    {
      id: 'hospital',
      number: '4',
      title: 'Apollo Surgical OR',
      category: 'Transplant Hospital',
      role: 'hospital',
      icon: Building2,
      color: '#8b5cf6',
      description: 'Sign off surgical OR implantation and finalize blockchain chain of custody.',
      execute: () => {
        switchRole('hospital');
        onNavigate('dashboard');
      }
    },
    {
      id: 'admin',
      number: '5',
      title: 'Anti-Trafficking Directorate',
      category: 'Regulatory Authority',
      role: 'admin',
      icon: ShieldAlert,
      color: '#dc2626',
      description: 'Audit illegal organ trafficking alerts, thermal breaches, and issue quarantines.',
      execute: () => {
        switchRole('admin');
        onNavigate('dashboard');
      }
    },
    {
      id: 'verify',
      number: '6',
      title: 'Organ Verification Inspector',
      category: 'Provenance Query',
      role: null,
      icon: Search,
      color: '#06b6d4',
      description: 'Interrogate EVM blockchain to verify donor authenticity and cold ischemia limits.',
      execute: () => {
        onNavigate('verify');
      }
    },
    {
      id: 'visualizer',
      number: '7',
      title: 'Visual Block Chain Explorer',
      category: 'Consortium Architecture',
      role: null,
      icon: Boxes,
      color: '#f59e0b',
      description: 'Interactive visual representation of block creation, SHA-256 links, and PoA consensus.',
      execute: () => {
        onNavigate('visualizer');
      }
    },
    {
      id: 'explorer',
      number: '8',
      title: 'EVM Ledger Explorer',
      category: 'Hardhat Node',
      role: null,
      icon: Layers,
      color: '#ec4899',
      description: 'Inspect raw blocks, transactions, smart contract addresses, and bytecode.',
      execute: () => {
        onNavigate('explorer');
      }
    }
  ], [switchRole, onOpenHarvest, onNavigate]);

  const executeSelection = useCallback((index) => {
    playSelectChirp();
    const opt = WHEEL_OPTIONS[index];
    if (opt && opt.execute) {
      opt.execute();
    }
    onClose();
  }, [WHEEL_OPTIONS, onClose]);

  // Mouse angle tracking relative to wheel center
  const handleMouseMove = useCallback((e) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If mouse is inside center hub or reasonably within outer ring
    if (dist < 45) return; // Dead zone in center

    // Calculate angle in degrees from -180 to 180
    // Standard Math.atan2 gives 0 at +X (3 o'clock).
    // Let's rotate so 12 o'clock (top) is the start (index 0).
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI);
    // Offset so -90 deg (12 o'clock) is center of first slice
    // Slice angle = 360 / 8 = 45 degrees
    // Slice 0: centered at -90° -> -112.5° to -67.5°
    let normalized = degrees + 90 + 22.5;
    if (normalized < 0) normalized += 360;
    if (normalized >= 360) normalized -= 360;

    const slotIndex = Math.floor(normalized / 45);
    const clampedIndex = Math.max(0, Math.min(7, slotIndex));

    if (clampedIndex !== lastIndexRef.current) {
      lastIndexRef.current = clampedIndex;
      setSelectedIndex(clampedIndex);
      playWheelTick(700 + clampedIndex * 40);
    }
  }, []);

  // Keyboard navigation (1-8 keys, arrows, Tab, Esc, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // 1-8 keys
      if (e.key >= '1' && e.key <= '8') {
        const idx = parseInt(e.key, 10) - 1;
        setSelectedIndex(idx);
        playWheelTick(800);
        executeSelection(idx);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev + 1) % 8;
          playWheelTick(750);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev - 1 + 8) % 8;
          playWheelTick(750);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelection(selectedIndex);
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, executeSelection, onClose]);

  if (!isOpen) return null;

  const activeOption = WHEEL_OPTIONS[selectedIndex];
  const ActiveIcon = activeOption.icon;

  // Geometry for 8 SVG slices
  // Radius: inner 105, outer 220
  const size = 520;
  const center = size / 2;
  const rInner = 100;
  const rOuter = 230;

  // Generate SVG path for a 45 degree donut slice
  const createSlicePath = (index) => {
    const angleStep = 45;
    // Start at -90 deg - 22.5 deg = -112.5 deg for index 0 (so index 0 is centered at -90 / 12 o'clock)
    const startDeg = -112.5 + index * angleStep;
    const endDeg = startDeg + angleStep;

    const toRad = (d) => (d * Math.PI) / 180;

    const x1 = center + rOuter * Math.cos(toRad(startDeg));
    const y1 = center + rOuter * Math.sin(toRad(startDeg));
    const x2 = center + rOuter * Math.cos(toRad(endDeg));
    const y2 = center + rOuter * Math.sin(toRad(endDeg));

    const x3 = center + rInner * Math.cos(toRad(endDeg));
    const y3 = center + rInner * Math.sin(toRad(endDeg));
    const x4 = center + rInner * Math.cos(toRad(startDeg));
    const y4 = center + rInner * Math.sin(toRad(startDeg));

    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
  };

  // Center position for icon in each slice
  const getSliceCenter = (index) => {
    const angleDeg = -90 + index * 45;
    const rMid = (rInner + rOuter) / 2;
    const toRad = (d) => (d * Math.PI) / 180;
    return {
      x: center + rMid * Math.cos(toRad(angleDeg)),
      y: center + rMid * Math.sin(toRad(angleDeg))
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none animate-fadeIn"
      onClick={onClose}
      onMouseMove={handleMouseMove}
    >
      {/* Top Action Wheel HUD Banner */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-400/40 rounded-full backdrop-blur-md">
          <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="font-mono font-bold text-blue-300 tracking-wider text-xs uppercase">
            QUICK ACTION COMMAND WHEEL • LIFELEDGER
          </span>
          <span className="bg-blue-500 text-white font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-full">
            TAB / 1-8
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans mt-1.5">
          Aim cursor toward any action or press numeric keys <strong className="text-white font-mono">[1 - 8]</strong> to launch
        </p>
      </div>

      {/* Close button top right */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        title="Close Wheel (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Wheel Container */}
      <div
        ref={wheelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[520px] h-[520px] flex items-center justify-center transition-transform duration-75"
      >
        {/* SVG Radial Wheel Wedges */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 pointer-events-auto"
        >
          <defs>
            {/* Glowing filter for active wedge */}
            <filter id="action-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e222d" />
              <stop offset="85%" stopColor="#0d1117" />
              <stop offset="100%" stopColor="#080a0e" />
            </radialGradient>
          </defs>

          {/* Slices */}
          {WHEEL_OPTIONS.map((opt, i) => {
            const isSelected = selectedIndex === i;
            return (
              <g
                key={opt.id}
                onClick={() => executeSelection(i)}
                onMouseEnter={() => {
                  if (selectedIndex !== i) {
                    setSelectedIndex(i);
                    playWheelTick(700 + i * 35);
                  }
                }}
                className="cursor-pointer transition-all duration-150"
              >
                <path
                  d={createSlicePath(i)}
                  fill={isSelected ? 'rgba(37, 99, 235, 0.45)' : 'rgba(15, 23, 42, 0.90)'}
                  stroke={isSelected ? '#3B82F6' : '#334155'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  filter={isSelected ? 'url(#action-glow)' : 'none'}
                  className="transition-colors duration-150"
                />
              </g>
            );
          })}

          {/* Center Hub Outer Ring Border */}
          <circle
            cx={center}
            cy={center}
            r={rInner}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-60"
          />

          {/* Outer Wheel Perimeter Ring */}
          <circle
            cx={center}
            cy={center}
            r={rOuter}
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            className="opacity-40"
          />
        </svg>

        {/* HTML Labels & Icons Placed inside each SVG Slice */}
        {WHEEL_OPTIONS.map((opt, i) => {
          const pos = getSliceCenter(i);
          const isSelected = selectedIndex === i;
          const IconComponent = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => executeSelection(i)}
              onMouseEnter={() => {
                if (selectedIndex !== i) {
                  setSelectedIndex(i);
                  playWheelTick(700 + i * 35);
                }
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : 1})`,
                transition: 'transform 0.15s ease-out'
              }}
              className="flex flex-col items-center justify-center pointer-events-auto cursor-pointer z-10"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_#2563EB]'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-700'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span
                className={`font-mono text-[9px] font-bold mt-1 px-1 rounded-xs transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-blue-300 border border-blue-400'
                    : 'text-slate-400'
                }`}
              >
                [{opt.number}] {opt.title.split(' ')[0]}
              </span>
            </div>
          );
        })}

        {/* Center Command Reticle */}
        <div
          onClick={() => executeSelection(selectedIndex)}
          className="absolute w-[184px] h-[184px] rounded-full bg-slate-950/95 border-2 border-blue-500 flex flex-col items-center justify-center p-3 text-center cursor-pointer shadow-[0_0_30px_rgba(37,99,235,0.35)] z-20 group hover:border-blue-400 transition-all"
        >
          {/* Glowing Icon */}
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center mb-1 text-blue-400 group-hover:scale-110 transition-transform">
            <ActiveIcon className="w-5 h-5 text-blue-400" />
          </div>

          {/* Slot Number & Category */}
          <div className="text-[9px] font-mono text-blue-400/90 uppercase tracking-widest font-bold">
            SLOT {activeOption.number} • {activeOption.category}
          </div>

          {/* Option Name */}
          <div className="font-sans font-black text-white text-xs tracking-tight line-clamp-1 mt-0.5">
            {activeOption.title}
          </div>

          {/* Click to Select CTA */}
          <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 bg-blue-600 text-white font-mono font-bold text-[9px] rounded-full shadow-xs">
            <CornerDownLeft className="w-2.5 h-2.5" />
            <span>PRESS ENTER / CLICK</span>
          </div>
        </div>
      </div>

      {/* Bottom Description HUD Panel */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-4 rounded-xl text-center shadow-2xl pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-1.5 mb-1.5">
          <span className="text-blue-400 font-bold">
            ACTIVE SELECTION: {activeOption.title.toUpperCase()}
          </span>
          <span className="text-slate-400">
            STAKEHOLDER: <strong className="text-white">{activeOption.role ? activeOption.role.toUpperCase() : 'UNIVERSAL'}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {activeOption.description}
        </p>
        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
          <span>[TAB / ESC] Close</span>
          <span>•</span>
          <span>[1-8] Direct Select</span>
          <span>•</span>
          <span>[ENTER] Execute</span>
        </div>
      </div>
    </div>
  );
}