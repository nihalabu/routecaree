// src/pages/user/request/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Badge from '@/components/shared/Badge';

function RequestDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (id) fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            const docRef = doc(db, 'serviceRequests', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setRequest({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (error) {
            console.error('Error fetching request:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            const requestRef = doc(db, 'serviceRequests', id);
            await updateDoc(requestRef, {
                messages: arrayUnion({
                    senderId: user.uid,
                    senderName: request.userName || 'NRI User',
                    message: message,
                    timestamp: new Date().toISOString()
                }),
                updatedAt: new Date().toISOString()
            });
            setMessage('');
            await fetchRequest();
        } catch (error) {
            console.error(error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="spinner h-12 w-12"></div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card>
                    <div className="text-center py-12">
                        <h3 className="mb-4">Request not found</h3>
                        <Link href="/user">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Navigation */}
            <nav className="navbar-dark sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/user" className="flex items-center gap-2 hover:opacity-80 transition">
                            <span className="text-xl font-bold text-white tracking-tight">
                                Route<span className="text-slate-300">Care</span>
                            </span>
                            <span className="text-slate-400 mx-2">|</span>
                            <span className="text-sm font-medium text-slate-300">Service Request</span>
                        </Link>
                        <Link href="/user">
                            <Button size="sm" variant="secondary">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: REQUEST INFO */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Main Header Card */}
                        <Card>
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full mb-3 inline-block">
                                        {request.serviceCategory || 'Service Request'}
                                    </span>
                                    <h1 className="text-3xl font-black text-slate-900">{request.serviceName}</h1>
                                    <p className="text-slate-400 text-sm mt-1">Request ID: {request.id}</p>
                                </div>
                                <Badge variant={request.status === 'completed' ? 'completed' : request.status === 'in_progress' ? 'in-progress' : 'pending'}>
                                    {request.status?.replace('_', ' ') || 'Pending'}
                                </Badge>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6 py-6 border-y border-slate-100">
                                <InfoBlock label="Caretaker" value={request.caretakerName || 'Not Assigned'} />
                                <InfoBlock
                                    label="Schedule"
                                    value={request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : 'TBD'}
                                    subValue={request.scheduledTime || 'Flexible'}
                                />
                                <InfoBlock label="Location" value={request.serviceAddress || 'No Address'} />
                                <InfoBlock label="Price" value={request.servicePrice ? `₹${request.servicePrice}` : 'N/A'} />
                            </div>

                            {request.specialRequirements && (
                                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
                                    <h4 className="text-amber-800 text-sm font-bold mb-2">Special Requirements</h4>
                                    <p className="text-amber-900 text-sm">{request.specialRequirements}</p>
                                </div>
                            )}

                            {request.workDescription && (
                                <div className="mt-6">
                                    <h4 className="font-bold mb-2">Work Log</h4>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">{request.workDescription}</p>
                                </div>
                            )}
                        </Card>

                        {/* Proof of Work */}
                        {request.proofOfWork && request.proofOfWork.length > 0 && (
                            <Card>
                                <h2 className="text-xl font-bold mb-4">Proof of Work</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {request.proofOfWork.slice().reverse().map((proof, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                                            <img src={proof.data} className="w-24 h-24 rounded-lg object-cover" alt="Proof" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 mb-1">{proof.caption || 'No caption'}</p>
                                                <p className="text-xs text-slate-500">{new Date(proof.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: MESSAGES */}
                    <div className="space-y-6">

                        {/* Status Card */}
                        <Card>
                            <h3 className="font-bold mb-4">Request Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${request.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                    <span className="text-sm">Pending</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${request.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                    <span className="text-sm">In Progress</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${request.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    <span className="text-sm">Completed</span>
                                </div>
                            </div>
                        </Card>

                        {/* Messages Card */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Messages</h3>
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-3 mb-4">
                                {request.messages && request.messages.length > 0 ? (
                                    request.messages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${msg.senderId === user.uid ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-xs text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type message..."
                                    className="flex-1 input-field text-sm"
                                />
                                <Button onClick={sendMessage} disabled={sending} size="sm">
                                    {sending ? 'Sending...' : 'Send'}
                                </Button>
                            </div>
                        </Card>

                    </div>
                </div>
            </main>
        </div>
    );
}

function InfoBlock({ label, value, subValue }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
            <p className="text-slate-900 font-bold">{value}</p>
            {subValue && <p className="text-slate-500 text-sm">{subValue}</p>}
        </div>
    );
}

export default function RequestDetailPage() {
    return (
        <ProtectedRoute allowedRoles={['user']}>
            <RequestDetail />
        </ProtectedRoute>
    );
}
