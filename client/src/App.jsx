import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ExplorerPage from './pages/ExplorerPage';
import BlockVisualizerPage from './pages/BlockVisualizerPage';
import RadialActionWheel from './components/RadialActionWheel';
import PresentationGuideModal from './components/PresentationGuideModal';
import { ExternalLink, HelpCircle, ShieldCheck, AlertCircle, RefreshCw, Zap } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LifeLedger Workspace Runtime Exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mt-8">
          <div className="bg-rose-600 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-white" />
              <span className="font-bold text-sm tracking-wide">
                Workspace Exception Caught
              </span>
            </div>
            <span className="text-xs bg-rose-700/80 px-2 py-0.5 rounded-full font-mono">
              Error Boundary
            </span>
          </div>
          <div className="p-4 space-y-3 text-xs text-slate-700">
            <p>
              An unexpected runtime error occurred while rendering the current view:
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 font-mono text-[11px] break-all">
              <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentUser, switchRole } = useAuth();
  const [initialOrganId, setInitialOrganId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.includes('/verify/')) {
      const parts = path.split('/verify/');
      if (parts[1]) return parts[1].split('/')[0].split('?')[0];
    }
    return null;
  });

  const [activePage, setActivePage] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname;
    if (path.includes('/verify')) return 'verify';
    if (path.includes('/explorer')) return 'explorer';
    if (path.includes('/visualizer')) return 'visualizer';
    return 'dashboard';
  });

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  const handleOpenHarvest = useCallback(() => {
    if (currentUser.role !== 'opo' && currentUser.role !== 'admin' && currentUser.role !== 'manufacturer') {
      switchRole('opo');
    }
    setActivePage('dashboard');
    setIsHarvestModalOpen(true);
  }, [currentUser, switchRole]);

  const handlePageChange = useCallback((page) => {
    setActivePage(page);
    if (page === 'verify' && initialOrganId) {
      window.history.pushState({}, '', `/verify/${initialOrganId}`);
    } else if (page === 'verify') {
      window.history.pushState({}, '', '/verify');
    } else if (page === 'dashboard') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${page}`);
    }
  }, [initialOrganId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

      // Tab or Q opens Radial Quick Action Wheel (when not typing in an input field)
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsWheelOpen(prev => !prev);
      } else if (!isInputActive && (e.key.toLowerCase() === 'q')) {
        e.preventDefault();
        setIsWheelOpen(prev => !prev);
      } else if ((e.ctrlKey && e.key.toLowerCase() === 'h') || e.key === 'F2') {
        e.preventDefault();
        handleOpenHarvest();
      } else if (e.key === 'F1') {
        e.preventDefault();
        setIsGuideOpen(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        handlePageChange('verify');
      } else if (e.key === 'F4') {
        e.preventDefault();
        handlePageChange('explorer');
      } else if (e.key === 'F5') {
        e.preventDefault();
        handlePageChange('visualizer');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, handleOpenHarvest, handlePageChange]);

  const handleNavigateToVerify = (organId) => {
    setInitialOrganId(organId);
    setActivePage('verify');
    window.history.pushState({}, '', `/verify/${organId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 select-text font-sans">
      {/* Modern Navigation Header */}
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        onHarvestClick={handleOpenHarvest}
        onOpenWheel={() => setIsWheelOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 p-3 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <ErrorBoundary>
            {activePage === 'verify' && (
              <VerifyPage
                initialBatchId={initialOrganId}
                onNavigateToAdmin={() => handlePageChange('dashboard')}
              />
            )}
            {activePage === 'dashboard' && (
              <DashboardPage
                onNavigateToVerify={handleNavigateToVerify}
                isHarvestModalOpen={isHarvestModalOpen}
                onOpenHarvestModal={handleOpenHarvest}
                onCloseHarvestModal={() => setIsHarvestModalOpen(false)}
              />
            )}
            {activePage === 'explorer' && (
              <ExplorerPage />
            )}
            {activePage === 'visualizer' && (
              <BlockVisualizerPage />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Floating Action Wheel Quick Launcher */}
      <div className="fixed bottom-12 right-5 z-40">
        <button
          onClick={() => setIsWheelOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white font-medium text-xs rounded-full border border-slate-700 shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open Quick Command Radial Wheel (Press Tab or Q)"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Quick Actions [Tab]</span>
        </button>
      </div>

      {/* Radial Action Wheel Overlay */}
      <RadialActionWheel
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onNavigate={handlePageChange}
        onOpenHarvest={handleOpenHarvest}
      />

      {/* Modern Status Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Consortium Nominal</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>PoA Network (ChainID: 31337)</span>
            </div>

            <div className="font-mono text-[11px] text-slate-400 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md">
              LifeLedger.sol @ 0x5FbDB2...aa3
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="http://localhost:5000/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              title="Open Backend API Health"
            >
              <ExternalLink className="w-3 h-3 text-blue-600" />
              <span>API Health</span>
            </a>

            <a
              href="http://localhost:5000/api/verify/ORG-KID-8041"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              title="Inspect JSON API Data for ORG-KID-8041"
            >
              <ExternalLink className="w-3 h-3 text-blue-600" />
              <span>REST JSON</span>
            </a>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
              title="Open System Architecture & Defense Manual"
            >
              <HelpCircle className="w-3 h-3 text-blue-600" />
              <span>Defense Guide [F1]</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Examiner Viva Defense Modal */}
      <PresentationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
