'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompanyProfilePage() {
  const [form, setForm] = useState({
    name: '',
    about: '',
    industry: '',
    website: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    logo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company/profile', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load profile');
      const data = payload.data;
      setForm({
        name: data.name || '',
        about: data.about || '',
        industry: data.industry || '',
        website: data.website || '',
        hrName: data.hrName || '',
        hrEmail: data.hrEmail || '',
        hrPhone: data.hrPhone || '',
        logo: data.logo || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to save profile');
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Company Profile</h1>
        <p className="mb-6 text-slate-600">Update your HR and company details.</p>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>}

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading profile...</Card>
        ) : (
          <Card className="space-y-4 border-slate-200 p-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>About</Label>
              <textarea
                className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={form.about}
                onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>HR Name</Label>
                <Input value={form.hrName} onChange={(e) => setForm((p) => ({ ...p, hrName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>HR Email</Label>
                <Input value={form.hrEmail} disabled />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>HR Phone</Label>
                <Input value={form.hrPhone} onChange={(e) => setForm((p) => ({ ...p, hrPhone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
