'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Bell, FileText, ShieldCheck } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">PlacementHub Product Demo</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Explore the core workflows for students and placement admins with real app routes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 p-6">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Student Drive Flow</h2>
            <p className="mt-1 text-sm text-slate-600">Browse live drives, filter eligibility, and apply in one click.</p>
            <Link href="/drives" className="mt-4 inline-block">
              <Button size="sm">Open Drives <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </Card>

          <Card className="border-slate-200 p-6">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Application Tracking</h2>
            <p className="mt-1 text-sm text-slate-600">Check all applications by stage and monitor progress updates.</p>
            <Link href="/applications" className="mt-4 inline-block">
              <Button size="sm" variant="outline">Open Applications</Button>
            </Link>
          </Card>

          <Card className="border-slate-200 p-6">
            <Bell className="h-5 w-5 text-violet-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Notification Center</h2>
            <p className="mt-1 text-sm text-slate-600">Review activity alerts and mark them as read.</p>
            <Link href="/notifications" className="mt-4 inline-block">
              <Button size="sm" variant="outline">Open Notifications</Button>
            </Link>
          </Card>

          <Card className="border-slate-200 p-6">
            <ShieldCheck className="h-5 w-5 text-orange-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">See live analytics and recent drive performance.</p>
            <Link href="/admin/dashboard" className="mt-4 inline-block">
              <Button size="sm" variant="outline">Open Admin Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
