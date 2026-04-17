'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: 2025, // Use 2025 for seeded data
    department: '',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/placements/stats?year=${filters.year}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch placements
      const params = new URLSearchParams({
        year: filters.year.toString(),
        ...(filters.department && { department: filters.department }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });
      const placementsRes = await fetch(`/api/placements?${params}`);
      const placementsData = await placementsRes.json();
      if (placementsData.success) {
        setPlacements(placementsData.data.offers);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusBadge = (offer: any) => {
    if (offer.accepted) {
      return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
    }
    if (offer.rejectedAt) {
      return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading placements...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Placement Management</h1>
              <p className="text-sm text-gray-600 mt-1">Track and manage student placements</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Link href="/admin/placements/create">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Placement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {stats.overview.placementRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Placed Students</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.placedStudents}
                <span className="text-lg text-gray-500">/{stats.overview.totalStudents}</span>
              </p>
            </Card>

            <Card className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Average CTC</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.overview.avgCtc)}
              </p>
            </Card>

            <Card className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Highest CTC</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.overview.maxCtc)}
              </p>
            </Card>

            <Card className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Pending Offers</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.pendingOffers}
              </p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, company..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </Card>

        {/* Placements Table */}
        <Card className="border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">CTC</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Offer Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {placements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      No placements found
                    </td>
                  </tr>
                ) : (
                  placements.map((placement: any) => (
                    <tr key={placement._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{placement.studentId?.name}</p>
                          <p className="text-sm text-gray-500">{placement.studentId?.regNo}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {placement.companyName}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{placement.role}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatCurrency(placement.ctc || placement.stipend)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {placement.studentId?.department}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(placement)}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(placement.offerDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Department Stats */}
        {stats && stats.departmentStats.length > 0 && (
          <Card className="mt-8 p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Department-wise Placement Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.departmentStats.map((dept: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{dept.department}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Placed: <span className="font-medium text-gray-900">{dept.placed}/{dept.total}</span>
                    </p>
                    <p className="text-gray-600">
                      Rate: <span className="font-medium text-gray-900">{dept.placementRate}%</span>
                    </p>
                    <p className="text-gray-600">
                      Avg CTC: <span className="font-medium text-gray-900">{formatCurrency(dept.avgCtc)}</span>
                    </p>
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
