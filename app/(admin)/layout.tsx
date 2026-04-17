'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/utils/clientAuth';
import AdminNavbar from '@/components/layout/admin-navbar';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have authentication data
        const isAuthenticated = await authManager.checkAuthStatus();
        
        if (!isAuthenticated) {
          toast.error('Please sign in to access this page');
          router.push('/sign-in?redirect=/admin/dashboard');
          return;
        }

        const userData = authManager.getCurrentUserData();
        
        if (!userData) {
          toast.error('User data not found. Please sign in again.');
          router.push('/sign-in?redirect=/admin/dashboard');
          return;
        }

        // Check if user has admin or placement officer role
        if (userData.role !== 'admin' && userData.role !== 'placement-officer') {
          toast.error('You do not have permission to access this page');
          
          // Redirect based on user role
          if (userData.role === 'student') {
            router.push('/dashboard');
          } else if (userData.role === 'company') {
            router.push('/company/dashboard');
          } else {
            router.push('/sign-in');
          }
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication failed. Please sign in again.');
        router.push('/sign-in?redirect=/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main>{children}</main>
    </div>
  );
}