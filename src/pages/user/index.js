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
        
        if (data.linkedCaretakers && data.linkedCaretakers.length > 0) {
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
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
                Route Care - User Portal
              </h1>
              {userData && (
                <p className="text-xs text-gray-500">Welcome, {userData.profile.name}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Profile Info */}
        {userData && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Profile
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Name:</span> {userData.profile.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {userData.profile.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Phone:</span> {userData.profile.phone}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Current Location:</span> {userData.profile.currentLocation}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Hometown:</span> {userData.profile.hometown}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Property Address:</span> {userData.profile.propertyAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Linked Caretaker */}
        {caretakerData && (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Your Caretaker</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">{caretakerData.profile.name}</h3>
                <p className="text-sm opacity-90">ID: {caretakerData.caretakerId}</p>
                <p className="text-sm opacity-90">
                  <span className="font-semibold">Service Area:</span> {caretakerData.profile.serviceArea}
                </p>
                <p className="text-sm opacity-90">
                  <span className="font-semibold">Experience:</span> {caretakerData.profile.experience}
                </p>
                <p className="text-sm opacity-90">
                  <span className="font-semibold">Contact:</span> {caretakerData.profile.phone}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm mb-2">
                  <span className="font-semibold">Rating:</span> ⭐ {caretakerData.rating || 0}/5
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Completed Services:</span> {caretakerData.completedServices || 0}
                </p>
              </div>
            </div>

            {/* Services Offered */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Services Available</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {caretakerData.servicesOffered && caretakerData.servicesOffered.map((service, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition">
                    {service.image && (
                      <img src={service.image} alt={service.serviceName} className="w-full h-32 object-cover rounded mb-3" />
                    )}
                    <h5 className="font-semibold text-lg mb-1">{service.serviceName}</h5>
                    <p className="text-xs opacity-75 mb-2">{service.category.replace('_', ' ')}</p>
                    <p className="text-sm opacity-90 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold">₹{service.price}</span>
                      <span className="text-xs opacity-75">{service.duration}</span>
                    </div>
                    <Link
                      href={`/user/request-service?serviceId=${service.id}`}
                      className="block w-full text-center px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-medium transition shadow-lg"
                    >
                      Request Service
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service Requests */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Service Requests
          </h2>
          
          {serviceRequests.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No service requests yet</p>
              <p className="text-sm text-gray-400">Request a service from your caretaker above to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900">{request.serviceName}</h3>
                      <p className="text-sm text-gray-500">Request ID: {request.requestId}</p>
                    </div>
                    <span className={`px-4 py-2 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Scheduled:</span> {new Date(request.scheduledDate).toLocaleDateString()} at {request.scheduledTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Price:</span> ₹{request.servicePrice}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Caretaker:</span> {request.caretakerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Payment:</span> {request.payment?.status || 'Pending'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/user/service/${request.id}`}
                    className="inline-block px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium transition shadow-md"
                  >
                    View Details & Track
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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