import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Offer from '@/lib/db/models/Offer';
import Student from '@/lib/db/models/Student';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/placements/stats - Get placement statistics (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || !['admin', 'placement-officer'].includes(user.role)) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');

    // Build query for students
    const studentQuery: any = {};
    if (year) {
      studentQuery.graduationYear = parseInt(year);
    }

    // Get total students
    const totalStudents = await Student.countDocuments(studentQuery);

    // Get placed students (accepted offers)
    const placedStudentsData = await Offer.aggregate([
      { $match: { accepted: true } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      ...(year ? [{ $match: { 'student.graduationYear': parseInt(year) } }] : []),
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgCtc: { $avg: '$ctc' },
          maxCtc: { $max: '$ctc' },
          minCtc: { $min: '$ctc' },
        },
      },
    ]);

    const placedStats = placedStudentsData[0] || {
      count: 0,
      avgCtc: 0,
      maxCtc: 0,
      minCtc: 0,
    };

    // Department-wise placement stats
    const departmentStats = await Offer.aggregate([
      { $match: { accepted: true } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      ...(year ? [{ $match: { 'student.graduationYear': parseInt(year) } }] : []),
      {
        $group: {
          _id: '$student.department',
          placed: { $sum: 1 },
          avgCtc: { $avg: '$ctc' },
          maxCtc: { $max: '$ctc' },
        },
      },
      { $sort: { placed: -1 } },
    ]);

    // Get total students per department for placement rate
    const departmentTotals = await Student.aggregate([
      { $match: studentQuery },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
        },
      },
    ]);

    const departmentTotalsMap = departmentTotals.reduce((acc: any, dept: any) => {
      acc[dept._id] = dept.total;
      return acc;
    }, {});

    const enrichedDepartmentStats = departmentStats.map((dept: any) => ({
      department: dept._id,
      placed: dept.placed,
      total: departmentTotalsMap[dept._id] || 0,
      placementRate: departmentTotalsMap[dept._id]
        ? ((dept.placed / departmentTotalsMap[dept._id]) * 100).toFixed(2)
        : '0.00',
      avgCtc: Math.round(dept.avgCtc || 0),
      maxCtc: dept.maxCtc || 0,
    }));

    // Top recruiting companies
    const topCompanies = await Offer.aggregate([
      { $match: { accepted: true } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      ...(year ? [{ $match: { 'student.graduationYear': parseInt(year) } }] : []),
      {
        $group: {
          _id: '$companyName',
          count: { $sum: 1 },
          avgCtc: { $avg: '$ctc' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Pending offers (not accepted/rejected)
    const pendingOffers = await Offer.countDocuments({
      accepted: false,
      rejectedAt: null,
    });

    const placementRate = totalStudents > 0
      ? ((placedStats.count / totalStudents) * 100).toFixed(2)
      : '0.00';

    return successResponse({
      overview: {
        totalStudents,
        placedStudents: placedStats.count,
        unplacedStudents: totalStudents - placedStats.count,
        placementRate: parseFloat(placementRate),
        pendingOffers,
        avgCtc: Math.round(placedStats.avgCtc || 0),
        maxCtc: placedStats.maxCtc || 0,
        minCtc: placedStats.minCtc || 0,
      },
      departmentStats: enrichedDepartmentStats,
      topCompanies: topCompanies.map((company: any) => ({
        company: company._id,
        placements: company.count,
        avgCtc: Math.round(company.avgCtc || 0),
      })),
    });
  } catch (error: any) {
    console.error('Get placement stats error:', error);
    return errorResponse(error.message || 'Failed to fetch placement stats', 500);
  }
}
