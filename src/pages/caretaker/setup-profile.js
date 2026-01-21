// src/pages/caretaker/setup-profile.js
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Button from '@/components/shared/Button';

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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    let caretakerId = '';

    while (!isUnique) {
      caretakerId = 'CT-';
      for (let i = 0; i < 6; i++) {
        caretakerId += characters.charAt(Math.floor(Math.random() * characters.length));
      }
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
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-50" />
            <div className="relative z-10">
              <h1 className="text-4xl font-black mb-2 text-white">Build Your Business</h1>
              <p className="text-slate-400 font-medium text-lg">Set up your profile to start receiving service requests.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-12">
            {/* Section 1: Identity */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm">01</span>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personal Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" type="tel" placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} required />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Work Address / Base Location</label>
                  <textarea name="address" required value={formData.address} onChange={handleChange} rows="2" className="input-field resize-none h-auto" />
                </div>
                <Input label="City / Service Area" name="serviceArea" placeholder="e.g. Mumbai, Maharashtra" value={formData.serviceArea} onChange={handleChange} required />
                <Input label="Professional Experience" name="experience" placeholder="e.g. 5+ Years in Plumbing" value={formData.experience} onChange={handleChange} required />
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2: Services */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm">02</span>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Services Offered</h2>
                </div>
                <button type="button" onClick={() => setServices([...services, { serviceName: '', category: 'home_maintenance', description: '', price: '', duration: '', image: '' }])} className="text-slate-600 font-black text-sm hover:text-slate-950 transition-colors uppercase tracking-widest">
                  + Add Service
                </button>
              </div>

              <div className="space-y-8">
                {services.map((service, index) => (
                  <div key={index} className="relative p-8 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in zoom-in-95 duration-300">
                    {services.length > 1 && (
                      <button type="button" onClick={() => setServices(services.filter((_, i) => i !== index))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="Service Title" value={service.serviceName} onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)} placeholder="e.g. Electrical Repair" />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Category</label>
                        <select value={service.category} onChange={(e) => handleServiceChange(index, 'category', e.target.value)} className="input-field appearance-none bg-white">
                          <option value="home_maintenance">Home Maintenance</option>
                          <option value="parent_care">Parent Care</option>
                          <option value="property_inspection">Property Inspection</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description of Service</label>
                        <textarea value={service.description} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} className="input-field resize-none h-auto" rows="3" placeholder="Explain what is included in this service..." />
                      </div>
                      <Input label="Rate / Starting Price (₹)" type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} />
                      <Input label="Estimated Duration" value={service.duration} onChange={(e) => handleServiceChange(index, 'duration', e.target.value)} placeholder="e.g. 1-2 Hours" />

                      <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Portfolio / Service Image</label>
                        <div className="flex items-center gap-6">
                          <label className="cursor-pointer px-6 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-400 transition-colors text-sm font-bold text-slate-500">
                            Upload Photo
                            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(index, e)} />
                          </label>
                          {service.image && <img src={service.image} className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-100 shadow-lg" alt="Preview" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-xl shadow-2xl shadow-slate-200"
            >
              {loading ? 'Processing...' : 'Launch My Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{label}</label>
      <input
        {...props}
        className="input-field"
      />
    </div>
  );
}