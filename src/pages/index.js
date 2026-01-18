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
      }
      setCheckingStatus(false);
    };
    
    checkStatus();
  }, [user, userProfile]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Route Care
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {!checkingStatus && user && userProfile && userProfile.role && isFullyRegistered ? (
                <Link 
                  href={userProfile.role === 'caretaker' ? '/caretaker' : '/user'} 
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition">
                    Login
                  </Link>
                  <Link href="/auth/signup" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Guardian Homes
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                For NRIs Worldwide
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Remotely manage your homes, properties, and take care of your elderly parents 
              living in your hometown with verified caretakers and real-time updates.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link 
                href="/auth/signup"
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Free Today
                <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a 
                href="#features"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full text-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">100+</div>
              <div className="text-sm text-gray-600 mt-2">Happy Families</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">50+</div>
              <div className="text-sm text-gray-600 mt-2">Verified Caretakers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">500+</div>
              <div className="text-sm text-gray-600 mt-2">Services Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Comprehensive care for your home and loved ones</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Home Maintenance</h3>
              <p className="text-gray-600 leading-relaxed">Regular cleaning, repairs, and property inspection to keep your home in perfect condition.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Parent Care</h3>
              <p className="text-gray-600 leading-relaxed">Dedicated care for elderly parents with regular checkups and detailed health updates.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Monitor service progress with live updates, photos, and direct communication.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple process, powerful results</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Sign Up', desc: 'Create your account in minutes' },
              { step: 2, title: 'Choose Service', desc: 'Select from verified caretakers' },
              { step: 3, title: 'Track Progress', desc: 'Get real-time updates' },
              { step: 4, title: 'Stay Connected', desc: 'Rate and review services' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of NRIs who trust Route Care for their family's wellbeing
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
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
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Route Care</h3>
              <p className="text-gray-400 text-sm">Bringing peace of mind to NRIs worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">Email: support@routecare.com</p>
              <p className="text-gray-400 text-sm">Phone: +91-XXXXXXXXXX</p>
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