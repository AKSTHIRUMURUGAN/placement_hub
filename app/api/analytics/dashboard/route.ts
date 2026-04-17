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
    const year = parseInt(searchParams.get('year') || '2025'); // Default to 2025 for seeded data

    // Get current academic year students
    const students = await Student.find({ graduationYear: year, isActive: true });
    const studentIds = students.map((s) => s._id);

    // Get drives (all active drives, not just recent ones for demo purposes)
    const currentDate = new Date();

    const [
      totalStudents,
      totalDrives,
      activeDrives,
      totalApplications,
      selectedApplications, // Use selected applications instead of offers for now
      departmentStats,
      recentDrives,
    ] = await Promise.all([
      Student.countDocuments({ graduationYear: year, isActive: true }),
      Drive.countDocuments({}), // Count all drives
      Drive.countDocuments({ status: 'active' }),
      Application.countDocuments({ studentId: { $in: studentIds } }),
      Application.countDocuments({ studentId: { $in: studentIds }, status: 'selected' }),
      getDepartmentStats(studentIds),
      Drive.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate placement rate based on selected applications
    const placementRate = totalStudents > 0 ? ((selectedApplications / totalStudents) * 100).toFixed(2) : '0';

    // Get top skills in demand
    const topSkills = await getTopSkills();

    // Get unplaced students count
    const unplacedCount = totalStudents - selectedApplications;

    return successResponse({
      overview: {
        totalStudents,
        totalDrives,
        activeDrives,
        totalApplications,
        placedStudents: selectedApplications,
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
  const selectedApplications = await Application.find({ 
    studentId: { $in: studentIds }, 
    status: 'selected' 
  });

  const placedStudentIds = new Set();
  selectedApplications.forEach((app) => {
    placedStudentIds.add(app.studentId.toString());
  });

  const deptMap = new Map();

  students.forEach((student) => {
    if (!deptMap.has(student.department)) {
      deptMap.set(student.department, { total: 0, placed: 0 });
    }
    const stats = deptMap.get(student.department);
    stats.total += 1;
    if (placedStudentIds.has(student._id.toString())) {
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
