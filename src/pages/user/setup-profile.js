// src/pages/user/setup-profile.js
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function UserProfileSetupContent() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: userProfile?.profile?.name || '',
    phone: '',
    currentLocation: '',
    hometown: '',
    propertyAddress: '',
    caretakerId: ''
  });

  const [caretakerVerified, setCaretakerVerified] = useState(false);
  const [caretakerInfo, setCaretakerInfo] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const verifyCaretakerId = async () => {
    if (!formData.caretakerId.trim()) {
      setError('Please enter a Caretaker ID');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const q = query(
        collection(db, 'caretakers'),
        where('caretakerId', '==', formData.caretakerId.toUpperCase().trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Caretaker ID not found. Please check with your caretaker.');
        setCaretakerVerified(false);
        setCaretakerInfo(null);
      } else {
        const caretakerData = snapshot.docs[0].data();
        setCaretakerInfo(caretakerData);
        setCaretakerVerified(true);
        setError('');
      }
    } catch (err) {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caretakerVerified) {
      setError('Please verify the Caretaker ID first');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        userId: user.uid,
        profile: {
          name: formData.name,
          email: user.email,
          phone: formData.phone,
          currentLocation: formData.currentLocation,
          hometown: formData.hometown,
          propertyAddress: formData.propertyAddress,
          photoURL: userProfile?.profile?.photoURL || ''
        },
        linkedCaretakers: [formData.caretakerId.toUpperCase().trim()],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'nriUsers'), userData);
      router.push('/user');
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          
          <div className="bg-indigo-600 p-10 text-white">
            <h1 className="text-3xl font-black mb-2">Setup Your Profile</h1>
            <p className="text-indigo-100 font-medium">Connect your property with a trusted caretaker.</p>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-bold flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Section 1: Identity */}
              <section className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Personal Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">WhatsApp / Phone</label>
                    <input type="tel" name="phone" required placeholder="+1..." value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition" />
                  </div>
                </div>
              </section>

              {/* Section 2: Location */}
              <section className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Location Info</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Current Residence (Country)</label>
                    <input type="text" name="currentLocation" required placeholder="USA, UAE, etc." value={formData.currentLocation} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Indian Hometown</label>
                    <input type="text" name="hometown" required placeholder="City, State" value={formData.hometown} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Primary Property Address (India)</label>
                  <textarea name="propertyAddress" required rows="2" value={formData.propertyAddress} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition" />
                </div>
              </section>

              {/* Section 3: Caretaker Linking */}
              <section className="space-y-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Link Caretaker</h2>
                  {caretakerVerified && (
                    <button type="button" onClick={() => {setCaretakerVerified(false); setCaretakerInfo(null);}} className="text-[10px] font-black text-rose-500 uppercase underline">Change ID</button>
                  )}
                </div>

                {!caretakerVerified ? (
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      name="caretakerId" 
                      placeholder="ENTER ID (e.g. CT-XXXX)" 
                      value={formData.caretakerId} 
                      onChange={handleChange} 
                      className="flex-1 px-5 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-black transition uppercase"
                    />
                    <button type="button" onClick={verifyCaretakerId} disabled={loading} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200 disabled:opacity-50">
                      {loading ? '...' : 'Verify'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{caretakerInfo?.profile?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Verified Provider • {caretakerInfo?.profile?.serviceArea}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <button 
                type="submit" 
                disabled={loading || !caretakerVerified} 
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? 'Finalizing...' : 'Complete My Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfileSetup() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <UserProfileSetupContent />
    </ProtectedRoute>
  );
}