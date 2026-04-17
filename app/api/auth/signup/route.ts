import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { auth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

// POST /api/auth/signup - Register new user
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate role
    const validRoles = ['student', 'placement-officer', 'company'];
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role', 400);
    }

    // Check if user already exists
    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Create Firebase user
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (firebaseError: any) {
      console.error('Firebase user creation error:', firebaseError);
      return errorResponse(
        firebaseError.message || 'Failed to create user account',
        400
      );
    }

    // For students, require additional information (will be completed in profile setup)
    // For now, create a basic record
    const userData: any = {
      firebaseUid: firebaseUser.uid,
      email,
      name,
      role,
      isActive: true,
    };

    // If student role, set default values (to be updated later)
    if (role === 'student') {
      userData.regNo = `TEMP_${Date.now()}`; // Temporary, to be updated
      userData.department = 'Not Set';
      userData.cgpa = 0;
      userData.graduationYear = new Date().getFullYear() + 1;
      userData.degree = 'B.Tech';
      userData.activeBacklogs = 0;
    }

    // Create user in database
    const user = await Student.create(userData);

    return successResponse(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          firebaseUid: user.firebaseUid,
        },
      },
      'Account created successfully. Please sign in to continue.',
      201
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(error.message || 'Failed to create account', 500);
  }
}
