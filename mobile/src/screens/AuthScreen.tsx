import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { login, loginWithGoogle, register, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@pulseband.io');
  const [password, setPassword] = useState('pulseband123');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } else {
      if (!name.trim()) {
        setError('Please provide your name');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      }
    }
    setLoading(false);
  };

  const handleDemoAccess = () => {
    quickDemoLogin();
  };

  const handleGoogleSelect = async (accountEmail: string, accountName: string) => {
    setGoogleLoading(true);
    setShowGoogleModal(false);
    await loginWithGoogle(accountEmail, accountName);
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#04060A] text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-5 pt-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3EE8D3]/10 border border-[#1B6E64]/50 shadow-xl shadow-teal-500/10 mb-1">
            <HeartPulse className="w-8 h-8 text-[#3EE8D3] pt-beat" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">PulseBand</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Screenless Wearable Health Ecosystem & IndusBoard Coin Telemetry
          </p>
        </div>

        {/* Quick Demo Access One-Click Card */}
        <div className="bg-gradient-to-r from-[#141E32] to-[#182B48] border border-teal-500/30 rounded-2xl p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3EE8D3] font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Instant Product Tour</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-semibold">
              PRE-CONFIGURED
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Sign in as verified test patient <strong className="text-white">Alex Mercer</strong> with active IndusBoard Coin paired.
          </p>
          <button
            onClick={handleDemoAccess}
            className="w-full py-2.5 bg-[#3EE8D3] hover:bg-[#7CF0DF] active:scale-98 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <span>One-Click Demo Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auth Box */}
        <div className="bg-[#0E1524] border border-[#22324D] rounded-2xl p-5 shadow-2xl space-y-4">
          {/* Tabs */}
          <div className="flex p-1 bg-[#080B12] rounded-xl border border-[#1A263C]">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'signin' ? 'bg-[#162238] text-[#3EE8D3] shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'signup' ? 'bg-[#162238] text-[#3EE8D3] shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Sign In with Google Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={googleLoading}
            className="w-full py-2.5 bg-[#141C2E] hover:bg-[#1C2740] active:scale-98 border border-[#232F45] hover:border-slate-500 text-slate-100 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2.5 shadow-sm"
          >
            {/* Authentic Google Multi-Color G Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{googleLoading ? "Connecting with Google…" : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1A263C]" />
            <span className="text-[10px] uppercase font-mono text-slate-500">or with email</span>
            <div className="flex-1 h-px bg-[#1A263C]" />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-9 pr-3 py-2 bg-[#080B12] border border-[#1A263C] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@pulseband.io"
                  className="w-full pl-9 pr-3 py-2 bg-[#080B12] border border-[#1A263C] rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#080B12] border border-[#1A263C] rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-[#162238] hover:bg-[#1F2D48] active:scale-98 border border-[#22324D] text-slate-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security badge footer */}
        <div className="text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256 Encrypted Telemetry · HIPAA Compliant Storage</span>
        </div>
      </div>

      {/* Google OAuth Account Picker Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pt-fade-in">
          <div className="w-full max-w-sm bg-[#0E1524] border border-[#22324D] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A263C]">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Sign in with Google</h3>
                  <p className="text-[11px] text-slate-400">Choose an account to continue to PulseBand</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account List */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleSelect("alex.mercer.health@gmail.com", "Alex Mercer")}
                className="w-full p-2.5 rounded-xl bg-[#141E32] hover:bg-[#1A2844] border border-[#22324D] flex items-center gap-3 transition text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">Alex Mercer</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">alex.mercer.health@gmail.com</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSelect("sarah.jenkins.cdac@gmail.com", "Dr. Sarah Jenkins")}
                className="w-full p-2.5 rounded-xl bg-[#141E32] hover:bg-[#1A2844] border border-[#22324D] flex items-center gap-3 transition text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">Dr. Sarah Jenkins</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">sarah.jenkins.cdac@gmail.com</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </div>

            {/* Custom Google Account Option */}
            <div className="pt-2 border-t border-[#1A263C] space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Use Another Google Account
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="flex-1 px-3 py-1.5 bg-[#080B12] border border-[#1A263C] rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.includes('@')}
                  onClick={() => handleGoogleSelect(customGoogleEmail, customGoogleEmail.split('@')[0])}
                  className="px-3 py-1.5 bg-[#3EE8D3] hover:bg-[#7CF0DF] active:scale-95 disabled:opacity-40 text-slate-950 text-xs font-bold rounded-lg transition"
                >
                  Continue
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              PulseBand receives verified email and profile name via Google OAuth2.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};