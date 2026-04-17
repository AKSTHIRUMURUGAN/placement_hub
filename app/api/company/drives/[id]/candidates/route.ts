import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Company from '@/lib/db/models/Company';
import Drive from '@/lib/db/models/Drive';
import Application from '@/lib/db/models/Application';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import { requireCompany } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

async function resolveCompany(user: any) {
  const company = await Company.findOne({ $or: [{ hrEmail: user.email }, { firebaseUid: user.firebaseUid }] });
  if (!company) throw new Error('Company profile not found');
  return company;
}

// GET /api/company/drives/[id]/candidates - candidate pool for company drive
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireCompany(request);
    await connectDB();

    const company = await resolveCompany(user);
    const drive = await Drive.findOne({
      _id: id,
      $or: [{ companyId: company._id }, { companyName: company.name }],
    }).lean();

    if (!drive) return notFoundResponse('Drive not found');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = { driveId: id };
    if (status) query.status = status;

    const applications = await Application.find(query).sort({ appliedAt: -1 }).lean();
    const studentIds = applications.map((a) => a.studentId);

    const [students, vaults] = await Promise.all([
      Student.find({ _id: { $in: studentIds } }).lean(),
      Vault.find({ studentId: { $in: studentIds } }).lean(),
    ]);

    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));
    const vaultMap = new Map(vaults.map((v) => [v.studentId.toString(), v]));

    const candidates = applications.map((app: any) => {
      const student = studentMap.get(app.studentId.toString());
      const vault = vaultMap.get(app.studentId.toString());
      return {
        applicationId: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        student: student
          ? {
              id: student._id,
              name: student.name,
              email: student.email,
              regNo: student.regNo,
              department: student.department,
              cgpa: student.cgpa,
              graduationYear: student.graduationYear,
            }
          : null,
        resumeUrl: vault?.resumes?.[0]?.url || app.submittedData?.resume || null,
        skills: vault?.skills?.map((s: any) => s.name) || app.submittedData?.skills || [],
        links: {
          github: vault?.extraFields?.github,
          linkedin: vault?.extraFields?.linkedin,
          portfolio: vault?.extraFields?.portfolio,
        },
      };
    });

    return successResponse({
      drive: {
        id: drive._id,
        companyName: drive.companyName,
        role: drive.role,
        type: drive.type,
      },
      candidates,
      stats: {
        total: candidates.length,
        applied: candidates.filter((c) => c.status === 'applied').length,
        shortlisted: candidates.filter((c) => c.status === 'shortlisted').length,
        selected: candidates.filter((c) => c.status === 'selected').length,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
