import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Drive from '@/lib/db/models/Drive';
import Notification from '@/lib/db/models/Notification';
import Application from '@/lib/db/models/Application';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// PUT /api/drives/[id]/status - Update drive status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const { status } = body;

    if (!status || !['draft', 'active', 'closed', 'completed'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    const drive = await Drive.findById(id);
    
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    const oldStatus = drive.status;
    drive.status = status;
    await drive.save();

    // Send notifications to applicants when status changes
    if (oldStatus !== status) {
      let notificationMessage = '';
      
      switch (status) {
        case 'active':
          notificationMessage = `The drive for ${drive.companyName} - ${drive.role} is now active and accepting applications.`;
          break;
        case 'closed':
          notificationMessage = `Applications for ${drive.companyName} - ${drive.role} have been closed.`;
          break;
        case 'completed':
          notificationMessage = `The recruitment process for ${drive.companyName} - ${drive.role} has been completed.`;
          break;
      }

      if (notificationMessage) {
        // Get all students who applied to this drive
        const applications = await Application.find({ driveId: id }).distinct('studentId');
        
        // Create notifications for all applicants
        const notifications = applications.map(studentId => ({
          userId: studentId,
          type: 'drive_update',
          title: 'Drive Status Update',
          message: notificationMessage,
          driveId: id,
          priority: 'medium',
          channels: {
            inApp: true,
            email: true,
            whatsapp: false,
          },
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    }

    return successResponse(drive, 'Drive status updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}