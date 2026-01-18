// src/pages/caretaker/index.js
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

function CaretakerDashboard() {
  const { userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-indigo-600">Route Care - Caretaker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {userProfile?.profile?.name || 'Caretaker'}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard!
          </h2>
          <p className="text-gray-600 mb-8">
            Your caretaker profile has been set up successfully. You can now manage service requests and update your availability.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              ✅ Profile created
            </p>
            <p className="text-sm text-gray-500">
              ✅ Services configured
            </p>
            <p className="text-sm text-gray-500">
              ✅ Ready to receive requests
            </p>
          </div>
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaretakerPage() {
  return (
    <ProtectedRoute allowedRoles={['caretaker']}>
      <CaretakerDashboard />
    </ProtectedRoute>
  );
}