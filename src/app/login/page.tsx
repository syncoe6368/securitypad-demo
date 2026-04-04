'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Github, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (data.token) {
        localStorage.setItem('sp_token', data.token);
        if (data.user?.tier) {
          localStorage.setItem('sp_tier', data.user.tier);
        }
        window.location.href = '/dashboard/';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubOAuth = () => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub OAuth not configured yet. Please use email/password.');
      return;
    }

    // Standard GitHub OAuth flow
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;
    const scope = 'read:user user:email';
    const state = crypto.randomUUID(); // CSRF protection

    // Store state for verification
    sessionStorage.setItem('sp_oauth_state', state);

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('scope', scope);
    githubAuthUrl.searchParams.set('state', state);

    window.location.href = githubAuthUrl.toString();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text">SecurityPad</h1>
          <p className="text-muted mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* GitHub OAuth Button */}
        <button
          onClick={handleGitHubOAuth}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors mb-4"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-background text-muted">or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-text">Password</label>
              {mode === 'login' && (
                <a href="#" className="text-xs text-accent hover:text-accent/80 transition-colors">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <span className="text-sm text-muted">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </div>

        {/* Demo notice */}
        {!API_BASE && (
          <div className="mt-6 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
            <p className="text-xs text-yellow-400">
              ⚠️ Backend not connected. You&apos;re in demo mode.{' '}
              <a href="/scan/" className="underline">Try the free scan →</a>
            </p>
          </div>
        )}

        {/* Terms */}
        {mode === 'register' && (
          <p className="mt-4 text-xs text-muted text-center">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-accent hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
          </p>
        )}
      </div>
    </div>
  );
}
