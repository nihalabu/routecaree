// src/pages/user/service/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ServiceRequestDetails() {
  const router = useRouter();
  const { id } = router.query; // This is the Firestore Document ID
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const docRef = doc(db, 'serviceRequests', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRequest(docSnap.data());
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Loading Tracking Details...</div>;

  if (!request) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h2 className="text-2xl font-black text-slate-900 mb-4">Request Not Found</h2>
      <button onClick={() => router.push('/user')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Back to Dashboard</button>
    </div>
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/user')} className="text-slate-400 hover:text-indigo-600 transition mb-8 font-black text-xs uppercase tracking-widest flex items-center gap-2">
          ← Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Header Section */}
          <div className="p-10 border-b border-slate-50 flex justify-between items-start">
            <div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
              <h1 className="text-4xl font-black text-slate-900 mt-4">{request.serviceName}</h1>
              <p className="text-slate-400 font-bold mt-1">ID: {request.requestId}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled For</p>
              <p className="text-xl font-black text-slate-900">{new Date(request.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-indigo-600 font-bold uppercase text-sm italic">{request.scheduledTime}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-10 grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Location</h3>
                <p className="text-slate-700 font-bold leading-relaxed">{request.serviceAddress}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Caretaker</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600 text-sm">
                    {request.caretakerName?.charAt(0)}
                  </div>
                  <p className="text-slate-900 font-black">{request.caretakerName}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Payment Summary</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-bold">Service Fee</span>
                <span className="text-slate-900 font-black">₹{request.servicePrice}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-slate-900 font-black text-lg">Total</span>
                <span className="text-indigo-600 font-black text-2xl">₹{request.servicePrice}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Status: {request.payment?.status}</p>
            </div>
          </div>

          {request.specialRequirements && (
            <div className="px-10 pb-10">
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900">
                <h3 className="text-[10px] font-black uppercase mb-2">Notes for Caretaker:</h3>
                <p className="font-medium text-sm italic">"{request.specialRequirements}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <ServiceRequestDetails />
    </ProtectedRoute>
  );
}