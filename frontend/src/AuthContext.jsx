import React, { createContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session timeout state
  const [lastActivity, setLastActivity] = useState(Date.now());
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Monitor user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLastActivity(Date.now());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle session timeout
  useEffect(() => {
    const checkSessionTimeout = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT && user) {
        signOut(auth).then(() => {
          setUser(null);
          alert('Session expired. Please log in again.');
        });
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, user]);

  // Update last activity on user interaction
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Logout function
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateActivity }}>
      {children}
    </AuthContext.Provider>
  );
};