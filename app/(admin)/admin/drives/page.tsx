'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit } from 'lucide-react';

type Drive = {
  _id: string;
  companyName: string;
  role: string;
  type: string;
  location: string;
  closeDate: string;
  status: 'draft' | 'active' | 'closed' | 'completed';
  applicantCount: number;
};

export default function AdminDrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/drives?status=active&limit=200', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load drives');
      setDrives(payload.data.drives || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drives;
    return drives.filter((d) => d.companyName.toLowerCase().includes(q) || d.role.toLowerCase().includes(q));
  }, [drives, search]);

  const statusClass = (status: Drive['status']) => {
    if (status === 'active') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'draft') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (status === 'completed') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Drive Management</h1>
        <p className="mb-6 text-slate-600">Track posted drives and applicant activity.</p>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={fetchDrives} variant="outline">Refresh</Button>
          </div>
          <Link href="/admin/drives/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Drive
            </Button>
          </Link>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading drives...</Card>
        ) : (
          <Card className="border-slate-200 p-0 overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Deadline</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Applicants</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">No drives found.</td>
                  </tr>
                ) : (
                  filtered.map((drive) => (
                    <tr key={drive._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{drive.companyName}</td>
                      <td className="px-4 py-3 text-slate-700">{drive.role}</td>
                      <td className="px-4 py-3 capitalize text-slate-700">{drive.type}</td>
                      <td className="px-4 py-3 text-slate-700">{drive.location}</td>
                      <td className="px-4 py-3 text-slate-700">{new Date(drive.closeDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-700">{drive.applicantCount || 0}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusClass(drive.status)}>{drive.status.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/drives/${drive._id}`}>
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/drives/${drive._id}?edit=true`}>
                            <Button variant="ghost" size="sm" title="Edit Drive">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
