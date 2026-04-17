import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Notification from '@/lib/db/models/Notification';
import Drive from '@/lib/db/models/Drive';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// POST /api/drives/[id]/notify - Send notification to all applicants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const { message, title, priority = 'medium' } = body;

    if (!message) {
      return errorResponse('Message is required', 400);
    }

    const drive = await Drive.findById(id);
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    // Get all students who applied to this drive
    const applications = await Application.find({ driveId: id }).distinct('studentId');
    
    if (applications.length === 0) {
      return errorResponse('No applicants found for this drive', 400);
    }

    // Create notifications for all applicants
    const notifications = applications.map(studentId => ({
      userId: studentId,
      type: 'drive_announcement',
      title: title || `Update from ${drive.companyName}`,
      message,
      driveId: id,
      priority,
      channels: {
        inApp: true,
        email: true,
        whatsapp: false,
      },
    }));

    await Notification.insertMany(notifications);

    return successResponse(
      { notificationsSent: notifications.length },
      `Notification sent to ${notifications.length} applicants`
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}