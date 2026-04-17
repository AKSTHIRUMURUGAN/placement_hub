import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import connectDB from '../db/mongodb';
import Student from '../db/models/Student';

export async function verifyAuthToken(request: NextRequest) {
  try {
    // First try Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else {
      // Fallback to cookie
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        token = cookies.authToken;
      }
    }
    
    if (!token) {
      return null;
    }

    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getCurrentUser(request: NextRequest) {
  const decodedToken = await verifyAuthToken(request);
  if (!decodedToken) return null;

  await connectDB();
  const student = await Student.findOne({ firebaseUid: decodedToken.uid });
  return student;
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role !== 'admin' && user.role !== 'placement-officer') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

export async function requireCompany(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role !== 'company') {
    throw new Error('Forbidden: Company access required');
  }

  return user;
}

export function getUserRole(user: any): string {
  return user?.role || 'student';
}

// Alias for verifyAuth (used in API routes)
export async function verifyAuth(request: NextRequest) {
  return await getCurrentUser(request);
}
