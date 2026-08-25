import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [role, setRole] = useState('Partner');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your business email.');
      return;
    }

    onLoginSuccess({
      id: 'usr-1',
      name: email.split('@')[0] || 'Sarah Jenkins',
      email: email,
      role: 'Partner',
      organizationId: 'org-1',
      avatarUrl: '',
    });
  };

  const handleDemoLogin = (demoRole: 'Partner' | 'Principal' | 'Associate') => {
    const demoUserMap = {
      Partner: { id: 'usr-1', name: 'Sarah Jenkins', email: 'sarah.j@alphacapital.vc', role: 'Partner' as const },
      Principal: { id: 'usr-2', name: 'Alex Morgan', email: 'alex.m@alphacapital.vc', role: 'Principal' as const },
      Associate: { id: 'usr-3', name: 'David Chen', email: 'david.c@alphacapital.vc', role: 'Associate' as const },
    };

    onLoginSuccess({
      ...demoUserMap[demoRole],
      organizationId: 'org-1',
      avatarUrl: '',
    });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !firmName) {
      setErrorMsg('Please complete all fields.');
      return;
    }

    onLoginSuccess({
      id: 'usr-' + Date.now(),
      name: name,
      email: email,
      role: role as any,
      organizationId: 'org-1',
      avatarUrl: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-primary-container/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/40 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            P
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">PortfolioPilot AI</h1>
          <p className="text-xs text-outline">VC & PE Operating Partner Platform</p>
        </div>

        {/* Demo Quick Selector */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-outline text-center">Instant Demo Workspace Access</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('Partner')}
              className="py-1.5 px-2 bg-secondary text-on-secondary text-xs font-bold rounded-lg shadow-xs hover:bg-secondary/90 transition-all cursor-pointer"
            >
              Partner
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('Principal')}
              className="py-1.5 px-2 bg-surface-container-high hover:bg-outline-variant/30 text-on-surface text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Principal
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('Associate')}
              className="py-1.5 px-2 bg-surface-container-high hover:bg-outline-variant/30 text-on-surface text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Associate
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-outline-variant/30 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${
              mode === 'login' ? 'border-secondary text-secondary' : 'border-transparent text-outline'
            }`}
          >
            Business Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${
              mode === 'signup' ? 'border-secondary text-secondary' : 'border-transparent text-outline'
            }`}
          >
            Create Firm Workspace
          </button>
        </div>

        {errorMsg && <div className="text-xs text-error font-bold text-center bg-error/10 p-2 rounded-lg">{errorMsg}</div>}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-outline font-semibold mb-1">Business Email</label>
              <input
                type="email"
                required
                placeholder="sarah.j@alphacapital.vc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl shadow-md hover:bg-secondary/90 transition-all cursor-pointer"
            >
              Sign In to Workspace
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3 text-xs">
            <div>
              <label className="block text-outline font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="sarah.j@alphacapital.vc"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Firm Workspace Name</label>
              <input
                type="text"
                required
                placeholder="Alpha Capital"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none"
              >
                <option value="Partner">Partner</option>
                <option value="Principal">Principal</option>
                <option value="Associate">Associate</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl shadow-md hover:bg-secondary/90 transition-all cursor-pointer"
            >
              Create Firm Workspace
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
