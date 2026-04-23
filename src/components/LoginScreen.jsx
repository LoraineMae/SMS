// src/components/LoginScreen.jsx
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, Activity, Stethoscope, BarChart3 } from 'lucide-react';

export const LoginScreen = ({ role, onLogin, onBack, authError, authLoading }) => {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError,   setLocalError]   = useState('');

  const error = localError || authError;

  const handleSubmit = async () => {
    setLocalError('');
    if (!username.trim()) return setLocalError('Username is required.');
    if (!password)        return setLocalError('Password is required.');
    await onLogin(username.trim(), password, role);
  };

  const theme = {
    triage:  { accent: 'text-green-600',  border: 'border-green-400/40',  bg: 'bg-green-100',  btn: 'bg-green-600 hover:bg-green-500'   },
    doctor:  { accent: 'text-emerald-600',border: 'border-emerald-400/40',bg: 'bg-emerald-100',btn: 'bg-emerald-600 hover:bg-emerald-500' },
    manager: { accent: 'text-teal-600',   border: 'border-teal-400/40',   bg: 'bg-teal-100',   btn: 'bg-teal-600 hover:bg-teal-500'     },
  }[role] || {};

  const roleLabel = { triage: 'Nurse', doctor: 'Doctor', manager: 'Manager' }[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
      <div className="dashboard-card w-full max-w-md p-10 text-[#1a3a2a]">

        <button onClick={onBack} className="text-gray-400 mb-6 flex items-center gap-1 text-xs uppercase font-bold hover:text-green-700 transition-colors">
          <ArrowLeft size={14}/> Back
        </button>

        <div className="text-center mb-8">
          <div className={`inline-flex p-4 rounded-2xl mb-4 ${theme.bg} ${theme.accent} border ${theme.border}`}>
            {role === 'triage'  && <Activity size={32}/>}
            {role === 'doctor'  && <Stethoscope size={32}/>}
            {role === 'manager' && <BarChart3 size={32}/>}
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-[#1a3a2a]">{roleLabel} Registration</h2>
          <p className="text-gray-400 text-xs mt-1 tracking-widest uppercase">Secure Authentication</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-5 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0"/>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-1">Username</label>
            <input
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={authLoading}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-1">Password</label>
            <div className="relative">
              <input
                className="form-input pr-12"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={authLoading}
            className={`w-full ${theme.btn} p-4 rounded-xl font-bold transition-all uppercase tracking-widest text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {authLoading
              ? <><Loader2 size={16} className="animate-spin"/> Verifying...</>
              : <><ShieldCheck size={16}/> Enter Portal</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};