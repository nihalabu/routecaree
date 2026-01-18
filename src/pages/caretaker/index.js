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
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setCaretakerData(data);
      }
    } catch (error) {
      console.error('Error fetching caretaker data:', error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const q = query(
        collection(db, 'serviceRequests'),
        where('caretakerUserId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredRequests = serviceRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const stats = {
    total: serviceRequests.length,
    pending: serviceRequests.filter(r => r.status === 'pending').length,
    inProgress: serviceRequests.filter(r => r.status === 'in_progress').length,
    completed: serviceRequests.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Route Care - Caretaker
              </h1>
              {caretakerData && (
                <p className="text-xs text-gray-500">ID: {caretakerData.caretakerId}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden md:block">
                {userProfile?.profile?.name}
              </span>
              <Link
                href="/"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <p className="text-sm opacity-90 mb-1">Total Requests</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <p className="text-sm opacity-90 mb-1">Pending</p>
            <p className="text-4xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <p className="text-sm opacity-90 mb-1">In Progress</p>
            <p className="text-4xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <p className="text-sm opacity-90 mb-1">Completed</p>
            <p className="text-4xl font-bold">{stats.completed}</p>
          </div>
        </div>

        {/* Caretaker ID Card */}
        {caretakerData && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl mb-8 transform hover:scale-[1.02] transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-3">Your Caretaker ID</h2>
                <p className="text-4xl font-mono font-bold tracking-wider mb-3 bg-white/20 px-6 py-3 rounded-lg inline-block">
                  {caretakerData.caretakerId}
                </p>
                <p className="text-sm opacity-90 max-w-md">
                  Share this ID with your clients to receive service requests
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'in_progress', label: 'In Progress', count: stats.inProgress },
                { key: 'completed', label: 'Completed', count: stats.completed }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    filter === tab.key
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Service Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white p-16 rounded-xl shadow-md text-center">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No service requests found</p>
              <p className="text-gray-400 text-sm mt-2">New requests will appear here</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{request.serviceName}</h3>
                    <p className="text-sm text-gray-500">Request ID: {request.requestId}</p>
                  </div>
                  <span className={`px-4 py-2 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Client:</span> {request.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Phone:</span> {request.userPhone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Email:</span> {request.userEmail}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Date:</span> {new Date(request.scheduledDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Time:</span> {request.scheduledTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Price:</span> ₹{request.servicePrice}
                    </p>
                  </div>
                </div>

                {request.specialRequirements && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Special Requirements:</span>
                      <br />
                      {request.specialRequirements}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/caretaker/service/${request.id}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium transition shadow-md hover:shadow-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
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