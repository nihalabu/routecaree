// src/pages/auth/login.js
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/shared/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format. Please check your email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-20 xl:px-24 bg-white shadow-2xl z-10">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
              Welcome back
            </h2>
            <p className="mt-3 text-slate-500 text-lg">
              New to Route Care?{' '}
              <Link href="/auth/signup" className="font-semibold text-slate-700 hover:text-slate-900 transition-colors underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-slate-700 focus:ring-slate-500 border-slate-300 rounded transition cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>

              <Link href="/auth/forgot-password" hidden className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Branding Overlay */}
      <div className="hidden lg:flex relative w-0 flex-1 bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-20 text-white">
          <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-xl mb-10 border border-white/10 shadow-2xl">
            <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            Route<span className="text-cyan-400">Care</span>
          </h1>
          <p className="text-xl font-medium text-white mb-12 text-center max-w-md leading-relaxed opacity-95">
            Connecting NRIs with trusted home management and elderly care professionals.
          </p>

          <div className="grid grid-cols-3 gap-12 border-t border-white/10 pt-12 mt-4 w-full max-w-lg">
            <StatBlock count="100+" label="Active Users" />
            <StatBlock count="50+" label="Caretakers" />
            <StatBlock count="500+" label="Tasks Done" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ count, label }) {
  return (
    <div className="text-center group">
      <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform duration-300">{count}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-200 mt-2 opacity-90">{label}</div>
    </div>
  );
}