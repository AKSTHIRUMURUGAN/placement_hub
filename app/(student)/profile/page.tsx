'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, Mail, Phone, Calendar, GraduationCap, Save, Upload, FileText, Camera, MapPin, Users, CreditCard, Hash } from 'lucide-react';
import { authManager } from '@/lib/utils/clientAuth';
import toast from 'react-hot-toast';

interface VaultData {
  extraFields: {
    fatherName?: string;
    motherName?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    marks10th?: number;
    marks12th?: number;
    aadhaarNumber?: string;
    panNumber?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    avatarUrl?: string;
    aadhaarUrl?: string;
    panUrl?: string;
  };
}

export default function ProfilePage() {
  const [studentId, setStudentId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    regNo: '',
    department: '',
    cgpa: '',
    graduationYear: '',
    degree: '',
    dateOfBirth: '',
    gender: 'Male',
    activeBacklogs: '0',
  });
  const [vaultData, setVaultData] = useState<VaultData>({
    extraFields: {}
  });
  const [initialData, setInitialData] = useState(formData);
  const [initialVaultData, setInitialVaultData] = useState<VaultData>({ extraFields: {} });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      setError('');
      try {
        // Check authentication
        if (!authManager.isAuthenticated()) {
          toast.error('Please sign in to access your profile');
          window.location.href = '/sign-in';
          return;
        }

        // Fetch student profile
        const res = await authManager.makeAuthenticatedRequest('/api/students/me', { 
          cache: 'no-store'
        });
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load profile');
        
        const student = payload.data.student;
        setStudentId(student._id);
        const mapped = {
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          regNo: student.regNo || '',
          department: student.department || '',
          cgpa: String(student.cgpa ?? ''),
          graduationYear: String(student.graduationYear ?? ''),
          degree: student.degree || '',
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: student.gender || 'Male',
          activeBacklogs: String(student.activeBacklogs ?? 0),
        };
        setFormData(mapped);
        setInitialData(mapped);

        // Fetch vault data for extra fields
        const vaultRes = await authManager.makeAuthenticatedRequest('/api/vault', { 
          cache: 'no-store'
        });
        const vaultPayload = await vaultRes.json();
        if (vaultRes.ok && vaultPayload.success) {
          setVaultData(vaultPayload.data);
          setInitialVaultData(vaultPayload.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setFetching(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const uploadingToast = toast.loading('Uploading avatar...');
    
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      formData.append('type', 'avatar');

      const response = await authManager.makeAuthenticatedRequest('/api/vault/extra-fields', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Upload failed');
      }

      setVaultData(prev => ({
        ...prev,
        extraFields: {
          ...prev?.extraFields,
          avatarUrl: payload.data.url,
          avatarPublicId: payload.data.publicId
        }
      }));

      toast.success('Avatar uploaded successfully!', { id: uploadingToast });
      setShowAvatarModal(false);
      setAvatarFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: uploadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'pan') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadingToast = toast.loading(`Uploading ${type.toUpperCase()} document...`);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await authManager.makeAuthenticatedRequest('/api/vault/extra-fields', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Upload failed');
      }

      setVaultData(prev => ({
        ...prev,
        extraFields: {
          ...prev?.extraFields,
          [`${type}Url`]: payload.data.url,
          [`${type}PublicId`]: payload.data.publicId
        }
      }));

      toast.success(`${type.toUpperCase()} document uploaded successfully!`, { id: uploadingToast });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: uploadingToast });
    } finally {
      setUploading(false);
    }
    event.target.value = '';
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Update student profile
      const res = await authManager.makeAuthenticatedRequest(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNo: formData.regNo,
          department: formData.department,
          cgpa: Number(formData.cgpa),
          graduationYear: Number(formData.graduationYear),
          degree: formData.degree,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender,
          activeBacklogs: Number(formData.activeBacklogs || 0),
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to save profile');

      // Update vault extra fields
      const vaultRes = await authManager.makeAuthenticatedRequest('/api/vault/extra-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraFields: vaultData?.extraFields || {}
        }),
      });
      const vaultPayload = await vaultRes.json();
      if (!vaultRes.ok || !vaultPayload.success) throw new Error(vaultPayload.message || 'Failed to save additional details');

      setSuccess('Profile updated successfully');
      setInitialData(formData);
      setInitialVaultData(vaultData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
          <p className="text-slate-600">Manage your personal information and academic details</p>
        </div>

        {fetching && <Card className="p-6 text-center text-slate-600 mb-6">Loading profile...</Card>}
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {vaultData?.extraFields?.avatarUrl ? (
                  <img 
                    src={vaultData?.extraFields?.avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-blue-600 font-semibold">
                    {(formData.name || 'S')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAvatarModal(true)}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="fatherName"
                    value={vaultData?.extraFields?.fatherName || ''}
                    onChange={(e) => setVaultData(prev => ({
                      ...prev,
                      extraFields: { ...prev?.extraFields, fatherName: e.target.value }
                    }))}
                    className="pl-10"
                    placeholder="Enter father's name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="motherName"
                    value={vaultData?.extraFields?.motherName || ''}
                    onChange={(e) => setVaultData(prev => ({
                      ...prev,
                      extraFields: { ...prev?.extraFields, motherName: e.target.value }
                    }))}
                    className="pl-10"
                    placeholder="Enter mother's name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select 
                  id="gender"
                  value={formData.gender} 
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="address"
                    value={vaultData?.extraFields?.address || ''}
                    onChange={(e) => setVaultData(prev => ({
                      ...prev,
                      extraFields: { ...prev?.extraFields, address: e.target.value }
                    }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={vaultData?.extraFields?.city || ''}
                  onChange={(e) => setVaultData(prev => ({
                    ...prev,
                    extraFields: { ...prev?.extraFields, city: e.target.value }
                  }))}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={vaultData?.extraFields?.state || ''}
                  onChange={(e) => setVaultData(prev => ({
                    ...prev,
                    extraFields: { ...prev?.extraFields, state: e.target.value }
                  }))}
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={vaultData?.extraFields?.pincode || ''}
                  onChange={(e) => setVaultData(prev => ({
                    ...prev,
                    extraFields: { ...prev?.extraFields, pincode: e.target.value }
                  }))}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Marks</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marks10th">10th Grade Percentage</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="marks10th"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={vaultData?.extraFields?.marks10th || ''}
                    onChange={(e) => setVaultData(prev => ({
                      ...prev,
                      extraFields: { ...prev?.extraFields, marks10th: Number(e.target.value) }
                    }))}
                    className="pl-10"
                    placeholder="Enter 10th percentage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks12th">12th Grade Percentage</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="marks12th"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={vaultData?.extraFields?.marks12th || ''}
                    onChange={(e) => setVaultData(prev => ({
                      ...prev,
                      extraFields: { ...prev?.extraFields, marks12th: Number(e.target.value) }
                    }))}
                    className="pl-10"
                    placeholder="Enter 12th percentage"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity Documents</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="aadhaarNumber"
                      value={vaultData?.extraFields?.aadhaarNumber || ''}
                      onChange={(e) => setVaultData(prev => ({
                        ...prev,
                        extraFields: { ...prev?.extraFields, aadhaarNumber: e.target.value }
                      }))}
                      className="pl-10"
                      placeholder="Enter Aadhaar number"
                      maxLength={12}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Aadhaar Document</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        className="hidden" 
                        onChange={(e) => handleDocumentUpload(e, 'aadhaar')}
                        disabled={uploading}
                      />
                      <Button type="button" variant="outline" size="sm" className="w-full" disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Aadhaar
                      </Button>
                    </label>
                    {vaultData?.extraFields?.aadhaarUrl && (
                      <a href={vaultData?.extraFields?.aadhaarUrl} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="panNumber"
                      value={vaultData?.extraFields?.panNumber || ''}
                      onChange={(e) => setVaultData(prev => ({
                        ...prev,
                        extraFields: { ...prev?.extraFields, panNumber: e.target.value.toUpperCase() }
                      }))}
                      className="pl-10"
                      placeholder="Enter PAN number"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>PAN Document</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        className="hidden" 
                        onChange={(e) => handleDocumentUpload(e, 'pan')}
                        disabled={uploading}
                      />
                      <Button type="button" variant="outline" size="sm" className="w-full" disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload PAN
                      </Button>
                    </label>
                    {vaultData?.extraFields?.panUrl && (
                      <a href={vaultData?.extraFields?.panUrl} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Profiles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  value={vaultData?.extraFields?.github || ''}
                  onChange={(e) => setVaultData(prev => ({
                    ...prev,
                    extraFields: { ...prev?.extraFields, github: e.target.value }
                  }))}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={vaultData?.extraFields?.linkedin || ''}
                  onChange={(e) => setVaultData(prev => ({
                    ...prev,
                    extraFields: { ...prev?.extraFields, linkedin: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  value={vaultData?.extraFields?.portfolio || ''}
                  onChange={(e) => setVaultData(prev => ({
                    ...prev,
                    extraFields: { ...prev?.extraFields, portfolio: e.target.value }
                  }))}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regNo">Registration Number</Label>
                <Input
                  id="regNo"
                  value={formData.regNo}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  value={formData.graduationYear}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cgpa"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activeBacklogs">Active Backlogs</Label>
                <Input
                  id="activeBacklogs"
                  value={formData.activeBacklogs}
                  onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFormData(initialData);
                setVaultData(initialVaultData);
              }}
            >
              Reset
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Avatar Upload Modal */}
        <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Profile Picture</DialogTitle>
              <DialogClose onClose={() => setShowAvatarModal(false)} />
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar-file">Select Image</Label>
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
              {avatarFile && (
                <div className="text-sm text-slate-600">
                  Selected: {avatarFile.name}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAvatarModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAvatarUpload} disabled={uploading || !avatarFile}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
