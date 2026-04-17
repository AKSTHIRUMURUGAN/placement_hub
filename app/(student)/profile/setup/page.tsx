'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User } from 'lucide-react';
import { auth } from '@/lib/firebase/client';
import toast from 'react-hot-toast';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    regNo: '',
    department: '',
    cgpa: '',
    graduationYear: new Date().getFullYear() + 1,
    degree: 'B.Tech',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Other',
  ];

  const degrees = ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MBA', 'MCA'];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Updating your profile...');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get fresh ID token from Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('Please sign in again', { id: loadingToast });
        router.push('/sign-in');
        return;
      }

      const idToken = await currentUser.getIdToken(true);

      const response = await fetch(`/api/students/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ...formData,
          cgpa: parseFloat(formData.cgpa),
          graduationYear: parseInt(formData.graduationYear.toString()),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('idToken', idToken);
        
        toast.success('Profile setup completed successfully!', { id: loadingToast });
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Failed to update profile', { id: loadingToast });
      }
    } catch (err: any) {
      toast.error('An error occurred. Please try again.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Please provide your academic details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="regNo" className="text-sm font-medium text-gray-700">
                Registration Number *
              </Label>
              <Input
                id="regNo"
                type="text"
                placeholder="e.g., 2021CS001"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="h-11"
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department *
              </Label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* CGPA */}
            <div className="space-y-2">
              <Label htmlFor="cgpa" className="text-sm font-medium text-gray-700">
                CGPA *
              </Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g., 8.5"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="h-11"
                required
              />
            </div>

            {/* Degree */}
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-sm font-medium text-gray-700">
                Degree *
              </Label>
              <select
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {degrees.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </div>

            {/* Graduation Year */}
            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="text-sm font-medium text-gray-700">
                Graduation Year *
              </Label>
              <Input
                id="graduationYear"
                type="number"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
                placeholder="e.g., 2025"
                value={formData.graduationYear}
                onChange={(e) =>
                  setFormData({ ...formData, graduationYear: parseInt(e.target.value) })
                }
                className="h-11"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender
              </Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            All fields marked with * are required
          </p>
        </div>
      </Card>
    </div>
  );
}
