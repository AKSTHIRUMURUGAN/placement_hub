import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Offer from '@/lib/db/models/Offer';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// POST /api/placements/:id/reject - Reject offer (student)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await req.json();
    const { reason } = body;

    const { id } = await params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return errorResponse('Offer not found', 404);
    }

    // Verify student owns this offer
    if (offer.studentId.toString() !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    // Check if already accepted or rejected
    if (offer.accepted) {
      return errorResponse('Cannot reject an accepted offer', 400);
    }
    if (offer.rejectedAt) {
      return errorResponse('Offer already rejected', 400);
    }

    // Reject offer
    offer.rejectedAt = new Date();
    offer.rejectionReason = reason;
    await offer.save();

    return successResponse({ offer }, 'Offer rejected successfully');
  } catch (error: any) {
    console.error('Reject offer error:', error);
    return errorResponse(error.message || 'Failed to reject offer', 500);
  }
}
