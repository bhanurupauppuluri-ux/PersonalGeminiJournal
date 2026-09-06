import React, { useEffect, useState } from 'react';
import { History, Search, Filter, RefreshCw, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EntryCard } from './EntryCard';

export function HistoryFeed() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('ALL');

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEntries(token);
      if (data.success && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
      setError(err.message || 'Failed to fetch journal history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEntries();
    }
  }, [token]);

  // Extract unique emotions for filter
  const emotions = ['ALL', ...new Set(entries.map(e => e.emotionalTone?.primaryEmotion).filter(Boolean))];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.summary && entry.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEmotion =
      selectedEmotion === 'ALL' ||
      entry.emotionalTone?.primaryEmotion === selectedEmotion;

    return matchesSearch && matchesEmotion;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Journal Entry Logs ({filteredEntries.length})</h2>
          </div>

          <button
            onClick={fetchEntries}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reflections, takeaways, or keywords..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Emotion Filter Pill selector */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {emotions.map((emo, idx) => (
                <option key={idx} value={emo}>{emo === 'ALL' ? 'All Emotions' : emo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/40 rounded-2xl border border-slate-700">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Loading isolated journal entries...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-slate-800/60 rounded-2xl border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Journal Entries Found</h3>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            {searchTerm || selectedEmotion !== 'ALL'
              ? 'No entries match your search criteria. Try resetting filters.'
              : 'Write your first journal entry in the Workspace to begin capturing reflections and receiving Gemini AI insights.'}
          </p>
        </div>
      )}

      {/* Entries List */}
      {!loading && !error && filteredEntries.length > 0 && (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
