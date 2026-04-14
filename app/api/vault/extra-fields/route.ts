import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';

// PUT /api/vault/extra-fields - Update extra fields
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { extraFields } = body;

    if (!extraFields || typeof extraFields !== 'object') {
      return errorResponse('Extra fields must be an object', 400);
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

    // Merge with existing extra fields
    vault.extraFields = {
      ...vault.extraFields,
      ...extraFields,
    };

    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Extra fields updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
