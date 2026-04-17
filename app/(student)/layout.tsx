'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentNavbar } from '@/components/layout/student-navbar';
import { authManager } from '@/lib/utils/clientAuth';
import toast from 'react-hot-toast';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Wait for Firebase auth to initialize and check auth status
        const isAuthenticated = await authManager.checkAuthStatus();
        
        if (!isAuthenticated) {
          toast.error('Please sign in to continue');
          router.push('/sign-in');
          return;
        }

        // Fetch user data
        const userRes = await authManager.makeAuthenticatedRequest('/api/students/me');
        const userData = await userRes.json();
        
        if (userData.success) {
          setUser(userData.data.student);
          
          // Fetch vault data for avatar
          try {
            const vaultRes = await authManager.makeAuthenticatedRequest('/api/vault');
            const vaultData = await vaultRes.json();
            if (vaultData.success && vaultData.data.extraFields?.avatarUrl) {
              setAvatarUrl(vaultData.data.extraFields.avatarUrl);
            }
          } catch (error) {
            // Avatar is optional, don't show error
          }
        } else {
          toast.error('Failed to load user data');
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't immediately redirect on error - might be a temporary network issue
        // Instead, try to use cached data if available
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            toast.error('Authentication error. Please sign in again.');
            router.push('/sign-in');
          }
        } else {
          toast.error('Authentication error. Please sign in again.');
          router.push('/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar user={user} avatarUrl={avatarUrl} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}