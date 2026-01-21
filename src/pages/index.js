// src/pages/index.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default function Home() {
  const { user, userProfile } = useAuth();
  const [isFullyRegistered, setIsFullyRegistered] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.role) {
      if (userProfile.role === 'caretaker') {
        setIsFullyRegistered(!!userProfile.caretakerId);
      } else {
        setIsFullyRegistered(true);
      }
    }
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="navbar-dark fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-900/90 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-tighter">
                Route<span className="text-slate-300">Care</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              {user && userProfile && userProfile.role && isFullyRegistered ? (
                <>
                  <span className="text-sm font-bold text-slate-300 hidden md:block px-2">
                    {userProfile?.profile?.name || user?.email}
                  </span>
                  <Link
                    href={userProfile.role === 'caretaker' ? '/caretaker' : '/user'}
                    className="text-sm font-bold text-slate-100 hover:text-white transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to logout?')) {
                        const { signOut } = await import('firebase/auth');
                        const { auth } = await import('@/lib/firebase/config');
                        await signOut(auth);
                        window.location.href = '/';
                      }
                    }}
                    className="text-sm font-bold text-slate-100 hover:text-white transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-bold text-slate-100 hover:text-white transition">
                    Sign In
                  </Link>
                  <Button size="sm" onClick={() => window.location.href = '/auth/signup'}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-24 overflow-hidden bg-slate-950">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            Trusted Home Care for <span className="text-amber-400">NRIs</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 opacity-90">
            Professional property management and care services. Stay connected with your loved ones through our network of verified professionals.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Button size="lg" className="px-10 py-5 text-lg shadow-2xl shadow-slate-900/50" onClick={() => window.location.href = '/auth/signup'}>
              Get Started Free
            </Button>
            <Button size="lg" variant="secondary" className="px-10 py-5 text-lg bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-xl" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See Features
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-12 max-w-3xl mx-auto border-t border-white/5 pt-16">
            <div className="group">
              <div className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 tracking-tighter">100+</div>
              <div className="text-xs font-black text-slate-300 mt-3 uppercase tracking-[0.2em] opacity-80">Active Families</div>
            </div>
            <div className="group">
              <div className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 tracking-tighter">50+</div>
              <div className="text-xs font-black text-slate-300 mt-3 uppercase tracking-[0.2em] opacity-80">Professionals</div>
            </div>
            <div className="group">
              <div className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300 tracking-tighter">500+</div>
              <div className="text-xs font-black text-slate-300 mt-3 uppercase tracking-[0.2em] opacity-80">Tasks Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Complete Care Solutions</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Professional services meticulously designed for your peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              title="Property Management"
              desc="Maintenance, security, and verification for your home or investment properties in India."
              icon={<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
            />
            <FeatureCard
              title="Elderly Assistance"
              desc="Dedicated care and regular visits to ensure your parents are always supported and safe."
              icon={<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
            />
            <FeatureCard
              title="Task Management"
              desc="Track and manage everything from bill payments to home repairs via real-time updates."
              icon={<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-4">
            Route<span className="text-slate-400">Care</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 RouteCare. Bridging the gap between NRIs and home.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <Card className="hover-lift p-8 group border-slate-100 bg-white">
      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-300">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">
        {desc}
      </p>
    </Card>
  );
}