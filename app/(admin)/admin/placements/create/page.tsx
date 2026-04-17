'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';

export default function CreatePlacementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    applicationId: '',
    ctc: '',
    stipend: '',
    joiningDate: '',
    offerLetterUrl: '',
    offerDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSelectedApplications();
  }, []);

  const fetchSelectedApplications = async () => {
    try {
      const res = await fetch('/api/applications?status=selected', { cache: 'no-store' });
      const payload = await res.json();
      if (payload.success) {
        // Filter out applications that already have offers
        const apps = payload.data?.applications || [];
        setApplications(apps);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const handleApplicationSelect = (appId: string) => {
    const app = applications.find(a => a._id === appId);
    setSelectedApplication(app);
    setFormData(prev => ({
      ...prev,
      applicationId: appId,
      ctc: app?.driveId?.ctc ? String(app.driveId.ctc) : '',
      stipend: app?.driveId?.stipend ? String(app.driveId.stipend) : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedApplication) {
        throw new Error('Please select an application');
      }

      const payload = {
        studentId: selectedApplication.studentId._id,
        driveId: selectedApplication.driveId._id,
        applicationId: formData.applicationId,
        companyName: selectedApplication.driveId.companyName,
        role: selectedApplication.driveId.role,
        ctc: formData.ctc ? Number(formData.ctc) : undefined,
        stipend: formData.stipend ? Number(formData.stipend) : undefined,
        joiningDate: formData.joiningDate || undefined,
        offerLetterUrl: formData.offerLetterUrl || undefined,
        offerDate: formData.offerDate,
      };

      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create placement');
      }

      router.push('/admin/placements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create placement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Placement Offer</h1>
          <p className="text-slate-600">Create a placement offer for a selected application</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Application */}
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Application</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="application">Selected Application *</Label>
                <Select
                  value={formData.applicationId}
                  onValueChange={handleApplicationSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No selected applications found
                      </div>
                    ) : (
                      applications.map((app) => (
                        <SelectItem key={app._id} value={app._id}>
                          {app.studentId?.name} - {app.driveId?.companyName} ({app.driveId?.role})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedApplication && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Application Details</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Student</p>
                      <p className="font-medium text-slate-900">{selectedApplication.studentId?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Reg No</p>
                      <p className="font-medium text-slate-900">{selectedApplication.studentId?.regNo}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Company</p>
                      <p className="font-medium text-slate-900">{selectedApplication.driveId?.companyName}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Role</p>
                      <p className="font-medium text-slate-900">{selectedApplication.driveId?.role}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Department</p>
                      <p className="font-medium text-slate-900">{selectedApplication.studentId?.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">CGPA</p>
                      <p className="font-medium text-slate-900">{selectedApplication.studentId?.cgpa}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Offer Details */}
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Offer Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctc">CTC (Annual in ₹)</Label>
                <Input
                  id="ctc"
                  type="number"
                  value={formData.ctc}
                  onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                  placeholder="e.g., 800000 for 8 LPA"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.ctc && `₹${(Number(formData.ctc) / 100000).toFixed(2)} LPA`}
                </p>
              </div>

              <div>
                <Label htmlFor="stipend">Stipend (Monthly in ₹)</Label>
                <Input
                  id="stipend"
                  type="number"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="e.g., 25000"
                />
                <p className="text-xs text-slate-500 mt-1">For internships only</p>
              </div>

              <div>
                <Label htmlFor="offerDate">Offer Date *</Label>
                <Input
                  id="offerDate"
                  type="date"
                  value={formData.offerDate}
                  onChange={(e) => setFormData({ ...formData, offerDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="offerLetterUrl">Offer Letter URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="offerLetterUrl"
                    type="url"
                    value={formData.offerLetterUrl}
                    onChange={(e) => setFormData({ ...formData, offerLetterUrl: e.target.value })}
                    placeholder="https://example.com/offer-letter.pdf"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload the offer letter document or provide a URL
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !formData.applicationId}
            >
              {loading ? 'Creating...' : 'Create Placement Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
