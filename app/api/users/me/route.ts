import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { requireAuth } from '@/lib/utils/auth';
import { auth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

// PATCH /api/users/me - Update current user profile (name, phone)
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { name, phone } = body as { name?: string; phone?: string };

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return errorResponse('Name must be at least 2 characters', 400);
    }

    if (phone !== undefined && typeof phone !== 'string') {
      return errorResponse('Phone must be a string', 400);
    }

    const user = await Student.findById(currentUser._id);
    if (!user) return errorResponse('User not found', 404);

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    // Best-effort: keep Firebase displayName in sync
    if (auth && name !== undefined) {
      try {
        await auth.updateUser(user.firebaseUid, { displayName: user.name });
      } catch (e) {
        // ignore Firebase update errors (DB already updated)
      }
    }

    return successResponse(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          firebaseUid: user.firebaseUid,
          phone: user.phone,
        },
      },
      'Profile updated successfully'
    );
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

