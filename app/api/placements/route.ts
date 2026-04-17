import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Offer from '@/lib/db/models/Offer';
import Student from '@/lib/db/models/Student';
import Application from '@/lib/db/models/Application';
import Drive from '@/lib/db/models/Drive';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/placements - Get all placements (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || !['admin', 'placement-officer'].includes(user.role)) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const year = searchParams.get('year');
    const department = searchParams.get('department');
    const status = searchParams.get('status'); // accepted, pending
    const search = searchParams.get('search');

    const query: any = {};

    // Filter by graduation year
    if (year) {
      const students = await Student.find({ graduationYear: parseInt(year) }).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }

    // Filter by department
    if (department) {
      const students = await Student.find({ department }).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }

    // Filter by acceptance status
    if (status === 'accepted') {
      query.accepted = true;
    } else if (status === 'pending') {
      query.accepted = false;
    }

    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('studentId', 'name email regNo department cgpa graduationYear')
        .populate('driveId', 'companyName role type')
        .sort({ offerDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Offer.countDocuments(query),
    ]);

    // Search filter (applied after population)
    let filteredOffers = offers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOffers = offers.filter((offer: any) => 
        offer.studentId?.name?.toLowerCase().includes(searchLower) ||
        offer.studentId?.email?.toLowerCase().includes(searchLower) ||
        offer.studentId?.regNo?.toLowerCase().includes(searchLower) ||
        offer.companyName?.toLowerCase().includes(searchLower)
      );
    }

    return successResponse({
      offers: filteredOffers,
      pagination: {
        page,
        limit,
        total: search ? filteredOffers.length : total,
        pages: Math.ceil((search ? filteredOffers.length : total) / limit),
      },
    });
  } catch (error: any) {
    console.error('Get placements error:', error);
    return errorResponse(error.message || 'Failed to fetch placements', 500);
  }
}

// POST /api/placements - Create new placement/offer (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || !['admin', 'placement-officer'].includes(user.role)) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();
    const {
      studentId,
      driveId,
      applicationId,
      companyName,
      role,
      ctc,
      stipend,
      joiningDate,
      offerLetterUrl,
      offerDate,
    } = body;

    // Validate required fields
    if (!studentId || !driveId || !applicationId || !companyName || !role) {
      return errorResponse('Missing required fields', 400);
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return errorResponse('Student not found', 404);
    }

    // Check if drive exists
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    // Check if application exists and is selected
    const application = await Application.findById(applicationId);
    if (!application) {
      return errorResponse('Application not found', 404);
    }

    // Check if offer already exists
    const existingOffer = await Offer.findOne({ applicationId });
    if (existingOffer) {
      return errorResponse('Offer already exists for this application', 400);
    }

    // Create offer
    const offer = await Offer.create({
      studentId,
      driveId,
      applicationId,
      companyName,
      role,
      ctc,
      stipend,
      joiningDate,
      offerLetterUrl,
      offerDate: offerDate || new Date(),
    });

    // Update application status to selected
    application.status = 'selected';
    application.timeline.push({
      status: 'selected',
      date: new Date(),
      note: 'Offer created',
    });
    await application.save();

    return successResponse(
      { offer },
      'Placement offer created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create placement error:', error);
    return errorResponse(error.message || 'Failed to create placement', 500);
  }
}
