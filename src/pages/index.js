// src/pages/index.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, userProfile, checkRegistrationStatus } = useAuth();
  const [isFullyRegistered, setIsFullyRegistered] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (user && userProfile && userProfile.role) {
        const registered = await checkRegistrationStatus(user.uid, userProfile.role);
        setIsFullyRegistered(registered);
      } else {
        setIsFullyRegistered(false);
      }
      setCheckingStatus(false);
    };
    
    checkStatus();
  }, [user, userProfile]);

  // Show loading state while checking auth
  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Route Care</span>
              <span className="ml-2 text-xs font-medium text-gray-500 hidden sm:block">Guardian Homes</span>
            </div>
            <div className="flex items-center space-x-4">
              {user && userProfile && userProfile.role && isFullyRegistered ? (
                <>
                  <Link 
                    href={userProfile.role === 'caretaker' ? '/caretaker' : '/user'} 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
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
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition text-sm">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Home Care
              <span className="block text-blue-600 mt-2">For NRIs Worldwide</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Trusted property management and elderly care services. Stay connected with your home and loved ones through verified professionals and real-time updates.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Start Free Today
              </Link>
              <a 
                href="#features"
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-base font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">100+</div>
              <div className="text-sm text-gray-600 mt-2">Active Families</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600 mt-2">Verified Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600 mt-2">Services Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Complete Care Solutions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Professional services designed for peace of mind</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Property Management</h3>
              <p className="text-gray-600 leading-relaxed">Comprehensive maintenance, cleaning, and inspection services to keep your property in excellent condition.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Elderly Care</h3>
              <p className="text-gray-600 leading-relaxed">Dedicated support for your parents with regular checkups, assistance, and detailed health monitoring.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Monitoring</h3>
              <p className="text-gray-600 leading-relaxed">Track service progress in real-time with updates, documentation, and direct communication channels.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, Reliable Process</h2>
            <p className="text-lg text-gray-600">Get started in minutes</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Quick registration process' },
              { step: '2', title: 'Select Services', desc: 'Choose from verified providers' },
              { step: '3', title: 'Monitor Progress', desc: 'Real-time status updates' },
              { step: '4', title: 'Stay Informed', desc: 'Complete documentation' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join professionals worldwide who trust Route Care for comprehensive home management
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-base font-bold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Route Care</h3>
              <p className="text-gray-400 text-sm">Professional home care solutions for NRIs worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Contact</h4>
              <p className="text-gray-400 text-sm">support@routecare.com</p>
              <p className="text-gray-400 text-sm">+91-XXXXXXXXXX</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">&copy; 2026 Route Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}