import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';

// POST /api/vault/project - Add project
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { title, description, techStack, githubUrl, demoUrl, imageUrl, startDate, endDate } = body;

    if (!title || !description) {
      return errorResponse('Title and description are required', 400);
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

    vault.projects.push({
      title,
      description,
      techStack: techStack || [],
      githubUrl,
      demoUrl,
      imageUrl,
      startDate,
      endDate,
    } as any);

    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Project added successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/vault/project - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    const vault = await Vault.findOne({ studentId: currentUser._id });

    if (!vault) {
      return errorResponse('Vault not found', 404);
    }

    vault.projects = vault.projects.filter((p: any) => p._id.toString() !== projectId);
    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Project deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
