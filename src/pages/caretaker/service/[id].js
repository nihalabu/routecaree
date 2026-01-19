//src/pages/caretaker/service/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ServiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [workDescription, setWorkDescription] = useState('');
  const [message, setMessage] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofImages, setProofImages] = useState([]);
  const [proofCaption, setProofCaption] = useState('');

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const docRef = doc(db, 'serviceRequests', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRequest({ id: docSnap.id, ...docSnap.data() });
        setWorkDescription(docSnap.data().workDescription || '');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image Logic (Compressed for Firestore/Base64 efficiency)
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width, height = img.height;
          const maxSize = 800;
          if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
          else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
          canvas.width = width; canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const compressed = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) { alert('Max 2MB per image'); continue; }
      const base64 = await compressImage(file);
      compressed.push(base64);
    }
    setProofImages([...proofImages, ...compressed]);
  };

  const updateStatus = async (newStatus) => {
    if (!confirm(`Move task to ${newStatus.replace('_', ' ')}?`)) return;
    setUpdating(true);
    try {
      const requestRef = doc(db, 'serviceRequests', id);
      const updates = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: arrayUnion({
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: `Status changed to ${newStatus}`
        })
      };
      if (newStatus === 'completed') updates.completedAt = new Date().toISOString();
      await updateDoc(requestRef, updates);
      await fetchRequest();
    } catch (error) {
      alert('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const uploadProof = async () => {
    if (proofImages.length === 0) return;
    setUploadingProof(true);
    try {
      const requestRef = doc(db, 'serviceRequests', id);
      const proofData = proofImages.map(image => ({
        type: 'image', data: image, caption: proofCaption, timestamp: new Date().toISOString()
      }));
      await updateDoc(requestRef, {
        proofOfWork: arrayUnion(...proofData),
        updatedAt: new Date().toISOString()
      });
      setProofImages([]); setProofCaption('');
      await fetchRequest();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploadingProof(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setUpdating(true);
    try {
      const requestRef = doc(db, 'serviceRequests', id);
      await updateDoc(requestRef, {
        messages: arrayUnion({
          senderId: user.uid,
          senderName: request.caretakerName || 'Caretaker',
          message: message,
          timestamp: new Date().toISOString()
        }),
        updatedAt: new Date().toISOString()
      });
      setMessage('');
      await fetchRequest();
    } catch (error) { console.error(error); } finally { setUpdating(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Navigation */}
        <button onClick={() => router.push('/caretaker')} className="flex items-center text-slate-500 hover:text-blue-600 font-medium transition mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Tasks
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: TASK INFO */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Header Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
                    {request.serviceCategory || 'Service Request'}
                  </span>
                  <h1 className="text-3xl font-black text-slate-900">{request.serviceName}</h1>
                  <p className="text-slate-400 text-sm mt-1 font-mono">ID: {request.requestId}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="grid sm:grid-cols-2 gap-8 py-6 border-y border-slate-50">
                <InfoBlock label="Client" value={request.userName} subValue={request.userPhone} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                <InfoBlock label="Schedule" value={new Date(request.scheduledDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })} subValue={request.scheduledTime} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <InfoBlock label="Location" value={request.serviceAddress} icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <InfoBlock label="Total Payout" value={`₹${request.servicePrice}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </div>

              {request.specialRequirements && (
                <div className="mt-6 bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <h4 className="text-amber-800 text-sm font-bold uppercase tracking-tight flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Special Requirements
                  </h4>
                  <p className="text-amber-900 leading-relaxed">{request.specialRequirements}</p>
                </div>
              )}
            </div>

            {/* Work Documentation */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 text-sm">2</span>
                Work Documentation
              </h2>
              
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 min-h-[120px] transition-all"
                placeholder="Log details of the work performed, materials used, or issues discovered..."
              />
              <button 
                onClick={async () => {
                  setUpdating(true);
                  try {
                    await updateDoc(doc(db, 'serviceRequests', id), { workDescription, updatedAt: new Date().toISOString() });
                    alert('Saved!');
                  } finally { setUpdating(false); }
                }}
                className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
              >
                Save Log
              </button>
            </div>

            {/* Proof Gallery */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">3</span>
                Proof of Work
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group">
                  <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">Add Photo</span>
                  <input type="file" hidden accept="image/*" multiple onChange={handleImageSelect} />
                </label>
                
                {proofImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => setProofImages(proofImages.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>

              {proofImages.length > 0 && (
                <div className="flex gap-2">
                  <input type="text" value={proofCaption} onChange={(e) => setProofCaption(e.target.value)} placeholder="Image caption..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-sm" />
                  <button onClick={uploadProof} disabled={uploadingProof} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700">
                    {uploadingProof ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                </div>
              )}

              {/* Final Feed of Proofs */}
              <div className="grid grid-cols-1 gap-4 mt-8">
                {request.proofOfWork?.slice().reverse().map((proof, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={proof.data} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 mb-1">{proof.caption || 'No caption'}</p>
                      <p className="text-xs text-slate-400">{new Date(proof.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIONS & CHAT */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
              <h3 className="text-lg font-bold mb-6">Task Control</h3>
              <div className="space-y-4">
                {request.status === 'pending' && (
                  <button onClick={() => updateStatus('in_progress')} className="w-full bg-blue-600 py-4 rounded-2xl font-black hover:bg-blue-500 transition shadow-lg shadow-blue-900/40">START WORK</button>
                )}
                {request.status === 'in_progress' && (
                  <button onClick={() => updateStatus('completed')} className="w-full bg-emerald-600 py-4 rounded-2xl font-black hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/40 text-white">COMPLETE TASK</button>
                )}
                <button 
                  onClick={() => updateStatus('cancelled')}
                  disabled={request.status === 'completed' || request.status === 'cancelled'}
                  className="w-full bg-white/10 py-4 rounded-2xl font-bold text-slate-300 hover:bg-white/20 transition disabled:opacity-30"
                >
                  Cancel Request
                </button>
              </div>
            </div>

            {/* Chat Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Client Messages</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {request.messages?.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                      msg.senderId === user.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-b-3xl">
                <div className="relative">
                  <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type message..." 
                    className="w-full border-none bg-white rounded-2xl pl-4 pr-12 py-3 shadow-sm focus:ring-2 focus:ring-blue-500" 
                  />
                  <button onClick={sendMessage} className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Visual Status Badge Component
function StatusBadge({ status }) {
  const config = {
    pending: 'bg-amber-100 text-amber-700 ring-amber-200',
    in_progress: 'bg-blue-100 text-blue-700 ring-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ring-1 ${config[status] || config.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// UI Item Component
function InfoBlock({ label, value, subValue, icon }) {
  return (
    <div className="flex items-start">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mr-4 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={icon} /></svg>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-slate-900 font-bold leading-tight">{value}</p>
        {subValue && <p className="text-slate-500 text-xs mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['caretaker']}>
      <ServiceDetail />
    </ProtectedRoute>
  );
}