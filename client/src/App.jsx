import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import ExplorerPage from './pages/ExplorerPage';
import PresentationGuideModal from './components/PresentationGuideModal';
import { Pill, ExternalLink } from 'lucide-react';

function AppContent() {
  const [activePage, setActivePage] = useState('verify');
  const [initialBatchId, setInitialBatchId] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

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
      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-teal-700 text-white flex items-center justify-center">
              <Pill className="w-3 h-3 -rotate-45" />
            </div>
            <span className="font-semibold text-slate-700">TrueDose</span>
            <span className="text-slate-400">—</span>
            <span>Blockchain Pharma Supply Chain & Medicine Verification</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Web App
            </a>
            <a
              href="http://localhost:5000/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              API Health
            </a>
            <a
              href="http://localhost:5000/api/verify/PCM001"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Sample Batch API
            </a>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2"
            >
              Examiner Guide
            </button>
          </div>
        </div>
      </footer>

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
