'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authManager } from '@/lib/utils/clientAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const authenticated = await authManager.checkAuthStatus();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = authManager.getCurrentUserData();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(async () => {
      const isValid = await authManager.refreshToken();
      if (!isValid) {
        setIsAuthenticated(false);
        setUser(null);
        authManager.signOut();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}