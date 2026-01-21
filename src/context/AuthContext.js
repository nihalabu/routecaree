// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkRegistrationStatus = async (userId, role) => {
    // Only support 'user' (NRI) and 'caretaker' roles
    if (role === 'caretaker') {
      const q = query(collection(db, 'caretakers'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } else if (role === 'user') {
      const q = query(collection(db, 'nriUsers'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    }
    // Invalid role - return false
    return false;
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        
        // If no role selected, redirect to complete registration
        if (!profile.role) {
          router.push('/auth/register');
          return result;
        }
        
        // Check if profile is complete
        const isRegistered = await checkRegistrationStatus(result.user.uid, profile.role);
        
        if (!isRegistered) {
          // Profile not complete, redirect to registration
          router.push('/auth/register');
        } else {
          // Profile complete, redirect to appropriate dashboard
          if (profile.role === 'caretaker') {
            router.push('/caretaker');
          } else if (profile.role === 'user') {
            router.push('/user');
          } else {
            // Fallback if role is neither caretaker nor user
            router.push('/');
          }
        }
      } else {
        // User document doesn't exist, redirect to registration
        router.push('/auth/register');
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create basic user document
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: email,
        role: '',
        profile: {
          name: name,
          phone: '',
          photoURL: '',
          createdAt: new Date().toISOString()
        }
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) return;
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updates, { merge: true });
      
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    checkRegistrationStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};