'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  Users, 
  Calendar, 
  MapPin, 
  Briefcase,
  FileText,
  Download,
  Upload,
  Eye,
  EyeOff,
  Plus,
  X,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { makeAuthenticatedRequest } from '@/lib/utils/clientAuth';

export default function DriveDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const driveId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [drive, setDrive] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (driveId) {
      fetchDriveDetails();
      fetchApplications();
      // Remove fetchDocuments() call since the endpoint doesn't exist
    }
  }, [driveId]);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`/api/drives/${driveId}`);
      const data = await response.json();
      
      if (data.success) {
        setDrive(data.data);
        setFormData(data.data);
      } else {
        toast.error(data.message || 'Failed to load drive details');
      }
    } catch (error) {
      console.error('Failed to fetch drive:', error);
      toast.error(`Failed to load drive details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/drives/${driveId}/applications`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data.applications || []);
        setStats(data.data.stats || {});
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      // Documents endpoint not implemented yet
      // const res = await fetch(`/api/drives/${driveId}/documents`);
      // const data = await res.json();
      
      // if (data.success) {
      //   setDocuments(data.data.documents || []);
      // }
      setDocuments([]); // Set empty array for now
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await makeAuthenticatedRequest(`/api/drives/${driveId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (data.success) {
        setDrive(data.data);
        setEditing(false);
        toast.success('Drive updated successfully');
      } else {
        toast.error(data.message || 'Failed to update drive');
      }
    } catch (error) {
      console.error('Failed to update drive:', error);
      toast.error(`Failed to update drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this drive? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/drives/${driveId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.success) {
        toast.success('Drive deleted successfully');
        router.push('/admin/drives');
      } else {
        toast.error(data.message || 'Failed to delete drive');
      }
    } catch (error) {
      console.error('Failed to delete drive:', error);
      toast.error(`Failed to delete drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/drives/${driveId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setDrive({ ...drive, status: newStatus });
        toast.success(`Drive ${newStatus} successfully`);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportApplications = async (format: 'csv' | 'excel') => {
    try {
      const res = await fetch(`/api/drives/${driveId}/export?format=${format}`);
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${drive.companyName}_${drive.role}_applications.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Applications exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export applications');
    }
  };

  const sendNotification = async () => {
    try {
      const message = prompt('Enter notification message for all applicants:');
      if (!message) return;

      const res = await fetch(`/api/drives/${driveId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Notification sent to all applicants');
      } else {
        toast.error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drive details...</p>
        </div>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Drive Not Found</h2>
          <p className="text-gray-600 mb-4">The requested drive could not be found.</p>
          <Link href="/admin/drives">
            <Button>Back to Drives</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'closed': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {drive.companyName} - {drive.role}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge className={getStatusColor(drive.status)}>
                    {drive.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Created {new Date(drive.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!editing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setFormData(drive);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Drive Information</h2>
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={formData.role || ''}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Work Mode</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.workMode || ''}
                      onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                    >
                      <option value="onsite">Onsite</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{drive.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{drive.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Application Deadline</p>
                        <p className="font-medium">{new Date(drive.closeDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Work Mode</p>
                        <p className="font-medium capitalize">{drive.workMode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Job Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Job Description</h2>
              {editing ? (
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{drive.description}</p>
                </div>
              )}
            </Card>

            {/* Applications Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Applications ({applications.length})</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportApplications('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportApplications('excel')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={sendNotification}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Notify All
                  </Button>
                </div>
              </div>
              
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No applications received yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">CGPA</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Applied</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{app.student?.name}</p>
                              <p className="text-sm text-gray-600">{app.student?.regNo}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{app.student?.department}</td>
                          <td className="py-3 px-4 text-gray-700">{app.student?.cgpa}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              app.status === 'selected' ? 'bg-green-50 text-green-700' :
                              app.status === 'shortlisted' ? 'bg-blue-50 text-blue-700' :
                              app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                              'bg-yellow-50 text-yellow-700'
                            }>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Link href={`/admin/applications/${app._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Applications</span>
                  <span className="font-medium">{stats.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shortlisted</span>
                  <span className="font-medium">{stats.shortlisted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected</span>
                  <span className="font-medium">{stats.selected || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-medium">{stats.rejected || 0}</span>
                </div>
              </div>
            </Card>

            {/* Status Management */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Status Management</h3>
              <div className="space-y-2">
                {['draft', 'active', 'closed', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={drive.status === status ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleStatusChange(status)}
                    disabled={drive.status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Compensation */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Compensation</h3>
              <div className="space-y-3">
                {drive.ctc && (
                  <div>
                    <p className="text-sm text-gray-600">CTC</p>
                    <p className="font-medium">₹{(drive.ctc / 100000).toFixed(1)} LPA</p>
                  </div>
                )}
                {drive.stipend && (
                  <div>
                    <p className="text-sm text-gray-600">Stipend</p>
                    <p className="font-medium">₹{drive.stipend.toLocaleString()}/month</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Eligibility */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Eligibility Criteria</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Min CGPA</p>
                  <p className="font-medium">{drive.eligibility?.minCgpa}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Backlogs</p>
                  <p className="font-medium">{drive.eligibility?.maxBacklogs}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {drive.eligibility?.departments?.map((dept: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}