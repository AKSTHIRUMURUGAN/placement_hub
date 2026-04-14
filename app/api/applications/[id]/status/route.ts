import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Drive from '@/lib/db/models/Drive';
import Student from '@/lib/db/models/Student';
import Notification from '@/lib/db/models/Notification';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/response';
import { sendStatusChangeEmail } from '@/lib/notifications/email';

// PUT /api/applications/[id]/status - Update application status (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { status, note, currentRound } = body;

    if (!status) {
      return errorResponse('Status is required', 400);
    }

    const validStatuses = ['applied', 'under-review', 'shortlisted', 'rejected', 'selected'];
    if (!validStatuses.includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    const application = await Application.findById(params.id);

    if (!application) {
      return notFoundResponse('Application not found');
    }

    // Update status
    application.status = status;
    if (currentRound) application.currentRound = currentRound;

    application.timeline.push({
      status,
      date: new Date(),
      note: note || `Status updated to ${status}`,
    } as any);

    await application.save();

    // Update drive counts
    const drive = await Drive.findById(application.driveId);
    if (drive) {
      if (status === 'shortlisted') {
        drive.shortlistedCount += 1;
      } else if (status === 'selected') {
        drive.selectedCount += 1;
      }
      await drive.save();
    }

    // Get student for notification
    const student = await Student.findById(application.studentId);

    // Create notification
    if (student) {
      const notificationTypes: Record<string, any> = {
        shortlisted: { type: 'shortlisted', title: 'You are Shortlisted!' },
        selected: { type: 'selected', title: 'Congratulations! You are Selected' },
        rejected: { type: 'rejected', title: 'Application Update' },
      };

      const notifInfo = notificationTypes[status];

      if (notifInfo && drive) {
        await Notification.create({
          userId: student._id,
          type: notifInfo.type,
          title: notifInfo.title,
          message: `Your application for ${drive.companyName} - ${drive.role} has been ${status}`,
          driveId: drive._id,
          applicationId: application._id,
          priority: status === 'selected' ? 'high' : 'medium',
          channels: {
            inApp: true,
            email: true,
            whatsapp: status === 'selected' || status === 'shortlisted',
          },
        });

        // Send email notification
        if (drive) {
          await sendStatusChangeEmail(
            student.email,
            student.name,
            {
              companyName: drive.companyName,
              role: drive.role,
            },
            status
          );
        }
      }
    }

    return successResponse(application, 'Application status updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}
