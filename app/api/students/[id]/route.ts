import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { requireAuth, requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

// GET /api/students/[id] - Get student by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const student = await Student.findById(params.id).lean();

    if (!student) {
      return notFoundResponse('Student not found');
    }

    // Students can only view their own profile, admins can view any
    if (currentUser._id.toString() !== params.id) {
      await requireAdmin(request);
    }

    return successResponse(student);
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const student = await Student.findById(params.id);

    if (!student) {
      return notFoundResponse('Student not found');
    }

    // Students can only update their own profile
    if (currentUser._id.toString() !== params.id) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const { phone, dateOfBirth, gender } = body;

    // Students can only update limited fields
    if (phone) student.phone = phone;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (gender) student.gender = gender;

    await student.save();

    return successResponse(student, 'Profile updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/students/[id] - Delete student (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const student = await Student.findByIdAndDelete(params.id);

    if (!student) {
      return notFoundResponse('Student not found');
    }

    return successResponse(null, 'Student deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
