'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export default function CompanyDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, drivesRes] = await Promise.all([
          fetch('/api/company/profile', { cache: 'no-store' }),
          fetch('/api/company/drives', { cache: 'no-store' }),
        ]);
        const profilePayload = await profileRes.json();
        const drivesPayload = await drivesRes.json();
        if (!profileRes.ok || !profilePayload.success) throw new Error(profilePayload.message || 'Failed to load profile');
        if (!drivesRes.ok || !drivesPayload.success) throw new Error(drivesPayload.message || 'Failed to load drives');

        setProfile(profilePayload.data);
        setDrives(drivesPayload.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeDrives = drives.filter((d) => d.status === 'active').length;
  const totalApplicants = drives.reduce((sum, d) => sum + (d.applicantCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Company HR Dashboard</h1>
        <p className="mb-6 text-slate-600">Manage your campus drives and candidate funnel.</p>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading dashboard...</Card>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Company</p>
                <p className="text-lg font-semibold text-slate-900">{profile?.name || '-'}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Total Drives</p>
                <p className="text-2xl font-bold text-slate-900">{drives.length}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Active Drives</p>
                <p className="text-2xl font-bold text-slate-900">{activeDrives}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Total Applicants</p>
                <p className="text-2xl font-bold text-slate-900">{totalApplicants}</p>
              </Card>
            </div>

            <Card className="border-slate-200 p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent Drives</h2>
              {drives.length === 0 ? (
                <p className="text-sm text-slate-500">No drives created yet.</p>
              ) : (
                <div className="space-y-3">
                  {drives.slice(0, 5).map((drive) => (
                    <div key={drive._id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-medium text-slate-900">{drive.role}</p>
                      <p className="text-sm text-slate-600">
                        {drive.type} • {drive.location} • {drive.applicantCount || 0} applicants
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
