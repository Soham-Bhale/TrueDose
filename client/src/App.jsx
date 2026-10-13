import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ExplorerPage from './pages/ExplorerPage';
import PresentationGuideModal from './components/PresentationGuideModal';
import { Pill, ShieldCheck, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const [activePage, setActivePage] = useState('verify');
  const [initialBatchId, setInitialBatchId] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Check URL pathname for direct verification links like /verify/PCM001
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/verify/')) {
      const parts = path.split('/verify/');
      if (parts[1]) {
        const id = parts[1].split('/')[0].split('?')[0];
        setInitialBatchId(id);
        setActivePage('verify');
      }
    }
  }, []);

  const handleNavigateToVerify = (batchId) => {
    setInitialBatchId(batchId);
    setActivePage('verify');
    window.history.pushState({}, '', `/verify/${batchId}`);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    if (page === 'verify' && initialBatchId) {
      window.history.pushState({}, '', `/verify/${initialBatchId}`);
    } else if (page === 'verify') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${page}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'verify' && (
          <VerifyPage
            initialBatchId={initialBatchId}
            onNavigateToAdmin={() => handlePageChange('dashboard')}
          />
        )}
        {activePage === 'dashboard' && (
          <DashboardPage onNavigateToVerify={handleNavigateToVerify} />
        )}
        {activePage === 'explorer' && (
          <ExplorerPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center">
              <Pill className="w-3 h-3 transform -rotate-45" />
            </div>
            <span className="font-bold text-slate-800">TrueDose</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="text-slate-600">Blockchain-Based Pharmaceutical Supply Chain Management & Medicine Verification</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Smart Contract Verified</span>
            </span>
            <span>•</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-teal-700 hover:text-teal-800 font-medium transition underline underline-offset-2"
            >
              Examiner Defense Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Presentation Guide Modal */}
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
