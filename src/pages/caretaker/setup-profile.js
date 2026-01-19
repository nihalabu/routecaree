// src/pages/caretaker/setup-profile.js
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function CaretakerProfileSetup() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.profile?.name || '',
    phone: '',
    address: '',
    serviceArea: '',
    experience: ''
  });
  
  const [services, setServices] = useState([
    {
      serviceName: '',
      category: 'home_maintenance',
      description: '',
      price: '',
      duration: '',
      image: ''
    }
  ]);

  const generateCaretakerId = async () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let isUnique = false;
    let caretakerId = '';
    
    while (!isUnique) {
      caretakerId = 'CT-';
      for (let i = 0; i < 3; i++) caretakerId += letters.charAt(Math.floor(Math.random() * letters.length));
      for (let i = 0; i < 3; i++) caretakerId += numbers.charAt(Math.floor(Math.random() * numbers.length));
      
      const q = query(collection(db, 'caretakers'), where('caretakerId', '==', caretakerId));
      const snapshot = await getDocs(q);
      isUnique = snapshot.empty;
    }
    return caretakerId;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('Image size should be less than 1MB');
      return;
    }
    const base64 = await compressImage(file);
    const updatedServices = [...services];
    updatedServices[index].image = base64;
    setServices(updatedServices);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const caretakerId = await generateCaretakerId();
      const validServices = services.filter(s => s.serviceName.trim() !== '');

      const caretakerData = {
        userId: user.uid,
        caretakerId: caretakerId,
        profile: {
          ...formData,
          email: user.email,
          photoURL: userProfile?.profile?.photoURL || ''
        },
        servicesOffered: validServices.map((s, i) => ({
          id: `service_${Date.now()}_${i}`,
          ...s,
          price: parseFloat(s.price) || 0
        })),
        availability: true,
        rating: 0,
        totalRatings: 0,
        completedServices: 0,
        verified: true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'caretakers'), caretakerData);
      alert(`Success! Your Caretaker ID is: ${caretakerId}`);
      router.push('/caretaker');
    } catch (error) {
      console.error(error);
      alert('Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-10 text-white">
            <h1 className="text-3xl font-black mb-2">Build Your Business</h1>
            <p className="text-indigo-100 opacity-90">Set up your profile to start receiving service requests.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            {/* Section 1: Identity */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Personal Details</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" type="tel" placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} required />
                <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                    <textarea name="address" required value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition outline-none" />
                </div>
                <Input label="City / Service Area" name="serviceArea" placeholder="e.g. Mumbai, Maharashtra" value={formData.serviceArea} onChange={handleChange} required />
                <Input label="Years of Experience" name="experience" placeholder="e.g. 4 Years" value={formData.experience} onChange={handleChange} required />
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2: Services */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Services Offered</h2>
                </div>
                <button type="button" onClick={() => setServices([...services, { serviceName: '', category: 'home_maintenance', description: '', price: '', duration: '', image: '' }])} className="text-indigo-600 font-bold text-sm hover:underline">
                  + Add Service
                </button>
              </div>

              <div className="space-y-6">
                {services.map((service, index) => (
                  <div key={index} className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                    {services.length > 1 && (
                      <button type="button" onClick={() => setServices(services.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="Service Name" value={service.serviceName} onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)} placeholder="e.g. Deep Cleaning" />
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <select value={service.category} onChange={(e) => handleServiceChange(index, 'category', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none">
                            <option value="home_maintenance">Home Maintenance</option>
                            <option value="parent_care">Parent Care</option>
                            <option value="property_inspection">Property Inspection</option>
                            <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <Input label="Description" value={service.description} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} />
                      </div>
                      <Input label="Price (₹)" type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} />
                      <Input label="Duration" value={service.duration} onChange={(e) => handleServiceChange(index, 'duration', e.target.value)} placeholder="e.g. 2 Hours" />
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Image</label>
                        <div className="flex items-center gap-4">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e)} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
                            {service.image && <img src={service.image} className="w-12 h-12 rounded-lg object-cover border border-slate-200" alt="Preview" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Launch My Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Inputs
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition outline-none text-slate-800 placeholder:text-slate-300"
      />
    </div>
  );
}