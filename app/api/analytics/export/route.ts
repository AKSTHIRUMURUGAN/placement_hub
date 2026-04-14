import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import Drive from '@/lib/db/models/Drive';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/analytics/export - Export applications data (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('driveId');
    const status = searchParams.get('status');

    if (!driveId) {
      return errorResponse('Drive ID is required', 400);
    }

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    const query: any = { driveId };
    if (status) query.status = status;

    const applications = await Application.find(query).lean();

    // Get student and vault data
    const studentIds = applications.map((app) => app.studentId);
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const vaults = await Vault.find({ studentId: { $in: studentIds } }).lean();

    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));
    const vaultMap = new Map(vaults.map((v) => [v.studentId.toString(), v]));

    // Format data for export
    const exportData = applications.map((app) => {
      const student = studentMap.get(app.studentId.toString());
      const vault = vaultMap.get(app.studentId.toString());

      return {
        'Student Name': student?.name || '',
        'Registration Number': student?.regNo || '',
        Email: student?.email || '',
        Department: student?.department || '',
        CGPA: student?.cgpa || '',
        Phone: student?.phone || '',
        'Application Status': app.status,
        'Applied At': new Date(app.appliedAt).toLocaleString(),
        Skills: vault?.skills.map((s: any) => s.name).join(', ') || '',
        'Resume URL': vault?.resumes[0]?.url || '',
        GitHub: vault?.extraFields.github || '',
        LinkedIn: vault?.extraFields.linkedin || '',
        Portfolio: vault?.extraFields.portfolio || '',
        '10th Marks': vault?.extraFields.marks10th || '',
        '12th Marks': vault?.extraFields.marks12th || '',
      };
    });

    return successResponse({
      drive: {
        companyName: drive.companyName,
        role: drive.role,
      },
      data: exportData,
      count: exportData.length,
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
