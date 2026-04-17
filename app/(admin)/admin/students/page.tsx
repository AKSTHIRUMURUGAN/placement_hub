'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Student = {
  _id: string;
  name: string;
  email: string;
  regNo: string;
  department: string;
  cgpa: number;
  graduationYear: number;
  role: string;
  isActive: boolean;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (search) params.set('search', search);
      if (department) params.set('department', department);

      const res = await fetch(`/api/students?${params.toString()}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load students');
      setStudents((payload.data.students || []).filter((s: Student) => s.role === 'student'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(students.map((s) => s.department))).sort(),
    [students]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Student Management</h1>
        <p className="mb-6 text-slate-600">View registered students and profile health.</p>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, reg no, email..."
            className="max-w-sm"
          />
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <Button onClick={fetchStudents} variant="outline">Apply</Button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading students...</Card>
        ) : (
          <Card className="overflow-x-auto border-slate-200 p-0">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Reg No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">CGPA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">No students found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{student.regNo}</td>
                      <td className="px-4 py-3 text-slate-700">{student.department}</td>
                      <td className="px-4 py-3 text-slate-700">{student.cgpa}</td>
                      <td className="px-4 py-3 text-slate-700">{student.graduationYear}</td>
                      <td className="px-4 py-3 text-slate-700">{student.role}</td>
                      <td className="px-4 py-3">
                        <Badge className={student.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
