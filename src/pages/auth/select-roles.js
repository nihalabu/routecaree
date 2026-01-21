// src/pages/auth/select-roles.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Button from '@/components/shared/Button';

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
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const updateData = {
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString()
      };

      // Only set profile fields if they don't exist yet or if auth has them
      if (!userDocSnap.exists() || !userDocSnap.data()?.profile?.name) {
        updateData.profile = {
          name: user.displayName || '',
          phone: '',
          photoURL: user.photoURL || '',
          createdAt: userDocSnap.exists() ? userDocSnap.data().profile?.createdAt : new Date().toISOString()
        };
      }

      await setDoc(userDocRef, updateData, { merge: true });
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
            Welcome to Route<span className="text-slate-400">Care</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium tracking-tight">
            Tell us how you plan to use the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Caretaker Option */}
          <div
            onClick={() => setSelectedRole('caretaker')}
            className={`group relative p-10 bg-white border-2 rounded-[2.5rem] cursor-pointer transition-all duration-500 transform hover:-translate-y-2 ${selectedRole === 'caretaker'
              ? 'border-slate-900 ring-8 ring-slate-100 shadow-2xl'
              : 'border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${selectedRole === 'caretaker' ? 'bg-slate-900 text-white scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Caretaker</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 opacity-90">
                I provide home maintenance, property care, and elderly care services to clients.
              </p>
              <div className="w-full space-y-4">
                <FeatureItem text="List professional services" />
                <FeatureItem text="Manage task requests" />
                <FeatureItem text="Secure payouts" />
              </div>
            </div>
            {selectedRole === 'caretaker' && (
              <div className="absolute -top-3 -right-3 bg-slate-900 text-white p-2 rounded-full shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>

          {/* User (NRI) Option */}
          <div
            onClick={() => setSelectedRole('user')}
            className={`group relative p-10 bg-white border-2 rounded-[2.5rem] cursor-pointer transition-all duration-500 transform hover:-translate-y-2 ${selectedRole === 'user'
              ? 'border-slate-900 ring-8 ring-slate-100 shadow-2xl'
              : 'border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${selectedRole === 'user' ? 'bg-slate-900 text-white scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">NRI Owner</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 opacity-90">
                I need trusted professionals to manage my property and care for my family.
              </p>
              <div className="w-full space-y-4">
                <FeatureItem text="Real-time task tracking" />
                <FeatureItem text="Verified caretakers" />
                <FeatureItem text="Photo/Video proof" />
              </div>
            </div>
            {selectedRole === 'user' && (
              <div className="absolute -top-3 -right-3 bg-slate-900 text-white p-2 rounded-full shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleRoleSelection}
          disabled={!selectedRole || loading}
          className="w-full py-5 text-xl animate-in fade-in slide-in-from-bottom-2 duration-700"
        >
          {loading ? 'Finalizing your selection...' : 'Continue to Dashboard'}
        </Button>
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl group-hover:bg-white transition-colors">
      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span>{text}</span>
    </div>
  );
}