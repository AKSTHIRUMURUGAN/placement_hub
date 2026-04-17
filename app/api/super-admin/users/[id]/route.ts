import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { verifyAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

// PUT /api/super-admin/users/:id - Update user (super admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Unauthorized - Super admin access required', 401);
    }

    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { role, isActive, isBlacklisted, blacklistReason } = body;

    const targetUser = await Student.findById(id);
    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    // Update fields
    if (role && ['student', 'admin', 'placement-officer', 'company'].includes(role)) {
      targetUser.role = role;
    }
    if (typeof isActive === 'boolean') {
      targetUser.isActive = isActive;
    }
    if (typeof isBlacklisted === 'boolean') {
      targetUser.isBlacklisted = isBlacklisted;
      if (isBlacklisted && blacklistReason) {
        targetUser.blacklistReason = blacklistReason;
      } else if (!isBlacklisted) {
        targetUser.blacklistReason = undefined;
      }
    }

    await targetUser.save();

    return successResponse({ user: targetUser }, 'User updated successfully');
  } catch (error: any) {
    console.error('Update user error:', error);
    return errorResponse(error.message || 'Failed to update user', 500);
  }
}

// DELETE /api/super-admin/users/:id - Delete user (super admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Unauthorized - Super admin access required', 401);
    }

    await connectDB();

    const { id } = await params;
    
    // Prevent self-deletion
    if (user._id.toString() === id) {
      return errorResponse('Cannot delete your own account', 400);
    }

    const deletedUser = await Student.findByIdAndDelete(id);
    if (!deletedUser) {
      return errorResponse('User not found', 404);
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error: any) {
    console.error('Delete user error:', error);
    return errorResponse(error.message || 'Failed to delete user', 500);
  }
}