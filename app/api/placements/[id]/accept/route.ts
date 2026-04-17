import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Offer from '@/lib/db/models/Offer';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// POST /api/placements/:id/accept - Accept offer (student)
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
      return errorResponse('Offer already accepted', 400);
    }
    if (offer.rejectedAt) {
      return errorResponse('Offer already rejected', 400);
    }

    // Accept offer
    offer.accepted = true;
    offer.acceptedAt = new Date();
    await offer.save();

    return successResponse({ offer }, 'Offer accepted successfully');
  } catch (error: any) {
    console.error('Accept offer error:', error);
    return errorResponse(error.message || 'Failed to accept offer', 500);
  }
}
