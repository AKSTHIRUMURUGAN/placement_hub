'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, CheckCircle2, XCircle, TrendingUp, FileText, Bell } from 'lucide-react';
import Link from 'next/link';
import { authManager, makeAuthenticatedRequest } from '@/lib/utils/clientAuth';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    eligibleDrives: 0,
    applications: 0,
    shortlisted: 0,
    pending: 0,
  });
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [vault, setVault] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userRes = await makeAuthenticatedRequest('/api/students/me');
        const userData = await userRes.json();
        
        if (userData.success) {
          setUser(userData.data.student);
        }

        // Fetch drives
        const drivesRes = await makeAuthenticatedRequest('/api/drives?tab=eligible&limit=5');
        const drivesData = await drivesRes.json();
        console.log('Drives API response:', drivesData);
        if (drivesData.success) {
          setDrives(drivesData.data.drives || []);
        }

        // Fetch applications
        const appsRes = await makeAuthenticatedRequest('/api/applications');
        const appsData = await appsRes.json();
        console.log('Applications API response:', appsData);
        if (appsData.success) {
          const apps = appsData.data.applications || [];
          setApplications(apps);
          
          // Calculate stats
          const shortlisted = apps.filter((a: any) => a.status === 'shortlisted').length;
          const pending = apps.filter((a: any) => 
            a.status === 'applied' || a.status === 'under-review'
          ).length;
          
          setStats({
            eligibleDrives: drivesData.data.drives?.length || 0,
            applications: apps.length,
            shortlisted,
            pending,
          });
        }

        // Fetch vault
        const vaultRes = await makeAuthenticatedRequest('/api/vault');
        const vaultData = await vaultRes.json();
        if (vaultData.success) {
          setVault(vaultData.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getDeadlineText = (closeDate: string) => {
    const now = new Date();
    const deadline = new Date(closeDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Closed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays <= 7) return `${diffDays} days left`;
    return `${Math.ceil(diffDays / 7)} weeks left`;
  };

  const calculateProfileCompletion = () => {
    if (!vault) return 0;
    let score = 0;
    if (vault.resumes?.length > 0) score += 25;
    if (vault.skills?.length > 0) score += 25;
    if (vault.projects?.length > 0) score += 25;
    if (vault.internships?.length > 0) score += 25;
    return score;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  const statsData = [
    { label: 'Eligible Drives', value: stats.eligibleDrives.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Applications', value: stats.applications.toString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Shortlisted', value: stats.shortlisted.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your placements today.</p>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Drives */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Eligible Drives</h2>
                <Link href="/drives">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              {drives.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No eligible drives available at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drives.slice(0, 3).map((drive) => (
                    <div key={drive._id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{drive.companyName}</h3>
                          <p className="text-sm text-gray-600">{drive.role}</p>
                        </div>
                        {drive.application ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200">Applied</Badge>
                        ) : drive.isNew ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(drive.ctc || drive.stipend)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {getDeadlineText(drive.closeDate)}
                          </span>
                        </div>
                        {!drive.application && (
                          <Link href={`/drives/${drive._id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Apply Now
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Profile Completion</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    {vault?.resumes?.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span className={vault?.resumes?.length > 0 ? 'text-gray-600' : 'text-gray-400'}>
                      Resume uploaded
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    {vault?.skills?.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span className={vault?.skills?.length > 0 ? 'text-gray-600' : 'text-gray-400'}>
                      Skills added
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    {vault?.projects?.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span className={vault?.projects?.length > 0 ? 'text-gray-600' : 'text-gray-400'}>
                      Add projects
                    </span>
                  </div>
                </div>
                <Link href="/vault">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/vault">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Vault
                  </Button>
                </Link>
                <Link href="/applications">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Track Applications
                  </Button>
                </Link>
                <Link href="/drives">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Drives
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
    </div>
  );
}
