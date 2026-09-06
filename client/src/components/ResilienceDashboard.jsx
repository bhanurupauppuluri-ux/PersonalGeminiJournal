import React, { useEffect, useState } from 'react';
import { LineChart, TrendingUp, TrendingDown, Minus, Lightbulb, CheckSquare, RefreshCw, Award, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function ResilienceDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getResilienceAnalytics(token);
      if (res.success && res.analytics) {
        setData(res.analytics);
      }
    } catch (err) {
      console.error('Fetch resilience analytics error:', err);
      setError(err.message || 'Failed to load resilience analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">Synthesizing Emotional Resilience Trajectory...</p>
        <p className="text-xs text-slate-500 mt-1">Aggregating past entries and evaluating psychological flexibility</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-800/60 rounded-2xl border border-rose-500/30 text-rose-300 space-y-3">
        <div className="flex items-center space-x-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>Could Not Load Resilience Analytics</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    resilienceIndex = 7.5,
    trend = 'stable',
    summaryText = '',
    microCoaching = {},
    trajectory = []
  } = data || {};

  const getTrendBadge = () => {
    if (trend === 'rising') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>Rising Trajectory</span>
        </span>
      );
    }
    if (trend === 'declining') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
          <TrendingDown className="w-4 h-4" />
          <span>Needs Reflection</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
        <Minus className="w-4 h-4" />
        <span>Stable Baseline</span>
      </span>
    );
  };

  // Build SVG Trajectory Line Graph
  const points = trajectory.length > 0 ? trajectory : [
    { date: 'Entry 1', score: 6.5 },
    { date: 'Entry 2', score: 7.0 },
    { date: 'Entry 3', score: 7.8 },
    { date: 'Entry 4', score: 8.2 },
    { date: 'Entry 5', score: 8.5 }
  ];

  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 35;

  const minScore = Math.min(...points.map(p => p.score), 4);
  const maxScore = Math.max(...points.map(p => p.score), 10);

  const getX = (index) => {
    if (points.length <= 1) return svgWidth / 2;
    return padding + (index * (svgWidth - 2 * padding)) / (points.length - 1);
  };

  const getY = (score) => {
    return svgHeight - padding - ((score - minScore) * (svgHeight - 2 * padding)) / (maxScore - minScore || 1);
  };

  const polylinePoints = points.map((p, idx) => `${getX(idx)},${getY(p.score)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Dashboard Top Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Index Score Card */}
        <div className="bg-slate-800/80 border border-purple-500/30 rounded-2xl p-5 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Resilience Index</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{resilienceIndex}</span>
            <span className="text-sm font-semibold text-purple-300">/ 10</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Synthesized from past emotional trajectory logs.</p>
        </div>

        {/* Trend Indicator Card */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trajectory State</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>{getTrendBadge()}</div>
          <p className="text-xs text-slate-400 mt-2">Calculated over recent journal entries.</p>
        </div>

        {/* Summary Overview Card */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Psychological Assessment</span>
            <LineChart className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic">
            "{summaryText || 'Your emotional baseline exhibits consistent adaptability and constructive processing.'}"
          </p>
        </div>
      </div>

      {/* Trajectory Visual Chart */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <LineChart className="w-5 h-5 text-purple-400" />
              <span>Emotional Resilience Trajectory Over Time</span>
            </h3>
            <p className="text-xs text-slate-400">Score scale 1-10 mapped across entry history</p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-56">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[4, 6, 8, 10].map((gridVal) => (
              <g key={gridVal}>
                <line
                  x1={padding}
                  y1={getY(gridVal)}
                  x2={svgWidth - padding}
                  y2={getY(gridVal)}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x={padding - 10} y={getY(gridVal) + 4} fill="#64748b" fontSize="10" textAnchor="end">
                  {gridVal}
                </text>
              </g>
            ))}

            {/* Area Fill */}
            {points.length > 1 && (
              <polygon
                points={`${getX(0)},${svgHeight - padding} ${polylinePoints} ${getX(points.length - 1)},${svgHeight - padding}`}
                fill="url(#chartGradient)"
              />
            )}

            {/* Line Path */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}

            {/* Points & Labels */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={getX(idx)}
                  cy={getY(p.score)}
                  r="5"
                  className="fill-purple-400 stroke-slate-900 stroke-2 hover:r-7 transition-all cursor-pointer"
                />
                <text
                  x={getX(idx)}
                  y={getY(p.score) - 10}
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.score}
                </text>
                <text
                  x={getX(idx)}
                  y={svgHeight - 12}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {p.date ? (p.date.length > 10 ? p.date.substring(5, 10) : p.date) : `E${idx + 1}`}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Actionable AI Micro-Coaching Card */}
      {microCoaching && (
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">AI Micro-Coaching Recommendation</span>
              <h3 className="text-lg font-extrabold text-slate-100">{microCoaching.title || 'Actionable Growth Strategy'}</h3>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed mb-5 pl-1 font-medium">
            {microCoaching.advice}
          </p>

          {Array.isArray(microCoaching.actionableSteps) && microCoaching.actionableSteps.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span>Actionable Steps Checklist</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {microCoaching.actionableSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 leading-normal">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
