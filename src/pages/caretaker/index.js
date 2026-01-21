// src/pages/caretaker/index.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';
import { useRouter } from 'next/router';

function CaretakerDashboardContent() {
  const { user, userProfile, logout } = useAuth();
  const [caretakerData, setCaretakerData] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

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
      setServiceRequests(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCaretakerId = () => {
    if (caretakerData?.caretakerId) {
      navigator.clipboard.writeText(caretakerData.caretakerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const stats = {
    total: serviceRequests.length,
    pending: serviceRequests.filter(r => r.status === 'pending').length,
    inProgress: serviceRequests.filter(r => r.status === 'in_progress').length,
    completed: serviceRequests.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="navbar-dark sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
                <span className="text-xl font-bold text-white tracking-tight">
                  Route<span className="text-slate-300">Care</span>
                </span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-sm font-medium text-slate-300">Caretaker Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/caretaker/services" className="px-4 py-2 text-sm font-bold text-slate-200 bg-slate-700/50 rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-300 backdrop-blur-sm">
                Manage Services
              </Link>
              {userProfile?.profile?.name && (
                <span className="text-sm font-bold text-slate-200 hidden md:block px-2">
                  {userProfile.profile.name}
                </span>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-bold text-slate-200 bg-slate-700/50 rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-300 backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Caretaker ID Card */}
        {caretakerData && (
          <div className="mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Your Caretaker ID</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-bold text-slate-900">
                      {caretakerData.caretakerId}
                    </span>
                    <button
                      onClick={copyCaretakerId}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                      title="Copy ID"
                    >
                      {copiedId ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Share this ID with NRI clients to connect</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">Connected NRIs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {caretakerData.connectedNRIs?.length || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600 mt-1">Total Requests</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-500">{stats.pending}</p>
              <p className="text-sm text-slate-600 mt-1">Pending</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-600">{stats.inProgress}</p>
              <p className="text-sm text-slate-600 mt-1">In Progress</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-700">{stats.completed}</p>
              <p className="text-sm text-slate-600 mt-1">Completed</p>
            </div>
          </Card>
        </div>

        {/* Connected NRIs */}
        <div className="mb-8">
          <h3 className="mb-4">Connected NRI Clients ({caretakerData?.connectedNRIs?.length || 0})</h3>
          {!caretakerData?.connectedNRIs || caretakerData.connectedNRIs.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-slate-500">No NRI clients connected yet</p>
                <p className="text-xs text-slate-400 mt-2">When NRIs add your Caretaker ID, they will appear here</p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caretakerData.connectedNRIs.map((nri, index) => (
                <Card key={index}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-600">
                        {nri.nriName?.charAt(0) || 'N'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold">{nri.nriName || 'NRI Client'}</h4>
                      <p className="text-xs text-slate-500">
                        Connected {new Date(nri.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Service Requests */}
        <div>
          <h3 className="mb-4">Service Requests</h3>

          {serviceRequests.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="mb-2">No service requests yet</h4>
                <p className="text-sm text-slate-600">Service requests from your NRI clients will appear here</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <Card key={request.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{request.serviceName || 'Service Request'}</h4>
                        <Badge variant={request.status === 'completed' ? 'completed' : request.status === 'in_progress' ? 'in-progress' : 'pending'}>
                          {request.status?.replace('_', ' ') || 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        {request.nriName && <span>Client: {request.nriName}</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.location.href = `/caretaker/service/${request.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CaretakerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['caretaker']}>
      <CaretakerDashboardContent />
    </ProtectedRoute>
  );
}