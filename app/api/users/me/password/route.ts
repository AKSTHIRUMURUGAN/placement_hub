import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { auth } from '@/lib/firebase/admin';
import { successResponse, errorResponse } from '@/lib/utils/response';

// PUT /api/users/me/password - Change current user's password (Firebase)
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);

    if (!auth) {
      return errorResponse('Authentication service unavailable', 503);
    }

    const body = await request.json();
    const { newPassword } = body as { newPassword?: string };

    if (!newPassword || typeof newPassword !== 'string') {
      return errorResponse('New password is required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    await auth.updateUser(currentUser.firebaseUid, { password: newPassword });

    return successResponse(null, 'Password updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, error.message === 'Unauthorized' ? 401 : 500);
  }
}

