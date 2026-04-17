'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Clock, MapPin, DollarSign, Search, Filter, CheckCircle2, ExternalLink } from 'lucide-react';

type DriveItem = {
  _id: string;
  companyName: string;
  role: string;
  type: 'full-time' | 'internship' | 'ppo';
  ctc?: number;
  stipend?: number;
  location: string;
  closeDate: string;
  jdUrl?: string;
  eligibility: { isEligible: boolean; matchScore: number; reasons: string[] };
  application: { _id: string; status: string } | null;
};

export default function DrivesPage() {
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filter === 'eligible') params.set('tab', 'eligible');
      if (filter === 'applied') params.set('tab', 'applied');
      if (filter === 'internship') params.set('type', 'internship');
      if (filter === 'full-time') params.set('type', 'full-time');

      const res = await fetch(`/api/drives?${params.toString()}`, { cache: 'no-store' });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredDrives = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return drives;
    return drives.filter((d) => d.companyName.toLowerCase().includes(query) || d.role.toLowerCase().includes(query));
  }, [drives, search]);

  const formatCompensation = (drive: DriveItem) => {
    if (drive.ctc) return `₹${(drive.ctc / 100000).toFixed(1)} LPA`;
    if (drive.stipend) return `₹${drive.stipend.toLocaleString()}/month`;
    return 'Not specified';
  };

  const formatDeadline = (closeDate: string) => {
    const end = new Date(closeDate).getTime();
    const diffDays = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Closed';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const applyNow = async (driveId: string) => {
    setSubmittingId(driveId);
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveId }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to apply');
      await fetchDrives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Drives</h1>
          <p className="text-slate-600">Discover live opportunities that match your profile</p>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search companies or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drives</SelectItem>
              <SelectItem value="eligible">Eligible for Me</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="internship">Internships</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading drives...</Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDrives.map((drive) => (
            <Card key={drive._id} className="p-6 border border-slate-200 bg-white hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{drive.companyName}</h3>
                    <p className="text-sm text-slate-600">{drive.role}</p>
                  </div>
                </div>
                {drive.application ? (
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Applied
                  </Badge>
                ) : !drive.eligibility.isEligible ? (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200">Not Eligible</Badge>
                ) : (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {Math.round(drive.eligibility.matchScore)}% Match
                  </Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="capitalize">{drive.type}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-medium text-slate-900">{formatCompensation(drive)}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{drive.location}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-orange-600 font-medium">{formatDeadline(drive.closeDate)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={Boolean(drive.application) || !drive.eligibility.isEligible || submittingId === drive._id}
                  onClick={() => applyNow(drive._id)}
                >
                  {drive.application ? 'Applied' : submittingId === drive._id ? 'Applying...' : 'Apply Now'}
                </Button>
                {drive.jdUrl ? (
                  <a href={drive.jdUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      JD
                    </Button>
                  </a>
                ) : <Button variant="outline" className="flex-1" disabled>No JD</Button>}
              </div>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
