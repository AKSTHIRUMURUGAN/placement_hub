import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/students - Get all students (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const department = searchParams.get('department');
    const graduationYear = searchParams.get('graduationYear');
    const search = searchParams.get('search');

    const query: any = {};
    // This endpoint is used for student management screens.
    // The underlying collection can contain other roles as well, so enforce students-only.
    query.role = 'student';

    if (department) query.department = department;
    if (graduationYear) query.graduationYear = parseInt(graduationYear);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);

    return successResponse({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// POST /api/students - Create student (Admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const { firebaseUid, email, name, regNo, department, cgpa, graduationYear, degree, phone, role } = body;

    // Check if student already exists
    const existing = await Student.findOne({
      $or: [{ email }, { regNo }, { firebaseUid }],
    });

    if (existing) {
      return errorResponse('Student with this email, regNo, or firebaseUid already exists', 400);
    }

    // Create student
    const student = await Student.create({
      firebaseUid,
      email,
      name,
      regNo,
      department,
      cgpa,
      graduationYear,
      degree,
      phone,
      role: role || 'student',
      activeBacklogs: 0,
      isActive: true,
    });

    // Create empty vault for student
    await Vault.create({
      studentId: student._id,
      resumes: [],
      certificates: [],
      internships: [],
      projects: [],
      skills: [],
      extraFields: {},
      completenessScore: 0,
    });

    return successResponse(student, 'Student created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
