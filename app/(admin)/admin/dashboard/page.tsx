'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, TrendingUp, FileText, Plus, Download, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const year = 2025; // Use 2025 for seeded data
        const timestamp = Date.now(); // Cache busting
        const res = await fetch(`/api/analytics/dashboard?year=${year}&t=${timestamp}`, { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load dashboard');
        setData(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const overview = data?.overview;
    if (!overview) return [];
    return [
      { label: 'Total Students', value: overview.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Active Drives', value: overview.activeDrives, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Applications', value: overview.totalApplications, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Placement Rate', value: `${overview.placementRate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Live overview of placement activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/drives/create">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Drive
            </Button>
          </Link>
          <Link href="/admin/placements">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              View Placements
            </Button>
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {loading && <Card className="p-8 text-center text-slate-600 mb-6">Loading dashboard...</Card>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Recent Drives</h2>
          <span className="text-sm text-slate-500">Last 5</span>
        </div>
        {!data?.recentDrives?.length ? (
          <p className="text-sm text-slate-500">No drives found for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Applications</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Shortlisted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentDrives.map((drive: any) => (
                  <tr key={drive._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-900">{drive.companyName}</td>
                    <td className="py-4 px-4 text-slate-600">{drive.role}</td>
                    <td className="py-4 px-4 text-slate-600">{drive.applicantCount || 0}</td>
                    <td className="py-4 px-4 text-slate-600">{drive.shortlistedCount || 0}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        drive.status === 'active'
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String(drive.status).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
