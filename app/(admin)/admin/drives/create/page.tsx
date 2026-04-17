'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateDrivePage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const driveType = searchParams.get('type') || 'full-time';
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    role: '',
    type: driveType,
    employmentType: 'full-time',
    ctc: '',
    stipend: '',
    duration: driveType === 'internship' ? '3 months' : '',
    location: '',
    workMode: 'onsite',
    jdUrl: '',
    description: '',
    eligibility: {
      minCgpa: '',
      departments: [''],
      requiredSkills: [''],
      maxBacklogs: '',
      degrees: ['B.Tech'],
      graduationYears: [2025],
    },
    requiredFields: ['resume'],
    rounds: [{ name: 'Application Review' }],
    openDate: new Date().toISOString().split('T')[0],
    closeDate: '',
    status: 'draft',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEligibilityChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: value
      }
    }));
  };

  const addArrayItem = (field: string, subField?: string) => {
    if (subField) {
      setFormData(prev => {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: {
            ...fieldValue,
            [subField]: [...(fieldValue[subField] || []), '']
          }
        };
      });
    } else {
      setFormData(prev => {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: [...(fieldValue || []), field === 'rounds' ? { name: '' } : '']
        };
      });
    }
  };

  const removeArrayItem = (field: string, index: number, subField?: string) => {
    if (subField) {
      setFormData(prev => {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: {
            ...fieldValue,
            [subField]: (fieldValue[subField] || []).filter((_: any, i: number) => i !== index)
          }
        };
      });
    } else {
      setFormData(prev => {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: (fieldValue || []).filter((_: any, i: number) => i !== index)
        };
      });
    }
  };

  const updateArrayItem = (field: string, index: number, value: any, subField?: string, itemField?: string) => {
    if (subField) {
      setFormData(prev => {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: {
            ...fieldValue,
            [subField]: (fieldValue[subField] || []).map((item: any, i: number) => 
              i === index ? value : item
            )
          }
        };
      });
    } else {
      setFormData(prev => {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: (fieldValue || []).map((item: any, i: number) => 
            i === index ? (itemField ? { ...item, [itemField]: value } : value) : item
          )
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Creating drive...');

    try {
      // Clean up the data
      const payload = {
        ...formData,
        ctc: formData.ctc ? parseInt(formData.ctc) : undefined,
        stipend: formData.stipend ? parseInt(formData.stipend) : undefined,
        eligibility: {
          ...formData.eligibility,
          minCgpa: parseFloat(formData.eligibility.minCgpa),
          maxBacklogs: parseInt(formData.eligibility.maxBacklogs),
          departments: formData.eligibility.departments.filter(d => d.trim()),
          requiredSkills: formData.eligibility.requiredSkills.filter(s => s.trim()),
        },
        rounds: formData.rounds.filter(r => r.name.trim()),
      };

      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Drive created successfully!', { id: loadingToast });
        router.push('/admin/drives');
      } else {
        toast.error(data.message || 'Failed to create drive', { id: loadingToast });
      }
    } catch (error) {
      console.error('Failed to create drive:', error);
      toast.error('Failed to create drive', { id: loadingToast });
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
              <h1 className="text-2xl font-bold text-gray-900">
                Create New {formData.type === 'internship' ? 'Internship' : 'Drive'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Add a new {formData.type === 'internship' ? 'internship opportunity' : 'placement drive'} for companies
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g., TechCorp Solutions"
                />
              </div>
              <div>
                <Label htmlFor="role">Job Role *</Label>
                <Input
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <Label htmlFor="type">Drive Type *</Label>
                <select
                  id="type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="ppo">PPO</option>
                </select>
              </div>
              <div>
                <Label htmlFor="workMode">Work Mode *</Label>
                <select
                  id="workMode"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.workMode}
                  onChange={(e) => handleInputChange('workMode', e.target.value)}
                >
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Bangalore, India"
                />
              </div>
              <div>
                <Label htmlFor="jdUrl">Job Description URL</Label>
                <Input
                  id="jdUrl"
                  type="url"
                  value={formData.jdUrl}
                  onChange={(e) => handleInputChange('jdUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </Card>

          {/* Compensation */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Compensation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctc">
                  {formData.type === 'internship' ? 'Stipend (₹ per month)' : 'CTC (₹ per annum)'}
                </Label>
                <Input
                  id="ctc"
                  type="number"
                  value={formData.type === 'internship' ? formData.stipend : formData.ctc}
                  onChange={(e) => handleInputChange(
                    formData.type === 'internship' ? 'stipend' : 'ctc', 
                    e.target.value
                  )}
                  placeholder={formData.type === 'internship' ? 'e.g., 25000' : 'e.g., 1200000'}
                />
              </div>
              {formData.type === 'internship' && (
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <select
                    id="duration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  >
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              )}
            </div>
          </Card>

          {/* Job Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Job Description</h2>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>
          </Card>

          {/* Eligibility Criteria */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Eligibility Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="minCgpa">Minimum CGPA *</Label>
                <Input
                  id="minCgpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={formData.eligibility.minCgpa}
                  onChange={(e) => handleEligibilityChange('minCgpa', e.target.value)}
                  placeholder="e.g., 7.5"
                />
              </div>
              <div>
                <Label htmlFor="maxBacklogs">Maximum Backlogs *</Label>
                <Input
                  id="maxBacklogs"
                  type="number"
                  min="0"
                  required
                  value={formData.eligibility.maxBacklogs}
                  onChange={(e) => handleEligibilityChange('maxBacklogs', e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>
            </div>

            {/* Departments */}
            <div className="mb-4">
              <Label>Eligible Departments *</Label>
              {formData.eligibility.departments.map((dept, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={dept}
                    onChange={(e) => updateArrayItem('eligibility', index, e.target.value, 'departments')}
                    placeholder="e.g., Computer Science"
                  />
                  {formData.eligibility.departments.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('eligibility', index, 'departments')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('eligibility', 'departments')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>

            {/* Required Skills */}
            <div>
              <Label>Required Skills</Label>
              {formData.eligibility.requiredSkills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateArrayItem('eligibility', index, e.target.value, 'requiredSkills')}
                    placeholder="e.g., JavaScript, React"
                  />
                  {formData.eligibility.requiredSkills.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('eligibility', index, 'requiredSkills')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('eligibility', 'requiredSkills')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </Card>

          {/* Selection Rounds */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Selection Rounds</h2>
            {formData.rounds.map((round, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  value={round.name}
                  onChange={(e) => updateArrayItem('rounds', index, e.target.value, undefined, 'name')}
                  placeholder="e.g., Technical Interview"
                />
                {formData.rounds.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('rounds', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('rounds')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Round
            </Button>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openDate">Application Open Date *</Label>
                <Input
                  id="openDate"
                  type="date"
                  required
                  value={formData.openDate}
                  onChange={(e) => handleInputChange('openDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="closeDate">Application Close Date *</Label>
                <Input
                  id="closeDate"
                  type="date"
                  required
                  value={formData.closeDate}
                  onChange={(e) => handleInputChange('closeDate', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleInputChange('status', 'draft');
                handleSubmit(new Event('submit') as any);
              }}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleInputChange('status', 'active')}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create & Publish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}