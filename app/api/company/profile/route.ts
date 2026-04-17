import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Company from '@/lib/db/models/Company';
import { requireCompany } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

async function getOrCreateCompany(user: any) {
  let company = await Company.findOne({
    $or: [{ hrEmail: user.email }, { firebaseUid: user.firebaseUid }],
  });

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

// GET /api/company/profile - Get or initialize HR company profile
export async function GET(request: NextRequest) {
  try {
    const user = await requireCompany(request);
    await connectDB();
    const company = await getOrCreateCompany(user);
    return successResponse(company);
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

// PUT /api/company/profile - Update HR company profile
export async function PUT(request: NextRequest) {
  try {
    const user = await requireCompany(request);
    await connectDB();
    const company = await getOrCreateCompany(user);

    const body = await request.json();
    const allowedFields = ['name', 'logo', 'about', 'website', 'industry', 'hrName', 'hrPhone'];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (company as any)[field] = body[field];
      }
    });

    try {
      await company.save();
    } catch (err: any) {
      if (String(err?.code) === '11000') {
        return errorResponse('Company name or email already exists', 400);
      }
      throw err;
    }
    return successResponse(company, 'Company profile updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
