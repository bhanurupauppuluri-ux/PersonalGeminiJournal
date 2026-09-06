import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw, PenTool, Lightbulb, Compass, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EntryCard } from './EntryCard';

export function JournalInput({ onEntrySaved }) {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestEntry, setLatestEntry] = useState(null);

  const promptStarters = [
    { label: "Daily Reflection", text: "Today I focused on making progress on our core project goals. One challenge I faced was..." },
    { label: "Brainstorm & Strategy", text: "Here is an idea for optimizing our technical workflow: First, we can stream real-time data using..." },
    { label: "Stress Reframe", text: "I felt overwhelmed when deadlines shifted today. However, what I can directly control is..." }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 3) {
      setError('Please write at least a sentence before submitting to Gemini AI.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await api.saveEntry(token, content);
      if (data.success && data.entry) {
        setLatestEntry(data.entry);
        setContent('');
        if (onEntrySaved) {
          onEntrySaved(data.entry);
        }
      }
    } catch (err) {
      console.error('Submit entry error:', err);
      setError(err.message || 'Failed to analyze and save journal entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Journal Input Box */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Journal & Brainstorming Workspace</h2>
          </div>
          <span className="text-xs text-slate-400">{content.length} / 10,000 characters</span>
        </div>

        {/* Prompt Starters */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Quick Prompts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {promptStarters.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setContent(starter.text)}
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-500/40 text-xs font-medium text-slate-300 hover:text-indigo-300 transition-all flex items-center space-x-1.5"
              >
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>{starter.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, reflections, team decisions, or daily challenges here... Gemini will analyze emotional tone, extract takeaways, and track resilience."
              disabled={loading}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze & Save Entry</span>
                  <Send className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Latest Processed Entry Highlight */}
      {latestEntry && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Newly Synthesized AI Journal Result</span>
          </div>
          <EntryCard entry={latestEntry} />
        </div>
      )}
    </div>
  );
}
