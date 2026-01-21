// src/pages/caretaker/services.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';

function CaretakerServicesContent() {
    const { user, userProfile } = useAuth();
    const [caretakerData, setCaretakerData] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        serviceName: '',
        category: 'home_maintenance',
        description: '',
        price: '',
        duration: '',
        image: ''
    });

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 800;
                    let width = img.width, height = img.height;
                    if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
                    else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                    canvas.width = width; canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024) {
            alert('Image size should be less than 1MB');
            return;
        }
        const base64 = await compressImage(file);
        setFormData({ ...formData, image: base64 });
    };

    useEffect(() => {
        if (user) {
            fetchCaretakerData();
        }
    }, [user]);

    const fetchCaretakerData = async () => {
        try {
            const q = query(collection(db, 'caretakers'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const data = { id: snapshot.docs[0].id, ref: snapshot.docs[0].ref, ...snapshot.docs[0].data() };
                setCaretakerData(data);
                setServices(data.servicesOffered || []);
            }
        } catch (error) {
            console.error('Error fetching caretaker data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddService = async () => {
        if (!formData.serviceName.trim()) return;

        try {
            const newService = {
                id: `service_${Date.now()}`,
                ...formData,
                price: parseFloat(formData.price) || 0,
                createdAt: new Date().toISOString()
            };

            const updatedServices = [...services, newService];
            await updateDoc(caretakerData.ref, { servicesOffered: updatedServices });

            setServices(updatedServices);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error adding service:', error);
            alert('Failed to add service');
        }
    };

    const handleUpdateService = async () => {
        if (!formData.serviceName.trim()) return;

        try {
            const updatedServices = services.map(s =>
                s.id === editingService.id ? { ...s, ...formData, price: parseFloat(formData.price) || 0 } : s
            );

            await updateDoc(caretakerData.ref, { servicesOffered: updatedServices });

            setServices(updatedServices);
            setEditingService(null);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error updating service:', error);
            alert('Failed to update service');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const updatedServices = services.filter(s => s.id !== serviceId);
            await updateDoc(caretakerData.ref, { servicesOffered: updatedServices });
            setServices(updatedServices);
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Failed to delete service');
        }
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            serviceName: service.serviceName,
            category: service.category,
            description: service.description,
            price: service.price.toString(),
            duration: service.duration,
            image: service.image || ''
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            serviceName: '',
            category: 'home_maintenance',
            description: '',
            price: '',
            duration: '',
            image: ''
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Navigation */}
            <nav className="navbar-dark sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/caretaker" className="text-slate-400 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <Link href="/caretaker" className="flex items-center gap-2 hover:opacity-80 transition">
                                <span className="text-lg font-black text-white tracking-tight">
                                    Route<span className="text-slate-300">Care</span>
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6">
                            {userProfile?.profile?.name && (
                                <span className="text-sm font-bold text-slate-300 hidden md:block px-2">
                                    {userProfile.profile.name}
                                </span>
                            )}
                            <Link href="/caretaker" className="text-sm font-bold text-slate-300 hover:text-white transition">
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Your Services</h2>
                        <p className="text-slate-500 mt-1">Manage the services you offer to NRI clients</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingService(null);
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="px-6 py-3 bg-slate-600 text-white rounded-2xl font-black hover:bg-slate-700 transition shadow-lg"
                    >
                        + Add Service
                    </button>
                </div>

                {/* Services Grid */}
                {services.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-2">No services yet</h3>
                        <p className="text-slate-500 mb-6">Add your first service to start receiving requests</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-8 py-3 bg-slate-600 text-white rounded-2xl font-black hover:bg-slate-700 transition"
                        >
                            Add Your First Service
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase">
                                        {service.category.replace('_', ' ')}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(service)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{service.serviceName}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-2xl font-black text-indigo-600">₹{service.price}</p>
                                        <p className="text-xs text-slate-400">{service.duration}</p>
                                    </div>
                                    {service.image && (
                                        <img src={service.image} className="w-12 h-12 rounded-lg object-cover" alt="Service" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add/Edit Service Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingService(null);
                                    resetForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Service Name
                                </label>
                                <input
                                    type="text"
                                    name="serviceName"
                                    value={formData.serviceName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Deep House Cleaning"
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition"
                                >
                                    <option value="home_maintenance">Home Maintenance</option>
                                    <option value="parent_care">Parent Care</option>
                                    <option value="property_inspection">Property Inspection</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe what this service includes..."
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="1000"
                                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="2-3 hours"
                                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Service Image (Optional)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full px-5 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition"
                                        />
                                        <p className="text-xs text-slate-400 mt-1 ml-1">Upload from your device</p>
                                    </div>
                                    {formData.image && (
                                        <img src={formData.image} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt="Preview" />
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingService(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingService ? handleUpdateService : handleAddService}
                                    className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-2xl font-black hover:bg-slate-700 transition"
                                >
                                    {editingService ? 'Update Service' : 'Add Service'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CaretakerServices() {
    return (
        <ProtectedRoute allowedRoles={['caretaker']}>
            <CaretakerServicesContent />
        </ProtectedRoute>
    );
}
