import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';

// POST /api/vault/internship - Add internship
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { company, role, duration, startDate, endDate, stipend, certificateUrl, description } = body;

    if (!company || !role || !duration || !startDate || !endDate || !description) {
      return errorResponse('All required fields must be provided', 400);
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

    vault.internships.push({
      company,
      role,
      duration,
      startDate,
      endDate,
      stipend,
      certificateUrl,
      description,
    } as any);

    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Internship added successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/vault/internship - Delete internship
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get('id');

    if (!internshipId) {
      return errorResponse('Internship ID is required', 400);
    }

    const vault = await Vault.findOne({ studentId: currentUser._id });

    if (!vault) {
      return errorResponse('Vault not found', 404);
    }

    vault.internships = vault.internships.filter((i: any) => i._id.toString() !== internshipId);
    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Internship deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
