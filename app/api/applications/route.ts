import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Drive from '@/lib/db/models/Drive';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import Notification from '@/lib/db/models/Notification';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { checkEligibility, getMissingFields } from '@/lib/eligibility/engine';

// GET /api/applications - Get user applications
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = { studentId: currentUser._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('driveId')
      .sort({ appliedAt: -1 })
      .lean();

    return successResponse(applications);
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

// POST /api/applications - Submit application (One-Click Apply)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { driveId, additionalAnswers, missingFields } = body;

    if (!driveId) {
      return errorResponse('Drive ID is required', 400);
    }

    // Get drive
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    // Check if drive is active and not closed
    if (drive.status !== 'active') {
      return errorResponse('This drive is not active', 400);
    }

    if (new Date(drive.closeDate) < new Date()) {
      return errorResponse('This drive has closed', 400);
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      studentId: currentUser._id,
      driveId,
    });

    if (existingApplication) {
      return errorResponse('You have already applied to this drive', 400);
    }

    // Get student and vault
    const student = await Student.findById(currentUser._id);
    const vault = await Vault.findOne({ studentId: currentUser._id });

    if (!student) {
      return errorResponse('Student not found', 404);
    }

    // Check eligibility
    const eligibility = checkEligibility(student, drive, vault || undefined);
    if (!eligibility.isEligible) {
      return errorResponse('You are not eligible for this drive', 403);
    }

    // Check for missing required fields
    const missing = vault ? getMissingFields(vault, drive.requiredFields) : drive.requiredFields;

    // If there are missing fields and they weren't provided
    if (missing.length > 0 && (!missingFields || Object.keys(missingFields).length === 0)) {
      return errorResponse('Missing required fields', 400, { missingFields: missing });
    }

    // Update vault with missing fields if provided
    if (missingFields && vault) {
      Object.keys(missingFields).forEach((key) => {
        vault.extraFields[key] = missingFields[key];
      });
      await vault.save();
    }

    // Prepare submitted data from vault
    const submittedData: any = {
      cgpa: student.cgpa,
      department: student.department,
      skills: vault?.skills.map((s) => s.name) || [],
      extraFields: {
        ...vault?.extraFields,
        ...missingFields,
      },
    };

    // Add resume URL if available
    if (vault && vault.resumes.length > 0) {
      submittedData.resume = vault.resumes[0].url;
    }

    // Add additional answers if provided
    if (additionalAnswers) {
      submittedData.additionalAnswers = additionalAnswers;
    }

    // Create application
    const application = await Application.create({
      studentId: currentUser._id,
      driveId,
      status: 'applied',
      submittedData,
      timeline: [
        {
          status: 'applied',
          date: new Date(),
          note: 'Application submitted',
        },
      ],
      appliedAt: new Date(),
    });

    // Update drive applicant count
    drive.applicantCount += 1;
    await drive.save();

    // Create notification
    await Notification.create({
      userId: currentUser._id,
      type: 'system',
      title: 'Application Submitted',
      message: `Your application for ${drive.companyName} - ${drive.role} has been submitted successfully`,
      driveId,
      applicationId: application._id,
      priority: 'medium',
      channels: {
        inApp: true,
        email: false,
        whatsapp: false,
      },
    });

    return successResponse(application, 'Application submitted successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
