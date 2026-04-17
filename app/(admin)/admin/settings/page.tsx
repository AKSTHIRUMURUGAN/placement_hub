'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminNav } from '@/components/admin/admin-nav';

type AdminSettings = {
  instituteName: string;
  coordinatorEmail: string;
  defaultGraduationYear: string;
  defaultMinCgpa: string;
  enableEmailNotifications: boolean;
  enableWhatsappNotifications: boolean;
};

const DEFAULT_SETTINGS: AdminSettings = {
  instituteName: 'PlacementHub College',
  coordinatorEmail: '',
  defaultGraduationYear: String(new Date().getFullYear()),
  defaultMinCgpa: '6.0',
  enableEmailNotifications: true,
  enableWhatsappNotifications: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('placementhub_admin_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {
      // Ignore malformed local storage values.
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('placementhub_admin_settings', JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Admin Settings</h1>
        <p className="mb-6 text-slate-600">Configure defaults and notification preferences for placement operations.</p>
        <AdminNav />

        <Card className="space-y-5 border-slate-200 p-6">
          <div className="space-y-2">
            <Label htmlFor="instituteName">Institute Name</Label>
            <Input
              id="instituteName"
              value={settings.instituteName}
              onChange={(e) => setSettings((prev) => ({ ...prev, instituteName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinatorEmail">Coordinator Email</Label>
            <Input
              id="coordinatorEmail"
              type="email"
              value={settings.coordinatorEmail}
              onChange={(e) => setSettings((prev) => ({ ...prev, coordinatorEmail: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultGraduationYear">Default Graduation Year</Label>
              <Input
                id="defaultGraduationYear"
                value={settings.defaultGraduationYear}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultGraduationYear: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMinCgpa">Default Min CGPA</Label>
              <Input
                id="defaultMinCgpa"
                value={settings.defaultMinCgpa}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultMinCgpa: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-900">Notification Channels</p>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings((prev) => ({ ...prev, enableEmailNotifications: e.target.checked }))}
              />
              Enable Email Notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.enableWhatsappNotifications}
                onChange={(e) => setSettings((prev) => ({ ...prev, enableWhatsappNotifications: e.target.checked }))}
              />
              Enable WhatsApp Notifications
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={saveSettings}>Save Settings</Button>
            {saved && <span className="text-sm text-green-700">Saved</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}
