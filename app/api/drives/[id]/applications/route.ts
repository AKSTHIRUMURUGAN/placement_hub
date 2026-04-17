import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Student from '@/lib/db/models/Student';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/drives/[id]/applications - Get applications for a drive
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { driveId: id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const applications = await Application.find(query)
      .populate('studentId', 'name regNo email department cgpa graduationYear')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data to include student info at the top level
    const transformedApplications = applications.map(app => ({
      ...app,
      student: app.studentId,
      studentId: (app.studentId as any)._id
    }));

    // Get statistics
    const stats = await Application.aggregate([
      { $match: { driveId: id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = {
      total: 0,
      applied: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statsObj[stat._id as keyof typeof statsObj] = stat.count;
      statsObj.total += stat.count;
    });

    const total = await Application.countDocuments(query);

    return successResponse({
      applications: transformedApplications,
      stats: statsObj,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}