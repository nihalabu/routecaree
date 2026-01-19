// src/pages/user/index.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';

function UserDashboard() {
  const { user, userProfile, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [caretakerData, setCaretakerData] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchServiceRequests();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const q = query(collection(db, 'nriUsers'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData(data);
        
        if (data.linkedCaretakers?.length > 0) {
          await fetchCaretakerData(data.linkedCaretakers[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaretakerData = async (caretakerId) => {
    try {
      const q = query(collection(db, 'caretakers'), where('caretakerId', '==', caretakerId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCaretakerData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    } catch (error) {
      console.error('Error fetching caretaker:', error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const q = query(collection(db, 'serviceRequests'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServiceRequests(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return badges[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse font-black text-indigo-600">Loading Dashboard...</div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">Route<span className="text-indigo-600">Care.</span></span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Command Center</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/user/search" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Find Services</Link>
            <button onClick={logout} className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-black hover:bg-rose-100 transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Welcome Section */}
        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">Hello, {userData?.profile?.name || 'User'}!</h1>
            <p className="text-slate-500 font-medium italic">Managing property at: {userData?.profile?.propertyAddress || 'No address set'}</p>
          </div>
          <Link href="/user/setup-profile" className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition">Edit Profile</Link>
        </section>

        {/* Linked Caretaker Section */}
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Assigned Caretaker</h2>
          {caretakerData ? (
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black uppercase">{caretakerData.profile.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-3xl font-black">{caretakerData.profile.name}</h3>
                      <p className="text-indigo-100 font-bold opacity-80">Caretaker ID: {caretakerData.caretakerId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Experience</p>
                        <p className="font-bold">{caretakerData.profile.experience}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Phone</p>
                        <p className="font-bold">{caretakerData.profile.phone}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Rating</p>
                        <p className="font-bold">⭐ {caretakerData.rating || 0}/5</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <h4 className="font-black text-sm uppercase mb-4 tracking-wider">Quick Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-sm shadow-lg shadow-indigo-900/20">Message Caretaker</button>
                    <button className="w-full py-3 bg-indigo-500 text-white border border-indigo-400 rounded-xl font-black text-sm">Emergency Call</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-400 font-bold mb-4">No caretaker assigned to your property yet.</p>
              <Link href="/user/search" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black inline-block shadow-lg shadow-indigo-100">Link a Caretaker ID</Link>
            </div>
          )}
        </section>

        {/* Available Services Grid */}
        {caretakerData?.servicesOffered && (
          <section>
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Services from {caretakerData.profile.name}</h2>
             <div className="grid md:grid-cols-3 gap-6">
                {caretakerData.servicesOffered.map((service) => (
                  <div key={service.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">{service.category.replace('_', ' ')}</span>
                      <p className="text-xl font-black text-slate-900">₹{service.price}</p>
                    </div>
                    <h4 className="font-black text-slate-800 mb-2 truncate">{service.serviceName}</h4>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">{service.description}</p>
                    <Link href={`/user/service/${service.id}`} className="block w-full text-center py-3 bg-slate-50 text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-50 transition border border-transparent hover:border-indigo-100">Book Service</Link>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Service Requests List */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Recent Service Requests</h2>
            <Link href="/user/all-requests" className="text-xs font-black text-indigo-600 hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {serviceRequests.length > 0 ? (
              serviceRequests.map((request) => (
                <div key={request.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 hover:border-indigo-200 transition group">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${request.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
                    <div>
                      <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition">{request.serviceName}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{request.requestId} • {new Date(request.scheduledDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className={`px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadge(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </div>
                    <Link href={`/user/service/${request.id}`} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100">
                <p className="text-slate-400 font-bold">No activity history yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function UserPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <UserDashboard />
    </ProtectedRoute>
  );
}