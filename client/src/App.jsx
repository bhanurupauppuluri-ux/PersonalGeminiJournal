import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { JournalInput } from './components/JournalInput';
import { ResilienceDashboard } from './components/ResilienceDashboard';
import { HistoryFeed } from './components/HistoryFeed';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import { Sparkles, RefreshCw } from 'lucide-react';

export function App() {
  const { user, token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('workspace');
  const [secretStatus, setSecretStatus] = useState(null);

  useEffect(() => {
    if (token) {
      api.getSecretStatus(token)
        .then(res => setSecretStatus(res))
        .catch(err => console.warn('Secret status fetch note:', err.message));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Authenticating Personal Gemini Journal...</span>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        secretStatus={secretStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <JournalInput onEntrySaved={() => {}} />
          </div>
        )}

        {activeTab === 'resilience' && (
          <ResilienceDashboard />
        )}

        {activeTab === 'history' && (
          <HistoryFeed />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Personal Gemini Journal &copy; 2026. Enterprise Data Isolation Enforced.</span>
          <span className="font-mono text-[11px] text-slate-400">UID: {user.uid}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
