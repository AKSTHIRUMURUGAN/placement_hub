import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Drive from '@/lib/db/models/Drive';
import Application from '@/lib/db/models/Application';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/drives/[id] - Get drive details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(request);
    await connectDB();

    const drive = await Drive.findById(id).lean();
    
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    return successResponse(drive);
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

// PUT /api/drives/[id] - Update drive
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const {
      companyName,
      companyLogo,
      role,
      type,
      employmentType,
      ctc,
      stipend,
      location,
      workMode,
      jdUrl,
      description,
      eligibility,
      requiredFields,
      additionalQuestions,
      rounds,
      openDate,
      closeDate,
      resultDate,
      status,
    } = body;

    const drive = await Drive.findById(id);
    
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    // Update drive fields
    const updatedDrive = await Drive.findByIdAndUpdate(
      id,
      {
        companyName,
        companyLogo,
        role,
        type,
        employmentType,
        ctc,
        stipend,
        location,
        workMode,
        jdUrl,
        description,
        eligibility,
        requiredFields,
        additionalQuestions,
        rounds,
        openDate,
        closeDate,
        resultDate,
        status,
      },
      { new: true, runValidators: true }
    );

    return successResponse(updatedDrive, 'Drive updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/drives/[id] - Delete drive
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(request);
    await connectDB();

    const drive = await Drive.findById(id);
    
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ driveId: id });
    
    if (applicationCount > 0) {
      return errorResponse('Cannot delete drive with existing applications', 400);
    }

    await Drive.findByIdAndDelete(id);

    return successResponse(null, 'Drive deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}