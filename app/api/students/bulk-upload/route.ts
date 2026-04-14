import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// POST /api/students/bulk-upload - Bulk upload students (Admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return errorResponse('Invalid data: students array is required', 400);
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const studentData of students) {
      try {
        const { email, name, regNo, department, cgpa, graduationYear, degree, phone } = studentData;

        // Check if student already exists
        const existing = await Student.findOne({
          $or: [{ email }, { regNo }],
        });

        if (existing) {
          results.failed++;
          results.errors.push({
            regNo,
            email,
            error: 'Student already exists',
          });
          continue;
        }

        // Generate a temporary firebaseUid (will be updated when student registers)
        const tempFirebaseUid = `temp_${regNo}_${Date.now()}`;

        // Create student
        const student = await Student.create({
          firebaseUid: tempFirebaseUid,
          email,
          name,
          regNo,
          department,
          cgpa,
          graduationYear,
          degree,
          phone,
          role: 'student',
          activeBacklogs: 0,
          isActive: true,
        });

        // Create empty vault
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

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          regNo: studentData.regNo,
          email: studentData.email,
          error: error.message,
        });
      }
    }

    return successResponse(results, `Bulk upload completed: ${results.success} success, ${results.failed} failed`);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
