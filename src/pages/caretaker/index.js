// src/pages/caretaker/index.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';

function CaretakerDashboard() {
  const { user, userProfile, logout } = useAuth();
  const [caretakerData, setCaretakerData] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchCaretakerData();
      fetchServiceRequests();
    }
  }, [user]);

  const fetchCaretakerData = async () => {
    try {
      const q = query(collection(db, 'caretakers'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCaretakerData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    } catch (error) {
      console.error('Error fetching caretaker data:', error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const q = query(collection(db, 'serviceRequests'), where('caretakerUserId', '==', user.uid));
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = serviceRequests.filter(req => filter === 'all' || req.status === filter);

  const stats = {
    total: serviceRequests.length,
    pending: serviceRequests.filter(r => r.status === 'pending').length,
    inProgress: serviceRequests.filter(r => r.status === 'in_progress').length,
    completed: serviceRequests.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">RC</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Caretaker Portal</h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-semibold text-slate-600 hidden md:block">
                Hello, {userProfile?.profile?.name}
              </span>
              <button onClick={logout} className="text-sm font-bold text-red-500 hover:text-red-600 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tasks" value={stats.total} color="blue" />
          <StatCard label="Pending" value={stats.pending} color="amber" />
          <StatCard label="Active" value={stats.inProgress} color="indigo" />
          <StatCard label="Done" value={stats.completed} color="emerald" />
        </div>

        {/* Dynamic Caretaker ID Card */}
        {caretakerData && (
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 mb-10 shadow-2xl shadow-slate-200">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">Caretaker Identity</span>
                <h2 className="text-white text-3xl font-black mt-2 mb-4">Service Profile</h2>
                <div className="flex items-center gap-3">
                  <p className="text-5xl font-mono font-black text-white bg-white/10 px-5 py-2 rounded-2xl border border-white/10">
                    {caretakerData.caretakerId}
                  </p>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(caretakerData.caretakerId);
                        alert("ID Copied to clipboard!");
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                </div>
              </div>
              <div className="hidden md:block opacity-20 transform rotate-12">
                <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
              </div>
            </div>
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col gap-6">
          
          {/* Tabs Navigation */}
          <div className="flex space-x-2 p-1 bg-slate-200/50 rounded-2xl self-start">
            {['all', 'pending', 'in_progress', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === tab 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Request Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.length === 0 ? (
              <div className="lg:col-span-2 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Queue is empty</h3>
                <p className="text-slate-500">No tasks found matching this status.</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <ServiceCard key={request.id} request={request} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-component: Stat Card
function StatCard({ label, value, color }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-4xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
      <div className={`h-1.5 w-8 rounded-full mt-3 ${colors[color].split(' ')[1]}`}></div>
    </div>
  );
}

// Sub-component: Service Request Card
function ServiceCard({ request }) {
  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
    cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Cancelled' }
  };

  const config = statusConfig[request.status] || statusConfig.pending;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
            {request.serviceName}
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">ID: {request.requestId}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Client</p>
            <p className="text-sm font-bold text-slate-800">{request.userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Scheduled</p>
            <p className="text-sm font-bold text-slate-800">{new Date(request.scheduledDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Link 
        href={`/caretaker/service/${request.id}`}
        className="block w-full text-center py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl text-sm font-black transition-all duration-300"
      >
        Manage Task
      </Link>
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