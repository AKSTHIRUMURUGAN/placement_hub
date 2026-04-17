import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Company from '@/lib/db/models/Company';
import Drive from '@/lib/db/models/Drive';
import { requireCompany } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

async function resolveCompany(user: any) {
  const company = await Company.findOne({ $or: [{ hrEmail: user.email }, { firebaseUid: user.firebaseUid }] });
  if (!company) throw new Error('Company profile not found');
  return company;
}

async function getOwnedDrive(user: any, id: string) {
  const company = await resolveCompany(user);
  const drive = await Drive.findOne({
    _id: id,
    $or: [{ companyId: company._id }, { companyName: company.name }],
  });
  return { company, drive };
}

// GET /api/company/drives/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireCompany(request);
    await connectDB();
    const { drive } = await getOwnedDrive(user, id);
    if (!drive) return notFoundResponse('Drive not found');
    return successResponse(drive);
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

// PUT /api/company/drives/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireCompany(request);
    await connectDB();
    const { drive } = await getOwnedDrive(user, id);
    if (!drive) return notFoundResponse('Drive not found');

    const body = await request.json();
    const allowedFields = [
      'role',
      'type',
      'employmentType',
      'ctc',
      'stipend',
      'location',
      'workMode',
      'jdUrl',
      'description',
      'eligibility',
      'requiredFields',
      'additionalQuestions',
      'rounds',
      'openDate',
      'closeDate',
      'resultDate',
      'status',
    ];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (drive as any)[field] = body[field];
      }
    });

    await drive.save();
    return successResponse(drive, 'Drive updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

// DELETE /api/company/drives/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireCompany(request);
    await connectDB();
    const { drive } = await getOwnedDrive(user, id);
    if (!drive) return notFoundResponse('Drive not found');
    await drive.deleteOne();
    return successResponse(null, 'Drive deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
