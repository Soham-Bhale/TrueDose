import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ExplorerPage from './pages/ExplorerPage';
import PresentationGuideModal from './components/PresentationGuideModal';
import { Heart, ExternalLink, HelpCircle, Activity, ShieldCheck, Database, AlertCircle, RefreshCw } from 'lucide-react';

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
        <div className="p-4 max-w-2xl mx-auto swing-raised shadow-xl mt-8">
          <div className="swing-titlebar bg-[#8C1A1A]">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-300" />
              <span className="font-bold text-xs tracking-wide">
                java.lang.RuntimeException: Workspace Render Exception
              </span>
            </div>
          </div>
          <div className="p-4 bg-[#ECE9D8] space-y-3 text-[11px]">
            <p className="text-[#333333]">
              An unhandled exception occurred in the active workspace view:
            </p>
            <div className="swing-sunken p-3 bg-[#FFF0F0] border border-red-500 text-red-950 font-mono text-[10px] break-all">
              <strong>Exception:</strong> {this.state.error?.message || "Unknown error"}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#808080]">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="swing-btn text-xs py-1 px-3 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload JVM Process</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="swing-btn swing-btn-primary text-xs py-1 px-3"
              >
                Return to Organ Registry
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
  const [activePage, setActivePage] = useState('dashboard');
  const [initialOrganId, setInitialOrganId] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/verify/')) {
      const parts = path.split('/verify/');
      if (parts[1]) {
        const id = parts[1].split('/')[0].split('?')[0];
        setInitialOrganId(id);
        setActivePage('verify');
      }
    } else if (path.includes('/verify')) {
      setActivePage('verify');
    } else if (path.includes('/explorer')) {
      setActivePage('explorer');
    } else if (path.includes('/dashboard')) {
      setActivePage('dashboard');
    }
  }, []);

  const handleHarvestClick = useCallback(() => {
    if (currentUser?.role !== 'opo' && currentUser?.role !== 'admin') {
      switchRole('opo');
    }
    setActivePage('dashboard');
    setIsHarvestModalOpen(true);
  }, [currentUser, switchRole]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'h') || e.key === 'F2') {
        e.preventDefault();
        handleHarvestClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHarvestClick]);

  const handleNavigateToVerify = (organId) => {
    setInitialOrganId(organId);
    setActivePage('verify');
    window.history.pushState({}, '', `/verify/${organId}`);
  };

  const handlePageChange = (page) => {
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE9D8] text-[#1a1a1a] select-text">
      {/* Java Classic Menu & Toolbar */}
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        onHarvestClick={handleHarvestClick}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 p-2 overflow-auto">
        <div className="max-w-7xl mx-auto swing-raised p-2 shadow-md">
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
                setIsHarvestModalOpen={setIsHarvestModalOpen}
              />
            )}
            {activePage === 'explorer' && (
              <ExplorerPage />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Java Swing Standard JStatusBar */}
      <footer className="swing-statusbar border-t-2 border-[#FFFFFF] bg-[#ECE9D8] px-2 py-1 text-[11px] select-none">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="swing-status-pane flex items-center gap-1 font-bold text-[#0A246A]">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span>Ready</span>
            </div>

            <div className="swing-status-pane flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-700" />
              <span>PoA Consortium (ChainID: 31337)</span>
            </div>

            <div className="swing-status-pane font-mono text-[10px] text-[#444444]">
              LifeLedger.sol @ 0x5FbDB2...aa3
            </div>

            <div className="swing-status-pane text-[#666666]">
              JVM Heap: 48MB / 128MB
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="http://localhost:5000/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="swing-btn text-[10px] py-0.5 px-2"
              title="Open Backend API Health"
            >
              <ExternalLink className="w-3 h-3 text-blue-800" />
              <span>API Health</span>
            </a>

            <a
              href="http://localhost:5000/api/verify/ORG-KID-8041"
              target="_blank"
              rel="noopener noreferrer"
              className="swing-btn text-[10px] py-0.5 px-2 font-mono"
              title="Inspect JSON API Data for ORG-KID-8041"
            >
              <ExternalLink className="w-3 h-3 text-blue-800" />
              <span>REST JSON</span>
            </a>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="swing-btn swing-btn-primary text-[10px] py-0.5 px-2.5 font-bold"
              title="Open System Architecture & Examiner Defense Manual"
            >
              <HelpCircle className="w-3 h-3 text-[#0A246A]" />
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
