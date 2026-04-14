import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/lib/db/models/Notification';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// PUT /api/notifications/read-all - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    await Notification.updateMany(
      { userId: currentUser._id, read: false },
      { read: true, readAt: new Date() }
    );

    return successResponse(null, 'All notifications marked as read');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
