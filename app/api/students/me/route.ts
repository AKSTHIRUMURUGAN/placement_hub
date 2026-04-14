import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/students/me - Get current student profile
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const student = await Student.findById(currentUser._id).lean();
    const vault = await Vault.findOne({ studentId: currentUser._id }).lean();

    return successResponse({
      student,
      vault,
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}
