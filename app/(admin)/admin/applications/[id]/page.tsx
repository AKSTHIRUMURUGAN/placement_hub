'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Briefcase, Calendar, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

type ApplicationDetail = {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    regNo: string;
    department: string;
    cgpa: number;
    graduationYear: number;
  };
  driveId: {
    _id: string;
    companyName: string;
    role: string;
    type: string;
    ctc?: number;
    stipend?: number;
    location: string;
  };
  status: string;
  currentRound?: string;
  appliedAt: string;
  submittedData: {
    cgpa: number;
    department: string;
    skills: string[];
    resume?: string;
    extraFields: Record<string, any>;
  };
  timeline: Array<{
    status: string;
    date: string;
    note?: string;
  }>;
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/applications/${applicationId}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load application');
      setApplication(payload.data);
      setNewStatus(payload.data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!newStatus || newStatus === application?.status) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to update status');
      await fetchApplication();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      applied: { label: 'Applied', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
      'under-review': { label: 'Under Review', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
      shortlisted: { label: 'Shortlisted', className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
      rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
      selected: { label: 'Selected', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
      withdrawn: { label: 'Withdrawn', className: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status] || config.applied;
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Card className="p-8 text-center text-slate-600">Loading application details...</Card>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="p-8 text-center">
            <p className="text-red-600">{error || 'Application not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Details</h1>
          <p className="text-slate-600">Review and manage application status</p>
        </div>

        <div className="space-y-6">
          {/* Student Information */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Student Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Name</p>
                <p className="font-medium text-slate-900">{application.studentId.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Registration Number</p>
                <p className="font-medium text-slate-900">{application.studentId.regNo}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium text-slate-900">{application.studentId.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Phone</p>
                <p className="font-medium text-slate-900">{application.studentId.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Department</p>
                <p className="font-medium text-slate-900">{application.studentId.department}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">CGPA</p>
                <p className="font-medium text-slate-900">{application.studentId.cgpa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Graduation Year</p>
                <p className="font-medium text-slate-900">{application.studentId.graduationYear}</p>
              </div>
            </div>
          </Card>

          {/* Drive Information */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Drive Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Company</p>
                <p className="font-medium text-slate-900">{application.driveId.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Role</p>
                <p className="font-medium text-slate-900">{application.driveId.role}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Type</p>
                <p className="font-medium text-slate-900 capitalize">{application.driveId.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Location</p>
                <p className="font-medium text-slate-900">{application.driveId.location}</p>
              </div>
              {application.driveId.ctc && (
                <div>
                  <p className="text-sm text-slate-600">CTC</p>
                  <p className="font-medium text-slate-900">₹{(application.driveId.ctc / 100000).toFixed(1)} LPA</p>
                </div>
              )}
              {application.driveId.stipend && (
                <div>
                  <p className="text-sm text-slate-600">Stipend</p>
                  <p className="font-medium text-slate-900">₹{application.driveId.stipend.toLocaleString()}/month</p>
                </div>
              )}
            </div>
          </Card>

          {/* Application Status */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Application Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current Status</p>
                  <div className="mt-1">{getStatusBadge(application.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Applied Date</p>
                  <p className="font-medium text-slate-900">{new Date(application.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {application.currentRound && (
                <div>
                  <p className="text-sm text-slate-600">Current Round</p>
                  <p className="font-medium text-slate-900">{application.currentRound}</p>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-2">Update Status</p>
                <div className="flex gap-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={updateStatus}
                    disabled={updating || newStatus === application.status}
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Submitted Data */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Submitted Data</h2>
            </div>
            <div className="space-y-4">
              {application.submittedData.skills && application.submittedData.skills.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {application.submittedData.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {application.submittedData.resume && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Resume</p>
                  <a href={application.submittedData.resume} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                  </a>
                </div>
              )}

              {application.submittedData.extraFields && Object.keys(application.submittedData.extraFields).length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Additional Information</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(application.submittedData.extraFields).map(([key, value]) => {
                      // Skip rendering publicId fields
                      if (key.toLowerCase().includes('publicid')) return null;
                      
                      // Check if this is an image URL field
                      const isImageUrl = key.toLowerCase().includes('url') && 
                                        typeof value === 'string' && 
                                        (value.includes('cloudinary') || value.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                      
                      // Check if this is a document/file URL
                      const isDocumentUrl = (key.toLowerCase().includes('aadhaar') || 
                                           key.toLowerCase().includes('pan') || 
                                           key.toLowerCase().includes('resume')) && 
                                          typeof value === 'string' && 
                                          value.startsWith('http');
                      
                      // Check if this is a social profile link
                      const isSocialLink = (key.toLowerCase().includes('github') || 
                                          key.toLowerCase().includes('linkedin') || 
                                          key.toLowerCase().includes('portfolio')) && 
                                         typeof value === 'string' && 
                                         value.startsWith('http');
                      
                      return (
                        <div key={key}>
                          <p className="text-xs text-slate-500 capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          {isImageUrl ? (
                            <img 
                              src={String(value)} 
                              alt={key}
                              className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                            />
                          ) : isDocumentUrl ? (
                            <a 
                              href={String(value)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              View Document
                            </a>
                          ) : isSocialLink ? (
                            <a 
                              href={String(value)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {String(value)}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-slate-900 break-words">
                              {String(value)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {application.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    {idx < application.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(event.status)}
                      <span className="text-sm text-slate-500">
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-sm text-slate-600">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
