'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreatePlacementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    studentId: '',
    driveId: '',
    applicationId: '',
    companyName: '',
    role: '',
    ctc: '',
    stipend: '',
    joiningDate: '',
    offerLetterUrl: '',
    offerDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStudents();
    fetchDrives();
  }, []);

  useEffect(() => {
    if (formData.studentId && formData.driveId) {
      fetchApplications();
    }
  }, [formData.studentId, formData.driveId]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students?limit=1000');
      const data = await res.json();
      if (data.success) {
        setStudents(data.data.students);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await fetch('/api/drives?limit=1000');
      const data = await res.json();
      if (data.success) {
        setDrives(data.data.drives);
      }
    } catch (error) {
      console.error('Failed to fetch drives:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(
        `/api/drives/${formData.driveId}/applications?status=selected`
      );
      const data = await res.json();
      if (data.success) {
        const studentApps = data.data.applications.filter(
          (app: any) => app.student._id === formData.studentId
        );
        setApplications(studentApps);
        if (studentApps.length === 1) {
          setFormData((prev) => ({ ...prev, applicationId: studentApps[0]._id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleDriveChange = (driveId: string) => {
    const drive = drives.find((d) => d._id === driveId);
    if (drive) {
      setFormData((prev) => ({
        ...prev,
        driveId,
        companyName: drive.companyName,
        role: drive.role,
        ctc: drive.ctc?.toString() || '',
        stipend: drive.stipend?.toString() || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ctc: formData.ctc ? parseInt(formData.ctc) : undefined,
        stipend: formData.stipend ? parseInt(formData.stipend) : undefined,
      };

      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert('Placement created successfully!');
        router.push('/admin/placements');
      } else {
        alert(data.message || 'Failed to create placement');
      }
    } catch (error) {
      console.error('Failed to create placement:', error);
      alert('Failed to create placement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
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
              <h1 className="text-2xl font-bold text-gray-900">Create Placement</h1>
              <p className="text-sm text-gray-600 mt-1">Add a new placement offer</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div>
              <Label htmlFor="studentId">Student *</Label>
              <select
                id="studentId"
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.regNo} ({student.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Drive Selection */}
            <div>
              <Label htmlFor="driveId">Drive *</Label>
              <select
                id="driveId"
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.driveId}
                onChange={(e) => handleDriveChange(e.target.value)}
              >
                <option value="">Select Drive</option>
                {drives.map((drive) => (
                  <option key={drive._id} value={drive._id}>
                    {drive.companyName} - {drive.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Application Selection */}
            {applications.length > 0 && (
              <div>
                <Label htmlFor="applicationId">Application *</Label>
                <select
                  id="applicationId"
                  required
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.applicationId}
                  onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                >
                  <option value="">Select Application</option>
                  {applications.map((app: any) => (
                    <option key={app._id} value={app._id}>
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Company Name */}
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <input
                id="companyName"
                type="text"
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Role *</Label>
              <input
                id="role"
                type="text"
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            {/* CTC and Stipend */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctc">CTC (₹)</Label>
                <input
                  id="ctc"
                  type="number"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.ctc}
                  onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                  placeholder="e.g., 1200000"
                />
              </div>
              <div>
                <Label htmlFor="stipend">Stipend (₹)</Label>
                <input
                  id="stipend"
                  type="number"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="e.g., 15000"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offerDate">Offer Date *</Label>
                <input
                  id="offerDate"
                  type="date"
                  required
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.offerDate}
                  onChange={(e) => setFormData({ ...formData, offerDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="joiningDate">Joining Date</Label>
                <input
                  id="joiningDate"
                  type="date"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
            </div>

            {/* Offer Letter URL */}
            <div>
              <Label htmlFor="offerLetterUrl">Offer Letter URL</Label>
              <input
                id="offerLetterUrl"
                type="url"
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.offerLetterUrl}
                onChange={(e) => setFormData({ ...formData, offerLetterUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Placement'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
