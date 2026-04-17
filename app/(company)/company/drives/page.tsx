'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CompanyNav } from '@/components/company/company-nav';

export default function CompanyDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'full-time' | 'internship' | 'ppo'>('full-time');

  const fetchDrives = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company/drives', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load drives');
      setDrives(payload.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const createDrive = async () => {
    if (!role || !location) {
      setError('Role and location are required');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/company/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          type,
          location,
          description: `${role} hiring drive`,
          closeDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'draft',
          eligibility: {
            minCgpa: 6,
            departments: ['Computer Science Engineering'],
            requiredSkills: [],
            maxBacklogs: 0,
            degrees: ['B.Tech'],
            graduationYears: [new Date().getFullYear()],
          },
          requiredFields: ['resume'],
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to create drive');
      setRole('');
      setLocation('');
      await fetchDrives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create drive');
    }
  };

  const statusClass = (status: string) => {
    if (status === 'active') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'draft') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Drive Management</h1>
        <p className="mb-6 text-slate-600">Create and manage your company campus drives.</p>
        <CompanyNav />

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <Card className="mb-6 border-slate-200 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Create Quick Drive</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Role (e.g. SDE)" value={role} onChange={(e) => setRole(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as 'full-time' | 'internship' | 'ppo')}
            >
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="ppo">PPO</option>
            </select>
            <Button onClick={createDrive}>Create</Button>
          </div>
        </Card>

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading drives...</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {drives.length === 0 ? (
              <Card className="p-8 text-center text-slate-500 md:col-span-2">No drives yet.</Card>
            ) : (
              drives.map((drive) => (
                <Card key={drive._id} className="border-slate-200 p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{drive.role}</h3>
                      <p className="text-sm text-slate-600 capitalize">{drive.type} • {drive.location}</p>
                    </div>
                    <Badge className={statusClass(drive.status)}>{drive.status.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Applicants: {drive.applicantCount || 0}</p>
                  <p className="text-sm text-slate-600">Deadline: {new Date(drive.closeDate).toLocaleDateString()}</p>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
