import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Offer from '@/lib/db/models/Offer';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/analytics/unplaced - Get unplaced students (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const department = searchParams.get('department');
    const minCgpa = parseFloat(searchParams.get('minCgpa') || '0');

    // Get all students for the year
    const query: any = { graduationYear: year, isActive: true };
    if (department) query.department = department;
    if (minCgpa > 0) query.cgpa = { $gte: minCgpa };

    const students = await Student.find(query).lean();
    const studentIds = students.map((s) => s._id);

    // Get placed students
    const offers = await Offer.find({
      studentId: { $in: studentIds },
      accepted: true,
    }).lean();

    const placedStudentIds = new Set(offers.map((o) => o.studentId.toString()));

    // Filter unplaced students
    const unplacedStudents = students.filter((s) => !placedStudentIds.has(s._id.toString()));

    return successResponse({
      unplacedStudents,
      total: unplacedStudents.length,
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
