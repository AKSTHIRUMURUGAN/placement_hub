import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Drive from '@/lib/db/models/Drive';
import Student from '@/lib/db/models/Student';
import Vault from '@/lib/db/models/Vault';
import Application from '@/lib/db/models/Application';
import { requireAuth, requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { checkEligibility } from '@/lib/eligibility/engine';

// GET /api/drives - Get all drives (filtered by eligibility for students)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'full-time' | 'internship' | 'ppo'
    const status = searchParams.get('status'); // 'active' | 'closed'
    const tab = searchParams.get('tab'); // 'eligible' | 'all' | 'applied'

    const query: any = {};

    // Filter by type
    if (type) query.type = type;

    // Filter by status (default to active)
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
      query.closeDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    // Get student and vault for eligibility check
    const student = await Student.findById(currentUser._id);
    const vault = await Vault.findOne({ studentId: currentUser._id });

    let drives = await Drive.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get applications for this student
    const applicationMap = new Map();
    if (tab === 'applied') {
      const applications = await Application.find({
        studentId: currentUser._id,
        driveId: { $in: drives.map((d) => d._id) },
      }).lean();

      applications.forEach((app) => {
        applicationMap.set(app.driveId.toString(), app);
      });

      // Filter to only show applied drives
      drives = drives.filter((d) => applicationMap.has(d._id.toString()));
    } else {
      const applications = await Application.find({
        studentId: currentUser._id,
        driveId: { $in: drives.map((d) => d._id) },
      }).lean();

      applications.forEach((app) => {
        applicationMap.set(app.driveId.toString(), app);
      });
    }

    // Add eligibility info to each drive
    const drivesWithEligibility = drives.map((drive) => {
      const eligibility = checkEligibility(student!, drive as any, vault || undefined);
      const application = applicationMap.get(drive._id.toString());

      return {
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
      };
    });

    // Filter by eligibility if tab is 'eligible'
    let filteredDrives = drivesWithEligibility;
    if (tab === 'eligible') {
      filteredDrives = drivesWithEligibility.filter((d) => d.eligibility.isEligible);
    }

    const total = await Drive.countDocuments(query);

    return successResponse({
      drives: filteredDrives,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

// POST /api/drives - Create drive (Admin only)
export async function POST(request: NextRequest) {
  try {
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

    // Validation
    if (!companyName || !role || !type || !location || !description || !eligibility || !openDate || !closeDate) {
      return errorResponse('Missing required fields', 400);
    }

    // Create drive
    const drive = await Drive.create({
      companyName,
      companyLogo,
      role,
      type,
      employmentType: employmentType || 'full-time',
      ctc,
      stipend,
      location,
      workMode: workMode || 'onsite',
      jdUrl,
      description,
      eligibility,
      requiredFields: requiredFields || [],
      additionalQuestions: additionalQuestions || [],
      rounds: rounds || [],
      openDate,
      closeDate,
      resultDate,
      status: status || 'draft',
      createdBy: admin._id,
      applicantCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
    });

    return successResponse(drive, 'Drive created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
