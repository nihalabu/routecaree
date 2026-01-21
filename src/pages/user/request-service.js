// src/pages/user/request-service.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function RequestServiceContent() {
  const router = useRouter();
  const { serviceId } = router.query;
  const { user } = useAuth();

  const [userData, setUserData] = useState(null);
  const [caretakerData, setCaretakerData] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '10:00',
    serviceAddress: '',
    specialRequirements: ''
  });

  useEffect(() => {
    if (user && serviceId) {
      fetchData();
    }
  }, [user, serviceId]);

  const fetchData = async () => {
    try {
      const userQuery = query(collection(db, 'nriUsers'), where('userId', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userInfo = userSnapshot.docs[0].data();
        setUserData(userInfo);
        setFormData(prev => ({ ...prev, serviceAddress: userInfo.profile.propertyAddress }));

        if (userInfo.linkedCaretakers?.length > 0) {
          const caretakerQuery = query(
            collection(db, 'caretakers'),
            where('caretakerId', '==', userInfo.linkedCaretakers[0])
          );
          const caretakerSnapshot = await getDocs(caretakerQuery);

          if (!caretakerSnapshot.empty) {
            const caretakerInfo = caretakerSnapshot.docs[0].data();
            setCaretakerData(caretakerInfo);
            const service = caretakerInfo.servicesOffered.find(s => s.id === serviceId);
            setSelectedService(service);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRequestId = () => `REQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requestData = {
        requestId: generateRequestId(),
        userId: user.uid,
        userName: userData.profile.name,
        userEmail: userData.profile.email,
        userPhone: userData.profile.phone,
        caretakerId: caretakerData.caretakerId,
        caretakerUserId: caretakerData.userId,
        caretakerName: caretakerData.profile.name,
        serviceId: selectedService.id,
        serviceName: selectedService.serviceName,
        serviceCategory: selectedService.category,
        servicePrice: selectedService.price,
        serviceAddress: formData.serviceAddress,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        specialRequirements: formData.specialRequirements,
        status: 'pending',
        payment: { amount: selectedService.price, status: 'pending' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'serviceRequests'), requestData);
      router.push('/user?booking=success');
    } catch (error) {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Initializing Request...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-4xl mx-auto px-6">

        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition mb-8 font-black text-xs uppercase tracking-widest">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Services
        </button>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Schedule Service</h1>
              <p className="text-slate-500 mb-10 font-medium">Coordinate with your caretaker for the perfect time.</p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                    <select
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold appearance-none"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    >
                      {["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Property Address</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                    value={formData.serviceAddress}
                    onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions for Caretaker</label>
                  <textarea
                    rows="4"
                    placeholder="e.g. Please check the garden pipes as well..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-slate-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-slate-700 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {submitting ? "Sending Request..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>

          {/* Service Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white sticky top-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300 mb-8">Summary</h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <h4 className="text-2xl font-black mb-1">{selectedService?.serviceName}</h4>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase border border-white/10 italic">
                    {selectedService?.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">Total Cost</p>
                    <p className="text-4xl font-black">₹{selectedService?.price}</p>
                  </div>
                  <p className="text-sm font-bold opacity-60 italic">{selectedService?.duration}</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] font-black uppercase text-indigo-300 mb-2">Service Provider</p>
                  <p className="font-bold text-lg">{caretakerData?.profile?.name}</p>
                  <p className="text-xs opacity-60 font-medium">Expertise: {caretakerData?.profile?.experience}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RequestService() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <RequestServiceContent />
    </ProtectedRoute>
  );
}