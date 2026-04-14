import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/lib/db/models/Notification';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const notification = await Notification.findById(params.id);

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    // Users can only mark their own notifications as read
    if (notification.userId.toString() !== currentUser._id.toString()) {
      return errorResponse('Forbidden', 403);
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return successResponse(notification, 'Notification marked as read');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
