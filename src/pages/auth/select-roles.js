// src/pages/auth/select-role.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      ensureUserDocument();
    }
  }, [user]);

  const ensureUserDocument = async () => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: '', 
        profile: {
          name: user.displayName || '',
          phone: '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString()
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error ensuring user document:', error);
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      await updateUserProfile({ role: selectedRole });
      
      if (selectedRole === 'caretaker') {
        router.push('/caretaker/setup-profile');
      } else {
        router.push('/user/setup-profile');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Welcome to Route Care
          </h1>
          <p className="text-lg text-gray-600">
            Tell us how you plan to use the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Caretaker Option */}
          <div
            onClick={() => setSelectedRole('caretaker')}
            className={`group relative p-8 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
              selectedRole === 'caretaker'
                ? 'border-blue-600 ring-4 ring-blue-50 shadow-xl'
                : 'border-gray-100 hover:border-blue-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                selectedRole === 'caretaker' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Service Professional</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                I want to provide home maintenance, property inspection, and care services.
              </p>
              <div className="w-full space-y-3">
                <FeatureItem text="List your services" />
                <FeatureItem text="Manage task requests" />
                <FeatureItem text="Secure payment processing" />
              </div>
            </div>
          </div>

          {/* User (NRI) Option */}
          <div
            onClick={() => setSelectedRole('user')}
            className={`group relative p-8 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
              selectedRole === 'user'
                ? 'border-emerald-600 ring-4 ring-emerald-50 shadow-xl'
                : 'border-gray-100 hover:border-emerald-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                selectedRole === 'user' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Property Owner / NRI</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                I need to book trusted services for my properties and family in India.
              </p>
              <div className="w-full space-y-3">
                <FeatureItem text="Real-time task tracking" />
                <FeatureItem text="Verified caretakers" />
                <FeatureItem text="View proof of completion" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || loading}
          className="btn-primary flex items-center justify-center gap-3 py-4 shadow-xl active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Updating your profile...</span>
            </>
          ) : (
            'Confirm Role & Continue'
          )}
        </button>
      </div>
    </div>
  );
}

// Helper component for the feature checkmarks
function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg group-hover:bg-white transition-colors">
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span>{text}</span>
    </div>
  );
}