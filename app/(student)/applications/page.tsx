'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type ApplicationItem = {
  _id: string;
  status: 'applied' | 'under-review' | 'shortlisted' | 'rejected' | 'selected' | 'withdrawn';
  currentRound?: string;
  appliedAt: string;
  timeline: Array<{ status: string; date: string; note?: string }>;
  driveId?: {
    companyName?: string;
    role?: string;
  };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/applications', { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load applications');
        setApplications(payload.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const grouped = useMemo(
    () => ({
      all: applications,
      active: applications.filter((a) => ['applied', 'under-review', 'shortlisted'].includes(a.status)),
      shortlisted: applications.filter((a) => a.status === 'shortlisted'),
      closed: applications.filter((a) => ['selected', 'rejected', 'withdrawn'].includes(a.status)),
    }),
    [applications]
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      applied: { label: 'Applied', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
      'under-review': { label: 'Under Review', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: AlertCircle },
      shortlisted: { label: 'Shortlisted', className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
      rejected: { label: 'Not Selected', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle },
      selected: { label: 'Selected', className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || statusConfig.applied;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderList = (list: ApplicationItem[]) => {
    if (loading) return <Card className="p-8 text-center text-slate-600">Loading applications...</Card>;
    if (list.length === 0) return <Card className="p-8 text-center text-slate-500">No applications in this section.</Card>;

    return list.map((app) => {
      const latestTimeline = app.timeline?.[app.timeline.length - 1];
      return (
        <Card key={app._id} className="p-6 border border-slate-200 bg-white hover:border-blue-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{app.driveId?.companyName || 'Company'}</h3>
                {getStatusBadge(app.status)}
              </div>
              <p className="text-sm text-slate-600 mb-1">{app.driveId?.role || 'Role'}</p>
              <p className="text-xs text-slate-500">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Current Stage</p>
                <p className="text-sm text-slate-600">{app.currentRound || latestTimeline?.note || app.status}</p>
              </div>
              {latestTimeline?.date && (
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Last Update</p>
                  <p className="text-sm text-slate-600">{new Date(latestTimeline.date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track all your placement applications in one place</p>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{grouped.all.length}</div>
            <div className="text-sm text-slate-600">Total Applied</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="text-2xl font-bold text-yellow-600">{applications.filter((a) => a.status === 'under-review').length}</div>
            <div className="text-sm text-slate-600">Under Review</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{grouped.shortlisted.length}</div>
            <div className="text-sm text-slate-600">Shortlisted</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{applications.filter((a) => a.status === 'selected').length}</div>
            <div className="text-sm text-slate-600">Selected</div>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderList(grouped.all)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {renderList(grouped.active)}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4">
            {renderList(grouped.shortlisted)}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            {renderList(grouped.closed)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
