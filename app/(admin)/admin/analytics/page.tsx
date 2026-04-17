'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [unplaced, setUnplaced] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const year = 2025; // Use 2025 for seeded data
      const [dashRes, unplacedRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?year=${year}`, { cache: 'no-store' }),
        fetch(`/api/analytics/unplaced?year=${year}`, { cache: 'no-store' }),
      ]);

      const dashPayload = await dashRes.json();
      const unplacedPayload = await unplacedRes.json();

      if (!dashRes.ok || !dashPayload.success) throw new Error(dashPayload.message || 'Failed to load dashboard analytics');
      if (!unplacedRes.ok || !unplacedPayload.success) throw new Error(unplacedPayload.message || 'Failed to load unplaced students');

      setDashboard(dashPayload.data);
      setUnplaced(unplacedPayload.data.unplacedStudents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mb-6 text-slate-600">Placement trends, coverage, and unplaced pool.</p>

        <div className="mb-4">
          <Button onClick={fetchAnalytics} variant="outline">Refresh Analytics</Button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading analytics...</Card>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{dashboard?.overview?.totalStudents ?? 0}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Active Drives</p>
                <p className="text-2xl font-bold text-slate-900">{dashboard?.overview?.activeDrives ?? 0}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Applications</p>
                <p className="text-2xl font-bold text-slate-900">{dashboard?.overview?.totalApplications ?? 0}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Placement Rate</p>
                <p className="text-2xl font-bold text-slate-900">{dashboard?.overview?.placementRate ?? 0}%</p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-200 p-5">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Department Performance</h2>
                {dashboard?.departmentStats?.length ? (
                  <div className="space-y-3">
                    {dashboard.departmentStats.map((dept: any) => (
                      <div key={dept.department} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium text-slate-900">{dept.department}</p>
                        <p className="text-sm text-slate-600">
                          {dept.placed}/{dept.total} placed ({dept.placementRate}%)
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No department stats available.</p>
                )}
              </Card>

              <Card className="border-slate-200 p-5">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Top Skills in Demand</h2>
                {dashboard?.topSkills?.length ? (
                  <div className="space-y-2">
                    {dashboard.topSkills.map((item: any) => (
                      <div key={item.skill} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                        <span className="text-slate-800">{item.skill}</span>
                        <span className="text-sm text-slate-500">{item.count} drives</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No skills data available.</p>
                )}
              </Card>
            </div>

            <Card className="mt-6 border-slate-200 p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Unplaced Students</h2>
              {unplaced.length === 0 ? (
                <p className="text-sm text-slate-500">No unplaced students found for the selected year.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-600">Name</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-600">Reg No</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-600">Department</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-600">CGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unplaced.map((student: any) => (
                        <tr key={student._id} className="border-b border-slate-100">
                          <td className="px-3 py-2 text-slate-800">{student.name}</td>
                          <td className="px-3 py-2 text-slate-700">{student.regNo}</td>
                          <td className="px-3 py-2 text-slate-700">{student.department}</td>
                          <td className="px-3 py-2 text-slate-700">{student.cgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
