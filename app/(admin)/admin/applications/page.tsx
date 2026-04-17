'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Filter } from 'lucide-react';

type ApplicationItem = {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    regNo: string;
    department: string;
    email: string;
  };
  driveId: {
    _id: string;
    companyName: string;
    role: string;
    type: string;
  };
  status: string;
  appliedAt: string;
  currentRound?: string;
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const res = await fetch(`/api/applications?${params.toString()}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load applications');
      setApplications(payload.data?.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = search.toLowerCase();
    return (
      app.studentId?.name?.toLowerCase().includes(query) ||
      app.studentId?.regNo?.toLowerCase().includes(query) ||
      app.driveId?.companyName?.toLowerCase().includes(query) ||
      app.driveId?.role?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      applied: { label: 'Applied', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'under-review': { label: 'Under Review', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      shortlisted: { label: 'Shortlisted', className: 'bg-green-50 text-green-700 border-green-200' },
      rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
      selected: { label: 'Selected', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      withdrawn: { label: 'Withdrawn', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };
    const { label, className } = config[status] || config.applied;
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Applications Management</h1>
          <p className="text-slate-600">View and manage all student applications</p>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student name, reg no, company, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading applications...</Card>
        ) : filteredApplications.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">No applications found</Card>
        ) : (
          <Card className="overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{app.studentId?.name || 'N/A'}</div>
                          <div className="text-sm text-slate-500">{app.studentId?.regNo || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{app.driveId?.companyName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{app.driveId?.role || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/applications/${app._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
