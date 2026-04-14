import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { uploadFile } from '@/lib/storage/cloudflare';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';

// POST /api/vault/resume - Upload resume
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'General';

    if (!file) {
      return errorResponse('File is required', 400);
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return errorResponse('Only PDF files are allowed', 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File size must be less than 5MB', 400);
    }

    // Upload to Cloudflare R2
    const { url, key } = await uploadFile(file, 'resumes');

    // Update vault
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

    vault.resumes.push({
      url,
      fileName: file.name,
      type,
      uploadedAt: new Date(),
    } as any);

    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Resume uploaded successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/vault/resume - Delete resume
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return errorResponse('Resume ID is required', 400);
    }

    const vault = await Vault.findOne({ studentId: currentUser._id });

    if (!vault) {
      return errorResponse('Vault not found', 404);
    }

    vault.resumes = vault.resumes.filter((r: any) => r._id.toString() !== resumeId);
    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Resume deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
