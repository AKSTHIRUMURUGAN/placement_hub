'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
} from 'lucide-react';

export default function PlacementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [placement, setPlacement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPlacement();
    }
  }, [params.id]);

  const fetchPlacement = async () => {
    try {
      const res = await fetch(`/api/placements/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setPlacement(data.data.offer);
      } else {
        alert('Failed to fetch placement details');
        router.back();
      }
    } catch (error) {
      console.error('Failed to fetch placement:', error);
      alert('Failed to fetch placement details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this placement?')) {
      return;
    }

    try {
      const res = await fetch(`/api/placements/${params.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('Placement deleted successfully');
        router.push('/admin/placements');
      } else {
        alert(data.message || 'Failed to delete placement');
      }
    } catch (error) {
      console.error('Failed to delete placement:', error);
      alert('Failed to delete placement');
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusBadge = () => {
    if (!placement) return null;
    if (placement.accepted) {
      return (
        <Badge className="bg-green-100 text-green-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Accepted
        </Badge>
      );
    }
    if (placement.rejectedAt) {
      return (
        <Badge className="bg-red-100 text-red-700 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading placement details...</p>
        </div>
      </div>
    );
  }

  if (!placement) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Placement Details</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {placement.companyName} - {placement.role}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Status Card */}
        <Card className="p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Offer Status</p>
              {getStatusBadge()}
            </div>
            {placement.accepted && placement.acceptedAt && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Accepted On</p>
                <p className="font-medium text-gray-900">
                  {new Date(placement.acceptedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {placement.rejectedAt && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Rejected On</p>
                <p className="font-medium text-gray-900">
                  {new Date(placement.rejectedAt).toLocaleDateString()}
                </p>
                {placement.rejectionReason && (
                  <p className="text-sm text-gray-500 mt-1">
                    Reason: {placement.rejectionReason}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Information */}
          <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Student Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{placement.studentId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-medium text-gray-900">{placement.studentId?.regNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {placement.studentId?.email}
                </p>
              </div>
              {placement.studentId?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {placement.studentId.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{placement.studentId?.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CGPA</p>
                <p className="font-medium text-gray-900">{placement.studentId?.cgpa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Graduation Year</p>
                <p className="font-medium text-gray-900">
                  {placement.studentId?.graduationYear}
                </p>
              </div>
            </div>
          </Card>

          {/* Company & Offer Information */}
          <Card className="p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-purple-600" />
              Company & Offer Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium text-gray-900 text-lg">{placement.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900">{placement.role}</p>
              </div>
              {placement.ctc && (
                <div>
                  <p className="text-sm text-gray-600">CTC</p>
                  <p className="font-medium text-gray-900 text-xl flex items-center">
                    <DollarSign className="h-5 w-5 mr-1 text-green-600" />
                    {formatCurrency(placement.ctc)}
                  </p>
                </div>
              )}
              {placement.stipend && (
                <div>
                  <p className="text-sm text-gray-600">Stipend</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    {formatCurrency(placement.stipend)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Offer Date</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(placement.offerDate).toLocaleDateString()}
                </p>
              </div>
              {placement.joiningDate && (
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(placement.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {placement.offerLetterUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Offer Letter</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={placement.offerLetterUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Offer Letter
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Drive Information */}
        {placement.driveId && (
          <Card className="p-6 mt-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Drive Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium text-gray-900">{placement.driveId.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900">{placement.driveId.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <Badge>{placement.driveId.type}</Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Application Information */}
        {placement.applicationId && (
          <Card className="p-6 mt-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Application Status</p>
                <Badge className="mt-1">{placement.applicationId.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium text-gray-900">
                  {new Date(placement.applicationId.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
