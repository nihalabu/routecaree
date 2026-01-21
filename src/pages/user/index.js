// src/pages/user/index.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { collection, query, where, getDocs, updateDoc, setDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';
import { useRouter } from 'next/router';

function UserDashboardContent() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [caretakerData, setCaretakerData] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCaretakerModal, setShowAddCaretakerModal] = useState(false);
  const [caretakerId, setCaretakerId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [addError, setAddError] = useState('');
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [removingCaretaker, setRemovingCaretaker] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for NRI user document
    const q = query(collection(db, 'nriUsers'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData(data);

        // Fetch connected caretakers
        if (data.connectedCaretakers && data.connectedCaretakers.length > 0) {
          try {
            const caretakers = await Promise.all(
              data.connectedCaretakers.map(conn => fetchCaretakerData(conn.caretakerId))
            );
            const validCaretakers = caretakers.filter(c => c !== null);
            setCaretakerData(validCaretakers.length > 0 ? validCaretakers[0] : null);
          } catch (error) {
            console.error('Error fetching caretakers:', error);
          }
        } else {
          setCaretakerData(null);
        }
      } else {
        setUserData(null);
        setCaretakerData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('onSnapshot error:', error);
      setLoading(false);
    });

    fetchServiceRequests();

    return () => unsubscribe();
  }, [user]);

  const fetchUserData = () => {
    // This is now handled by the onSnapshot listener in useEffect
    return;
  };

  const fetchCaretakerData = async (caretakerId) => {
    try {
      const q = query(collection(db, 'caretakers'), where('caretakerId', '==', caretakerId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching caretaker:', error);
      return null;
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

  const handleAddCaretaker = async () => {
    const trimmedId = caretakerId.trim().toUpperCase();

    if (!trimmedId) {
      setAddError('Please enter a Caretaker ID');
      return;
    }

    if (!/^CT-[A-Z0-9]{6}$/.test(trimmedId)) {
      setAddError('Invalid ID format. Should be CT-XXXXXX (e.g., CT-A1B2C3)');
      return;
    }

    setVerifying(true);
    setAddError('');

    try {
      // Check if already connected
      if (userData?.connectedCaretakers?.some(c => c.caretakerId === trimmedId)) {
        setAddError('This caretaker is already connected to your account');
        setVerifying(false);
        return;
      }

      // Find the caretaker
      const caretakerQuery = query(
        collection(db, 'caretakers'),
        where('caretakerId', '==', trimmedId)
      );
      const caretakerSnapshot = await getDocs(caretakerQuery);

      if (caretakerSnapshot.empty) {
        setAddError('Caretaker ID not found. Please check with your caretaker.');
        setVerifying(false);
        return;
      }

      const caretakerDocRef = caretakerSnapshot.docs[0].ref;
      const caretakerDocData = caretakerSnapshot.docs[0].data();

      // Find or create NRI user document
      const userQuery = query(collection(db, 'nriUsers'), where('userId', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);

      let userDocRef;
      let currentCaretakers = [];

      if (userSnapshot.empty) {
        // Create new NRI user document
        console.log('Creating new NRI user document');
        const newUserRef = doc(collection(db, 'nriUsers'));
        userDocRef = newUserRef;

        await setDoc(newUserRef, {
          userId: user.uid,
          email: user.email,
          profile: userData?.profile || userProfile?.profile || {},
          connectedCaretakers: [{
            caretakerId: trimmedId,
            caretakerUserId: caretakerDocData.userId,
            caretakerName: caretakerDocData.profile?.name || '',
            addedAt: new Date().toISOString()
          }],
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing document
        userDocRef = userSnapshot.docs[0].ref;
        currentCaretakers = userData?.connectedCaretakers || [];

        await updateDoc(userDocRef, {
          connectedCaretakers: [...currentCaretakers, {
            caretakerId: trimmedId,
            caretakerUserId: caretakerDocData.userId,
            caretakerName: caretakerDocData.profile?.name || '',
            addedAt: new Date().toISOString()
          }]
        });
      }

      // Update caretaker's connectedNRIs
      const currentNRIs = caretakerDocData.connectedNRIs || [];
      await updateDoc(caretakerDocRef, {
        connectedNRIs: [...currentNRIs, {
          nriUserId: user.uid,
          nriName: userData?.profile?.name || userProfile?.profile?.name || user.email || 'NRI User',
          addedAt: new Date().toISOString()
        }]
      });

      // Refresh data and close modal
      await fetchUserData();
      setShowAddCaretakerModal(false);
      setCaretakerId('');
      setAddError('');
      alert('Caretaker added successfully!');
    } catch (error) {
      console.error('Error adding caretaker:', error);
      setAddError(`Failed to add caretaker: ${error.message || 'Please try again.'}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveCaretaker = async (caretakerToRemove) => {
    // Validate input
    if (!caretakerToRemove) {
      alert('Invalid caretaker data');
      return;
    }

    const caretakerIdToRemove = caretakerToRemove.caretakerId;
    if (!caretakerIdToRemove) {
      console.error('Caretaker ID missing:', caretakerToRemove);
      alert('Error: Caretaker ID not found');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${caretakerToRemove.profile?.name || 'this caretaker'}?`)) {
      return;
    }

    setRemovingCaretaker(true);
    try {
      // 1. Remove from NRI's connectedCaretakers
      const userQuery = query(collection(db, 'nriUsers'), where('userId', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;
        const currentCaretakers = userData?.connectedCaretakers || [];
        const updatedCaretakers = currentCaretakers.filter(c => c.caretakerId !== caretakerIdToRemove);

        await updateDoc(userDocRef, {
          connectedCaretakers: updatedCaretakers
        });

        // Update local state
        setUserData({ ...userData, connectedCaretakers: updatedCaretakers });
      }

      // 2. Remove from Caretaker's connectedNRIs
      const caretakerQuery = query(collection(db, 'caretakers'), where('caretakerId', '==', caretakerIdToRemove));
      const caretakerSnapshot = await getDocs(caretakerQuery);

      if (!caretakerSnapshot.empty) {
        const caretakerDocRef = caretakerSnapshot.docs[0].ref;
        const fetchedCaretakerData = caretakerSnapshot.docs[0].data();
        const currentNRIs = fetchedCaretakerData.connectedNRIs || [];
        const updatedNRIs = currentNRIs.filter(n => n.nriUserId !== user.uid);

        await updateDoc(caretakerDocRef, {
          connectedNRIs: updatedNRIs
        });
      }

      // Clear caretaker data and refresh
      setCaretakerData(null);
      alert('Caretaker removed successfully');

      // Refresh user data to ensure UI is in sync
      await fetchUserData();
    } catch (error) {
      console.error('Error removing caretaker:', error);
      alert(`Failed to remove caretaker: ${error.message}`);
    } finally {
      setRemovingCaretaker(false);
    }
  };

  const openServicesModal = (services) => {
    setSelectedServices(services || []);
    setShowServicesModal(true);
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
                <span className="text-sm font-medium text-slate-300">NRI Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {(userData?.profile?.name || userProfile?.profile?.name) && (
                <span className="text-sm font-bold text-slate-200 hidden md:block px-2">
                  {userData?.profile?.name || userProfile?.profile?.name}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2">Welcome back, {userData?.profile?.name?.split(' ')[0] || 'User'}!</h2>
          <p className="text-slate-600">Manage your property and care services</p>
        </div>

        {/* Caretaker Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3>Your Caretakers</h3>
            <Button size="sm" onClick={() => setShowAddCaretakerModal(true)}>
              + Add Caretaker
            </Button>
          </div>

          {!caretakerData ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="mb-2">No caretaker connected</h4>
                <p className="text-sm text-slate-600 mb-4">Add a trusted professional to manage your property</p>
                <Button size="sm" onClick={() => setShowAddCaretakerModal(true)}>
                  Add Caretaker by ID
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {caretakerData.profile?.name?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <h4 className="mb-1">{caretakerData.profile?.name}</h4>
                    <p className="text-sm text-slate-600 mb-2">{caretakerData.profile?.serviceArea || 'Service Provider'}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                        {caretakerData.caretakerId}
                      </span>
                      <Badge variant="completed">Verified</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Contact</p>
                    <p className="text-sm font-medium">{caretakerData.profile?.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openServicesModal(caretakerData.servicesOffered)}
                    >
                      View Services
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveCaretaker(caretakerData)}
                      disabled={removingCaretaker}
                    >
                      {removingCaretaker ? 'Removing...' : 'Remove'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Service Requests */}
        <div>
          <h3 className="mb-4">Recent Service Requests</h3>

          {serviceRequests.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="mb-2">No service requests yet</h4>
                <p className="text-sm text-slate-600">Your service requests will appear here</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {serviceRequests.slice(0, 5).map((request) => (
                <Card key={request.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{request.serviceName || 'Service Request'}</h4>
                        <Badge variant={request.status === 'completed' ? 'completed' : request.status === 'in_progress' ? 'in-progress' : 'pending'}>
                          {request.status?.replace('_', ' ') || 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{request.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/user/request/${request.id}`)}
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

      {/* Add Caretaker Modal */}
      {showAddCaretakerModal && (
        <div className="modal-overlay">
          <div className="modal-content p-8">
            <div className="flex justify-between items-center mb-6">
              <h3>Add Caretaker</h3>
              <button
                onClick={() => {
                  setShowAddCaretakerModal(false);
                  setCaretakerId('');
                  setAddError('');
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {addError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Caretaker ID
                </label>
                <input
                  type="text"
                  value={caretakerId}
                  onChange={(e) => setCaretakerId(e.target.value)}
                  placeholder="Enter ID (e.g., CT-A1B2C3)"
                  className="input uppercase"
                />
                <p className="text-xs text-slate-500 mt-2">Ask your caretaker for their unique ID</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddCaretakerModal(false);
                    setCaretakerId('');
                    setAddError('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCaretaker}
                  disabled={verifying || !caretakerId.trim()}
                  className="flex-1"
                >
                  {verifying ? 'Verifying...' : 'Add Caretaker'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Modal */}
      {showServicesModal && (
        <div className="modal-overlay">
          <div className="modal-content p-8 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3>Available Services</h3>
              <button
                onClick={() => setShowServicesModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedServices.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>This caretaker hasn't listed any services yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {selectedServices.map((service, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-base font-bold text-slate-900">{service.serviceName}</h4>
                      <div className="text-right">
                        <span className="block text-indigo-600 font-bold">₹{service.price}</span>
                        <span className="text-xs text-slate-500">{service.duration}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded uppercase font-bold tracking-wider">
                        {service.category?.replace('_', ' ')}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowServicesModal(false);
                          router.push(`/user/request-service?serviceId=${service.id}`);
                        }}
                      >
                        Request Service
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setShowServicesModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}