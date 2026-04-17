import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { auth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

// POST /api/auth/signin - Sign in user
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return errorResponse('ID token is required', 400);
    }

    // Check if Firebase Admin is available
    if (!auth) {
      return errorResponse('Authentication service unavailable', 503);
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Token verification error:', error);
      return errorResponse('Invalid or expired token', 401);
    }

    // Get user from database
    const user = await Student.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is deactivated', 403);
    }

    // Check if user is blacklisted
    if (user.isBlacklisted) {
      return errorResponse(
        `Account is blacklisted${user.blacklistReason ? `: ${user.blacklistReason}` : ''}`,
        403
      );
    }

    return successResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        firebaseUid: user.firebaseUid,
        regNo: user.regNo,
        department: user.department,
        cgpa: user.cgpa,
        graduationYear: user.graduationYear,
      },
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return errorResponse(error.message || 'Failed to sign in', 500);
  }
}
