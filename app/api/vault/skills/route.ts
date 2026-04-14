import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';

// PUT /api/vault/skills - Update skills
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { skills } = body;

    if (!Array.isArray(skills)) {
      return errorResponse('Skills must be an array', 400);
    }

    let vault = await Vault.findOne({ studentId: currentUser._id });

    if (!vault) {
      vault = await Vault.create({
        studentId: currentUser._id,
        resumes: [],
        certificates: [],
        internships: [],
        projects: [],
        skills: [],
        extraFields: {},
        completenessScore: 0,
      });
    }

    vault.skills = skills;
    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Skills updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
