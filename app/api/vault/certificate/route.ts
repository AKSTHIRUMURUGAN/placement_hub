import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { uploadFile } from '@/lib/storage/cloudflare';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';

// POST /api/vault/certificate - Upload certificate
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;

    if (!file || !category || !title) {
      return errorResponse('File, category, and title are required', 400);
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      return errorResponse('Only PDF and image files are allowed', 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File size must be less than 5MB', 400);
    }

    // Upload to Cloudflare R2
    const { url, key } = await uploadFile(file, 'certificates');

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

    vault.certificates.push({
      url,
      fileName: file.name,
      category,
      title,
      uploadedAt: new Date(),
    } as any);

    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Certificate uploaded successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/vault/certificate - Delete certificate
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('id');

    if (!certificateId) {
      return errorResponse('Certificate ID is required', 400);
    }

    const vault = await Vault.findOne({ studentId: currentUser._id });

    if (!vault) {
      return errorResponse('Vault not found', 404);
    }

    vault.certificates = vault.certificates.filter((c: any) => c._id.toString() !== certificateId);
    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse(vault, 'Certificate deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
