import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDevAuth, setIsDevAuth] = useState(false);

  useEffect(() => {
    // Check local storage for persisted dev login session first
    const savedDevToken = localStorage.getItem('gemini_journal_dev_token');
    const savedDevUser = localStorage.getItem('gemini_journal_dev_user');

    if (savedDevToken && savedDevUser) {
      setToken(savedDevToken);
      setUser(JSON.parse(savedDevUser));
      setIsDevAuth(true);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // If Firebase key is not configured, default to a default demo session
      const defaultDevUser = {
        uid: 'user_enterprise_01',
        email: 'user@enterprise.org',
        displayName: 'Enterprise Executive',
        photoURL: ''
      };
      const defaultDevToken = 'dev-token-user_enterprise_01';
      setUser(defaultDevUser);
      setToken(defaultDevToken);
      setIsDevAuth(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email,
            photoURL: firebaseUser.photoURL || ''
          });
          setToken(idToken);
          setIsDevAuth(false);
        } catch (err) {
          console.error('Error fetching Firebase ID token:', err);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase API Key not configured in VITE_FIREBASE_API_KEY. Using Dev Mode.');
      }
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email,
        photoURL: result.user.photoURL || ''
      });
      setToken(idToken);
      setIsDevAuth(false);
      localStorage.removeItem('gemini_journal_dev_token');
      localStorage.removeItem('gemini_journal_dev_user');
    } catch (err) {
      console.warn('Google Sign-In note:', err.message);
      // Fallback to dev mode automatically on auth error / unconfigured credentials
      signInDevMode('user_demo_01', 'Demo Account');
    } finally {
      setLoading(false);
    }
  };

  const signInDevMode = (uid = 'user_demo_01', name = 'Demo User') => {
    const devToken = `dev-token-${uid}`;
    const devUser = {
      uid,
      email: `${uid}@geminijournal.local`,
      displayName: name,
      photoURL: ''
    };
    setUser(devUser);
    setToken(devToken);
    setIsDevAuth(true);
    localStorage.setItem('gemini_journal_dev_token', devToken);
    localStorage.setItem('gemini_journal_dev_user', JSON.stringify(devUser));
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && !isDevAuth) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      localStorage.removeItem('gemini_journal_dev_token');
      localStorage.removeItem('gemini_journal_dev_user');
      setUser(null);
      setToken(null);
      setIsDevAuth(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isDevAuth,
      signInWithGoogle,
      signInDevMode,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
