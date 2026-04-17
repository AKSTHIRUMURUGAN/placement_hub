'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import CompanyNavbar from '@/components/layout/company-navbar';
import { authManager } from '@/lib/utils/clientAuth';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true);
        const isAuthenticated = await authManager.checkAuthStatus();
        if (!isAuthenticated) {
          toast.error('Please sign in to access this page');
          router.push('/sign-in?redirect=/company/dashboard');
          return;
        }

        const userData = authManager.getCurrentUserData();
        if (!userData) {
          toast.error('User data not found. Please sign in again.');
          router.push('/sign-in?redirect=/company/dashboard');
          return;
        }

        if (userData.role !== 'company') {
          toast.error('You do not have permission to access this page');
          if (userData.role === 'student') router.push('/dashboard');
          else if (userData.role === 'admin' || userData.role === 'placement-officer') router.push('/admin/dashboard');
          else router.push('/sign-in');
          return;
        }

        setAuthorized(true);
      } catch {
        toast.error('Authentication failed. Please sign in again.');
        router.push('/sign-in?redirect=/company/dashboard');
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

