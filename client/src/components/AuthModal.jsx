import React, { useState } from 'react';
import { Sparkles, Shield, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { signInWithGoogle, signInDevMode } = useAuth();
  const [customUid, setCustomUid] = useState('');

  const handleDevLogin = (e) => {
    e.preventDefault();
    const uid = customUid.trim() || 'user_enterprise_01';
    signInDevMode(uid, `User (${uid})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Personal Gemini Journal</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise-Grade AI Reflection, Resilience Analytics & Isolated Firestore Document Security.
          </p>
        </div>

        {/* Google Sign-In Main Button */}
        <div className="space-y-3">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500 shrink-0">
            Or Local Testing Mode
          </span>
        </div>

        {/* Dev Mode Login */}
        <form onSubmit={handleDevLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Dev User UID (Isolated Path Testing)</label>
            <input
              type="text"
              value={customUid}
              onChange={(e) => setCustomUid(e.target.value)}
              placeholder="e.g. user_enterprise_01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Continue as Test User</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Constitution Badges */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Path: /users/{'{uid}'}/journals</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>GCP Secret Manager API</span>
          </div>
        </div>
      </div>
    </div>
  );
}
