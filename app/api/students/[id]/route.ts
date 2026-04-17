import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { requireAuth, requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

// GET /api/students/[id] - Get student by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { id } = await params;
    const student = await Student.findById(id).lean();

    if (!student) {
      return notFoundResponse('Student not found');
    }

    // Students can only view their own profile, admins can view any
    if (currentUser._id.toString() !== id) {
      await requireAdmin(request);
    }

    return successResponse(student);
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { id } = await params;
    const student = await Student.findById(id);

    if (!student) {
      return notFoundResponse('Student not found');
    }

    // Students can only update their own profile
    if (currentUser._id.toString() !== id) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const { regNo, department, cgpa, graduationYear, degree, phone, dateOfBirth, gender, activeBacklogs } = body;

    // Allow updating all fields during profile setup
    if (regNo) student.regNo = regNo;
    if (department) student.department = department;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (graduationYear) student.graduationYear = graduationYear;
    if (degree) student.degree = degree;
    if (phone) student.phone = phone;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (gender) student.gender = gender;
    if (activeBacklogs !== undefined) student.activeBacklogs = activeBacklogs;

    await student.save();

    return successResponse(student, 'Profile updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/students/[id] - Delete student (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { id } = await params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return notFoundResponse('Student not found');
    }

    return successResponse(null, 'Student deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
