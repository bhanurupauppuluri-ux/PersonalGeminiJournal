import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, Smile, Activity, Calendar } from 'lucide-react';

export function EntryCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  const {
    content,
    summary,
    keyTakeaways = [],
    emotionalTone = {},
    createdAt
  } = entry;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Just now';

  const emotion = emotionalTone.primaryEmotion || 'Reflective';
  const sentimentScore = emotionalTone.sentimentScore || 7;
  const resilienceScore = emotionalTone.resilienceScore || 7.5;
  const toneTags = emotionalTone.toneTags || [];

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-xl hover:border-slate-600/80 transition-all">
      {/* Entry Header: Date & Emotion Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/40">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Emotion Badge */}
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Smile className="w-3.5 h-3.5 text-indigo-400" />
            <span>{emotion}</span>
          </span>

          {/* Resilience Badge */}
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Resilience {resilienceScore}/10</span>
          </span>
        </div>
      </div>

      {/* AI Summary Highlight Box */}
      {summary && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/20">
          <div className="flex items-center space-x-2 mb-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini AI Executive Summary</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Key Takeaways */}
      {keyTakeaways.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Takeaways</h4>
          <ul className="space-y-1.5">
            {keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tone Tags */}
      {toneTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {toneTags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-700/60 text-slate-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Raw Content Expand/Collapse */}
      <div className="pt-3 border-t border-slate-700/30">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span>{expanded ? 'Hide original entry' : 'View full original entry'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-3 p-3 rounded-lg bg-slate-900/80 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap border border-slate-800">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
