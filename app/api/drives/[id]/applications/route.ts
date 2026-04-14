import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Drive from '@/lib/db/models/Drive';
import Application from '@/lib/db/models/Application';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

// GET /api/drives/[id]/applications - Get all applications for a drive (Admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    const drive = await Drive.findById(params.id);

    if (!drive) {
      return notFoundResponse('Drive not found');
    }

    const query: any = { driveId: params.id };

    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('studentId')
      .sort({ appliedAt: -1 })
      .lean();

    // Get vault data for each student
    const studentIds = applications.map((app) => app.studentId);
    const vaults = await Vault.find({ studentId: { $in: studentIds } }).lean();
    const vaultMap = new Map(vaults.map((v) => [v.studentId.toString(), v]));

    // Combine application, student, and vault data
    let applicationsWithData = applications.map((app: any) => {
      const vault = vaultMap.get(app.studentId._id.toString());
      return {
        _id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        currentRound: app.currentRound,
        student: {
          _id: app.studentId._id,
          name: app.studentId.name,
          email: app.studentId.email,
          regNo: app.studentId.regNo,
          department: app.studentId.department,
          cgpa: app.studentId.cgpa,
          phone: app.studentId.phone,
        },
        submittedData: app.submittedData,
        vault: vault
          ? {
              resumeUrl: vault.resumes[0]?.url,
              skills: vault.skills.map((s: any) => s.name),
              github: vault.extraFields.github,
              linkedin: vault.extraFields.linkedin,
              portfolio: vault.extraFields.portfolio,
            }
          : null,
      };
    });

    // Apply filters
    if (department) {
      applicationsWithData = applicationsWithData.filter((app) => app.student.department === department);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      applicationsWithData = applicationsWithData.filter(
        (app) =>
          app.student.name.toLowerCase().includes(searchLower) ||
          app.student.email.toLowerCase().includes(searchLower) ||
          app.student.regNo.toLowerCase().includes(searchLower)
      );
    }

    return successResponse({
      drive: {
        _id: drive._id,
        companyName: drive.companyName,
        role: drive.role,
        type: drive.type,
      },
      applications: applicationsWithData,
      stats: {
        total: applications.length,
        applied: applications.filter((a) => a.status === 'applied').length,
        underReview: applications.filter((a) => a.status === 'under-review').length,
        shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
        selected: applications.filter((a) => a.status === 'selected').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
