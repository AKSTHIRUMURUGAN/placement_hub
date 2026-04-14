import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Drive from '@/lib/db/models/Drive';
import Application from '@/lib/db/models/Application';
import Offer from '@/lib/db/models/Offer';
import { requireAdmin } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/analytics/dashboard - Get placement dashboard stats (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Get current academic year students
    const students = await Student.find({ graduationYear: year, isActive: true });
    const studentIds = students.map((s) => s._id);

    // Get drives for current semester
    const currentDate = new Date();
    const semesterStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);

    const [
      totalStudents,
      totalDrives,
      activeDrives,
      totalApplications,
      placedStudents,
      departmentStats,
      recentDrives,
    ] = await Promise.all([
      Student.countDocuments({ graduationYear: year, isActive: true }),
      Drive.countDocuments({ createdAt: { $gte: semesterStart } }),
      Drive.countDocuments({ status: 'active', closeDate: { $gte: currentDate } }),
      Application.countDocuments({ studentId: { $in: studentIds } }),
      Offer.countDocuments({ studentId: { $in: studentIds }, accepted: true }),
      getDepartmentStats(studentIds),
      Drive.find({ createdAt: { $gte: semesterStart } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate placement rate
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : '0';

    // Get top skills in demand
    const topSkills = await getTopSkills();

    // Get unplaced students count
    const unplacedCount = totalStudents - placedStudents;

    return successResponse({
      overview: {
        totalStudents,
        totalDrives,
        activeDrives,
        totalApplications,
        placedStudents,
        unplacedCount,
        placementRate: parseFloat(placementRate),
      },
      departmentStats,
      topSkills,
      recentDrives,
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}

async function getDepartmentStats(studentIds: any[]) {
  const students = await Student.find({ _id: { $in: studentIds } });
  const offers = await Offer.find({ studentId: { $in: studentIds }, accepted: true });

  const offerMap = new Map();
  offers.forEach((offer) => {
    offerMap.set(offer.studentId.toString(), true);
  });

  const deptMap = new Map();

  students.forEach((student) => {
    if (!deptMap.has(student.department)) {
      deptMap.set(student.department, { total: 0, placed: 0 });
    }
    const stats = deptMap.get(student.department);
    stats.total += 1;
    if (offerMap.has(student._id.toString())) {
      stats.placed += 1;
    }
  });

  return Array.from(deptMap.entries()).map(([department, stats]) => ({
    department,
    total: stats.total,
    placed: stats.placed,
    placementRate: stats.total > 0 ? ((stats.placed / stats.total) * 100).toFixed(2) : '0',
  }));
}

async function getTopSkills() {
  const drives = await Drive.find({ status: { $in: ['active', 'closed'] } })
    .select('eligibility.requiredSkills')
    .lean();

  const skillCount = new Map();

  drives.forEach((drive) => {
    drive.eligibility.requiredSkills.forEach((skill: string) => {
      skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
    });
  });

  return Array.from(skillCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
}
