import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// GET /api/super-admin/users - Get all users (super admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Unauthorized - Super admin access required', 401);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      Student.find(query)
        .select('name email regNo department role isActive isBlacklisted createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return errorResponse(error.message || 'Failed to fetch users', 500);
  }
}

// POST /api/super-admin/users - Create admin user (super admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Unauthorized - Super admin access required', 401);
    }

    await connectDB();

    const body = await req.json();
    const { email, name, role } = body;

    if (!email || !name || !role) {
      return errorResponse('Missing required fields', 400);
    }

    if (!['admin', 'placement-officer', 'company'].includes(role)) {
      return errorResponse('Invalid role', 400);
    }

    // Check if user already exists
    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Create user without Firebase (they'll need to sign up separately)
    const newUser = await Student.create({
      firebaseUid: `temp_${Date.now()}`, // Temporary, will be updated when they sign up
      email,
      name,
      role,
      regNo: role === 'student' ? `TEMP_${Date.now()}` : `${role.toUpperCase()}_${Date.now()}`,
      department: role === 'student' ? 'Not Set' : 'Administration',
      cgpa: role === 'student' ? 0 : 10,
      graduationYear: new Date().getFullYear(),
      degree: 'N/A',
      isActive: true,
    });

    return successResponse(
      { user: newUser },
      'User created successfully. They need to sign up with this email.',
      201
    );
  } catch (error: any) {
    console.error('Create user error:', error);
    return errorResponse(error.message || 'Failed to create user', 500);
  }
}