import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Company from '@/lib/db/models/Company';
import Drive from '@/lib/db/models/Drive';
import { requireCompany } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

async function resolveCompany(user: any) {
  let company = await Company.findOne({ $or: [{ hrEmail: user.email }, { firebaseUid: user.firebaseUid }] });
  if (!company) {
    const baseName = `${user.name || 'Company'} Organization`;
    try {
      company = await Company.create({
        name: baseName,
        about: 'Company profile pending details update.',
        industry: 'Technology',
        hrEmail: user.email,
        hrName: user.name || 'HR',
        firebaseUid: user.firebaseUid,
        isVerified: false,
        isActive: true,
        pastDrives: [],
      });
    } catch (err: any) {
      // If the default name is already taken, retry with a unique suffix
      if (String(err?.code) === '11000') {
        const suffix = (user.firebaseUid || user.email || Date.now().toString()).slice(-6);
        company = await Company.create({
          name: `${baseName} ${suffix}`,
          about: 'Company profile pending details update.',
          industry: 'Technology',
          hrEmail: user.email,
          hrName: user.name || 'HR',
          firebaseUid: user.firebaseUid,
          isVerified: false,
          isActive: true,
          pastDrives: [],
        });
      } else {
        throw err;
      }
    }
  }
  return company;
}

// GET /api/company/drives - Company-owned drives
export async function GET(request: NextRequest) {
  try {
    const user = await requireCompany(request);
    await connectDB();
    const company = await resolveCompany(user);

    const drives = await Drive.find({
      $or: [{ companyId: company._id }, { companyName: company.name }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(drives);
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

// POST /api/company/drives - Create drive by company HR
export async function POST(request: NextRequest) {
  try {
    const user = await requireCompany(request);
    await connectDB();
    const company = await resolveCompany(user);

    const body = await request.json();
    const { role, type, location, description, closeDate, eligibility } = body;

    if (!role || !type || !location || !description || !closeDate || !eligibility) {
      return errorResponse('Missing required fields', 400);
    }

    const drive = await Drive.create({
      companyName: company.name,
      companyLogo: company.logo,
      role,
      type,
      employmentType: body.employmentType || 'full-time',
      ctc: body.ctc,
      stipend: body.stipend,
      location,
      workMode: body.workMode || 'onsite',
      jdUrl: body.jdUrl,
      description,
      eligibility,
      requiredFields: body.requiredFields || [],
      additionalQuestions: body.additionalQuestions || [],
      rounds: body.rounds || [],
      openDate: body.openDate || new Date(),
      closeDate,
      resultDate: body.resultDate,
      status: body.status || 'draft',
      createdBy: user._id,
      companyId: company._id,
      applicantCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
    });

    return successResponse(drive, 'Drive created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
