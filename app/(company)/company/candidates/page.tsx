'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CompanyNav } from '@/components/company/company-nav';

export default function CompanyCandidatesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrives = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/company/drives', { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load drives');
        const drivesData = payload.data || [];
        setDrives(drivesData);
        if (drivesData.length > 0) setSelectedDriveId(drivesData[0]._id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load drives');
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedDriveId) return;
      setError('');
      try {
        const res = await fetch(`/api/company/drives/${selectedDriveId}/candidates`, { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load candidates');
        setCandidates(payload.data.candidates || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidates');
      }
    };
    fetchCandidates();
  }, [selectedDriveId]);

  const stats = useMemo(() => {
    return {
      total: candidates.length,
      shortlisted: candidates.filter((c) => c.status === 'shortlisted').length,
      selected: candidates.filter((c) => c.status === 'selected').length,
    };
  }, [candidates]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Candidate Pool</h1>
        <p className="mb-6 text-slate-600">Review applicants for your selected drive.</p>
        <CompanyNav />

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading candidate pool...</Card>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
              >
                {drives.map((drive) => (
                  <option key={drive._id} value={drive._id}>
                    {drive.role} - {drive.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Shortlisted</p>
                <p className="text-2xl font-bold text-slate-900">{stats.shortlisted}</p>
              </Card>
              <Card className="border-slate-200 p-4">
                <p className="text-xs text-slate-500">Selected</p>
                <p className="text-2xl font-bold text-slate-900">{stats.selected}</p>
              </Card>
            </div>

            <Card className="overflow-x-auto border-slate-200 p-0">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">CGPA</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No candidates for this drive.</td>
                    </tr>
                  ) : (
                    candidates.map((c) => (
                      <tr key={c.applicationId} className="border-b border-slate-100">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{c.student?.name || '-'}</p>
                          <p className="text-xs text-slate-500">{c.student?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{c.student?.department || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{c.student?.cgpa ?? '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{c.status}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {c.resumeUrl ? (
                            <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Open
                            </a>
                          ) : (
                            'N/A'
                          )}
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
