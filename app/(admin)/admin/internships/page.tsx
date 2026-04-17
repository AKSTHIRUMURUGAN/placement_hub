'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Calendar, MapPin, Users, Briefcase } from 'lucide-react';

type Internship = {
  _id: string;
  companyName: string;
  role: string;
  duration: string;
  location: string;
  stipend: number;
  closeDate: string;
  status: 'draft' | 'active' | 'closed' | 'completed';
  applicantCount: number;
  type: 'internship';
};

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/drives?type=internship&limit=200', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load internships');
      setInternships(payload.data.drives || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return internships;
    return internships.filter((i) => 
      i.companyName.toLowerCase().includes(q) || 
      i.role.toLowerCase().includes(q)
    );
  }, [internships, search]);

  const statusClass = (status: Internship['status']) => {
    if (status === 'active') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'draft') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (status === 'completed') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatStipend = (amount: number) => {
    if (!amount) return 'Unpaid';
    return `₹${amount.toLocaleString()}/month`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Internship Management</h1>
          <p className="text-slate-600">Manage internship opportunities and track applications.</p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={fetchInternships} variant="outline">Refresh</Button>
          </div>
          <Link href="/admin/drives/create?type=internship">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Internship
            </Button>
          </Link>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        
        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading internships...</Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Internships</p>
                    <p className="text-2xl font-bold text-gray-900">{internships.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {internships.filter(i => i.status === 'active').length}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {internships.reduce((sum, i) => sum + (i.applicantCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remote Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {internships.filter(i => i.location.toLowerCase().includes('remote')).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Internships Table */}
            <Card className="border-slate-200 p-0 overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Stipend</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Deadline</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Applicants</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                        {search ? 'No internships match your search.' : 'No internships found.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((internship) => (
                      <tr key={internship._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{internship.companyName}</td>
                        <td className="px-4 py-3 text-slate-700">{internship.role}</td>
                        <td className="px-4 py-3 text-slate-700">{internship.duration || 'Not specified'}</td>
                        <td className="px-4 py-3 text-slate-700">{internship.location}</td>
                        <td className="px-4 py-3 text-slate-700">{formatStipend(internship.stipend)}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {new Date(internship.closeDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{internship.applicantCount || 0}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusClass(internship.status)}>
                            {internship.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin/drives/${internship._id}`}>
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/drives/${internship._id}?edit=true`}>
                              <Button variant="ghost" size="sm" title="Edit Internship">
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
          </>
        )}
      </div>
    </div>
  );
}