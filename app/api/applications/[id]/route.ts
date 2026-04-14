import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Drive from '@/lib/db/models/Drive';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

// GET /api/applications/[id] - Get application details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const application = await Application.findById(params.id).populate('driveId').lean();

    if (!application) {
      return notFoundResponse('Application not found');
    }

    // Students can only view their own applications
    if (application.studentId.toString() !== currentUser._id.toString()) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse(application);
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

// PUT /api/applications/[id]/withdraw - Withdraw application
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const application = await Application.findById(params.id);

    if (!application) {
      return notFoundResponse('Application not found');
    }

    // Students can only withdraw their own applications
    if (application.studentId.toString() !== currentUser._id.toString()) {
      return errorResponse('Forbidden', 403);
    }

    // Check if application can be withdrawn (within 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    if (application.appliedAt < twoHoursAgo) {
      return errorResponse('Application can only be withdrawn within 2 hours of submission', 400);
    }

    // Check if already withdrawn or in advanced stage
    if (application.status === 'withdrawn') {
      return errorResponse('Application already withdrawn', 400);
    }

    if (['shortlisted', 'selected', 'rejected'].includes(application.status)) {
      return errorResponse('Cannot withdraw application at this stage', 400);
    }

    // Update application status
    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    application.timeline.push({
      status: 'withdrawn',
      date: new Date(),
      note: 'Application withdrawn by student',
    } as any);

    await application.save();

    // Update drive applicant count
    const drive = await Drive.findById(application.driveId);
    if (drive) {
      drive.applicantCount = Math.max(0, drive.applicantCount - 1);
      await drive.save();
    }

    return successResponse(application, 'Application withdrawn successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
