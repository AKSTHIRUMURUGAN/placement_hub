import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Offer from '@/lib/db/models/Offer';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/placements/:id - Get placement details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { id } = await params;
    const offer = await Offer.findById(id)
      .populate('studentId', 'name email regNo department cgpa graduationYear phone')
      .populate('driveId', 'companyName role type ctc stipend location workMode')
      .populate('applicationId', 'status appliedAt')
      .lean();

    if (!offer) {
      return errorResponse('Placement not found', 404);
    }

    // Students can only view their own placements
    if (user.role === 'student' && offer.studentId._id.toString() !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse({ offer });
  } catch (error: any) {
    console.error('Get placement error:', error);
    return errorResponse(error.message || 'Failed to fetch placement', 500);
  }
}

// PUT /api/placements/:id - Update placement
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || !['admin', 'placement-officer'].includes(user.role)) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();
    const {
      companyName,
      role,
      ctc,
      stipend,
      joiningDate,
      offerLetterUrl,
      offerDate,
    } = body;

    const { id } = await params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return errorResponse('Placement not found', 404);
    }

    // Update fields
    if (companyName) offer.companyName = companyName;
    if (role) offer.role = role;
    if (ctc !== undefined) offer.ctc = ctc;
    if (stipend !== undefined) offer.stipend = stipend;
    if (joiningDate) offer.joiningDate = joiningDate;
    if (offerLetterUrl) offer.offerLetterUrl = offerLetterUrl;
    if (offerDate) offer.offerDate = offerDate;

    await offer.save();

    return successResponse({ offer }, 'Placement updated successfully');
  } catch (error: any) {
    console.error('Update placement error:', error);
    return errorResponse(error.message || 'Failed to update placement', 500);
  }
}

// DELETE /api/placements/:id - Delete placement
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || !['admin', 'placement-officer'].includes(user.role)) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { id } = await params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return errorResponse('Placement not found', 404);
    }

    await offer.deleteOne();

    return successResponse(null, 'Placement deleted successfully');
  } catch (error: any) {
    console.error('Delete placement error:', error);
    return errorResponse(error.message || 'Failed to delete placement', 500);
  }
}
