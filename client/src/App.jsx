import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ExplorerPage from './pages/ExplorerPage';
import PresentationGuideModal from './components/PresentationGuideModal';
import { Heart, ExternalLink, HelpCircle, Activity, ShieldCheck, Database } from 'lucide-react';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [initialOrganId, setInitialOrganId] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/verify/')) {
      const parts = path.split('/verify/');
      if (parts[1]) {
        const id = parts[1].split('/')[0].split('?')[0];
        setInitialOrganId(id);
        setActivePage('verify');
      }
    } else if (path.includes('/explorer')) {
      setActivePage('explorer');
    } else if (path.includes('/dashboard')) {
      setActivePage('dashboard');
    }
  }, []);

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
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 p-2 overflow-auto">
        <div className="max-w-7xl mx-auto swing-raised p-2 shadow-md">
          {activePage === 'verify' && (
            <VerifyPage
              initialBatchId={initialOrganId}
              onNavigateToAdmin={() => handlePageChange('dashboard')}
            />
          )}
          {activePage === 'dashboard' && (
            <DashboardPage onNavigateToVerify={handleNavigateToVerify} />
          )}
          {activePage === 'explorer' && (
            <ExplorerPage />
          )}
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
