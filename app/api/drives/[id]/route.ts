import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Drive from '@/lib/db/models/Drive';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import Application from '@/lib/db/models/Application';
import { requireAuth, requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';
import { checkEligibility } from '@/lib/eligibility/engine';

// GET /api/drives/[id] - Get drive by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const drive = await Drive.findById(params.id).lean();

    if (!drive) {
      return notFoundResponse('Drive not found');
    }

    // Get student and vault for eligibility check
    const student = await Student.findById(currentUser._id);
    const vault = await Vault.findOne({ studentId: currentUser._id });

    // Check eligibility
    const eligibility = checkEligibility(student!, drive as any, vault || undefined);

    // Check if student has applied
    const application = await Application.findOne({
      studentId: currentUser._id,
      driveId: params.id,
    }).lean();

    return successResponse({
      ...drive,
      eligibility: {
        isEligible: eligibility.isEligible,
        reasons: eligibility.reasons,
        matchScore: eligibility.matchScore,
      },
      application: application
        ? {
            _id: application._id,
            status: application.status,
            appliedAt: application.appliedAt,
          }
        : null,
      isNew: new Date(drive.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      deadlineUrgent: new Date(drive.closeDate).getTime() - Date.now() < 48 * 60 * 60 * 1000,
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

// PUT /api/drives/[id] - Update drive (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const drive = await Drive.findById(params.id);

    if (!drive) {
      return notFoundResponse('Drive not found');
    }

    const body = await request.json();

    // Update fields
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined) {
        (drive as any)[key] = body[key];
      }
    });

    await drive.save();

    return successResponse(drive, 'Drive updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

// DELETE /api/drives/[id] - Delete drive (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const drive = await Drive.findByIdAndDelete(params.id);

    if (!drive) {
      return notFoundResponse('Drive not found');
    }

    // Also delete all applications for this drive
    await Application.deleteMany({ driveId: params.id });

    return successResponse(null, 'Drive deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
