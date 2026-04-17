import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Drive from '@/lib/db/models/Drive';
import Application from '@/lib/db/models/Application';
import Offer from '@/lib/db/models/Offer';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/super-admin/stats - Get system-wide statistics (super admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Unauthorized - Super admin access required', 401);
    }

    await connectDB();

    // Get user counts by role
    const userStats = await Student.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          blacklisted: { $sum: { $cond: ['$isBlacklisted', 1, 0] } },
        },
      },
    ]);

    // Get drive statistics
    const driveStats = await Drive.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get application statistics
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get placement statistics
    const placementStats = await Offer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { $sum: { $cond: ['$accepted', 1, 0] } },
          pending: { $sum: { $cond: [{ $and: [{ $not: '$accepted' }, { $not: '$rejectedAt' }] }, 1, 0] } },
          rejected: { $sum: { $cond: ['$rejectedAt', 1, 0] } },
          avgCtc: { $avg: '$ctc' },
          maxCtc: { $max: '$ctc' },
        },
      },
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = {
      newUsers: await Student.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newDrives: await Drive.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newApplications: await Application.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      newPlacements: await Offer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    };

    // Department-wise student distribution
    const departmentStats = await Student.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgCgpa: { $avg: '$cgpa' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return successResponse({
      userStats: userStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = {
          total: stat.count,
          active: stat.active,
          blacklisted: stat.blacklisted,
        };
        return acc;
      }, {}),
      driveStats: driveStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      applicationStats: applicationStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      placementStats: placementStats[0] || {
        total: 0,
        accepted: 0,
        pending: 0,
        rejected: 0,
        avgCtc: 0,
        maxCtc: 0,
      },
      recentActivity,
      departmentStats,
    });
  } catch (error: any) {
    console.error('Get super admin stats error:', error);
    return errorResponse(error.message || 'Failed to fetch statistics', 500);
  }
}