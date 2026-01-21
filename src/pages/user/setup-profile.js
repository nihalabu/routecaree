// src/pages/user/setup-profile.js
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/shared/Button';

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
        connectedCaretakers: caretakerVerified ? [{
          caretakerId: formData.caretakerId.toUpperCase().trim(),
          caretakerUserId: caretakerInfo?.userId || '',
          caretakerName: caretakerInfo?.profile?.name || '',
          addedAt: new Date().toISOString()
        }] : [],
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
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">

          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-50" />
            <div className="relative z-10">
              <h1 className="text-4xl font-black mb-2 text-white">Setup Your Profile</h1>
              <p className="text-slate-400 font-medium text-lg">Connect your property with a trusted caretaker.</p>
            </div>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold flex items-center gap-3 animate-in fade-in">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <section className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Personal Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">WhatsApp / Phone</label>
                    <input type="tel" name="phone" required placeholder="+1..." value={formData.phone} onChange={handleChange} className="input-field" />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Location Info</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Current Residence (Country)</label>
                    <input type="text" name="currentLocation" required placeholder="USA, UAE, etc." value={formData.currentLocation} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Indian Hometown</label>
                    <input type="text" name="hometown" required placeholder="City, State" value={formData.hometown} onChange={handleChange} className="input-field" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Primary Property Address (India)</label>
                  <textarea name="propertyAddress" required rows="2" value={formData.propertyAddress} onChange={handleChange} className="input-field resize-none h-auto" />
                </div>
              </section>

              <section className="space-y-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Link Caretaker (Optional)</h2>
                    <p className="text-xs text-slate-400 mt-1">You can add a caretaker now or later</p>
                  </div>
                  {caretakerVerified && (
                    <button type="button" onClick={() => { setCaretakerVerified(false); setCaretakerInfo(null); }} className="text-[10px] font-black text-red-500 uppercase underline">Change ID</button>
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
                      className="input-field flex-1 uppercase font-black"
                    />
                    <Button onClick={verifyCaretakerId} disabled={loading} className="px-8">
                      {loading ? '...' : 'Verify'}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-5 text-lg"
              >
                {loading ? 'Finalizing...' : 'Complete My Profile'}
              </Button>
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