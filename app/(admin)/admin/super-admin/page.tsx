'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  FileText,
  Award,
  TrendingUp,
  Shield,
  Settings,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const idToken = localStorage.getItem('idToken');
      const res = await fetch('/api/super-admin/stats', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading super admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-red-600" />
                Super Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">System-wide management and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/admin/super-admin/users">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats?.userStats && Object.entries(stats.userStats).map(([role, data]: [string, any]) => (
              <Card key={role} className="p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="capitalize">{role}s</Badge>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{data.total}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium text-green-600">{data.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Blacklisted:</span>
                    <span className="font-medium text-red-600">{data.blacklisted}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Drive Statistics */}
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
              Drive Statistics
            </h3>
            <div className="space-y-3">
              {stats?.driveStats && Object.entries(stats.driveStats).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{status}:</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Application Statistics */}
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Application Statistics
            </h3>
            <div className="space-y-3">
              {stats?.applicationStats && Object.entries(stats.applicationStats).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{status.replace('-', ' ')}:</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Placement Overview */}
        {stats?.placementStats && (
          <Card className="p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Placement Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.placementStats.total}</p>
                <p className="text-sm text-gray-600">Total Offers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.placementStats.accepted}</p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.placementStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.placementStats.avgCtc)}
                </p>
                <p className="text-sm text-gray-600">Avg CTC</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        {stats?.recentActivity && (
          <Card className="p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Activity (Last 30 Days)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.recentActivity.newUsers}</p>
                <p className="text-sm text-gray-600">New Users</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.recentActivity.newDrives}</p>
                <p className="text-sm text-gray-600">New Drives</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.recentActivity.newApplications}</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.recentActivity.newPlacements}</p>
                <p className="text-sm text-gray-600">Placements</p>
              </div>
            </div>
          </Card>
        )}

        {/* Department Statistics */}
        {stats?.departmentStats && stats.departmentStats.length > 0 && (
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.departmentStats.map((dept: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{dept._id}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{dept.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg CGPA:</span>
                      <span className="font-medium">{dept.avgCgpa?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}