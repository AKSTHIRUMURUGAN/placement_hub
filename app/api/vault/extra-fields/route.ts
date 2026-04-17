import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vault from '@/lib/db/models/Vault';
import { requireAuth } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { calculateVaultCompleteness } from '@/lib/eligibility/engine';
import { uploadToCloudinary, transformations } from '@/lib/cloudinary/upload';
import { uploadFile } from '@/lib/storage/cloudflare';

// POST /api/vault/extra-fields - Upload files for extra fields
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    if (!type || !['avatar', 'aadhaar', 'pan'].includes(type)) {
      return errorResponse('Invalid file type. Must be avatar, aadhaar, or pan', 400);
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File size must be less than 5MB', 400);
    }

    // Validate file type
    const allowedTypes = {
      avatar: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      aadhaar: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      pan: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    };

    if (!allowedTypes[type as keyof typeof allowedTypes].includes(file.type)) {
      return errorResponse(`Invalid file type for ${type}`, 400);
    }

    let uploadResult: { url: string; publicId?: string };

    // Use Cloudinary for avatars (better image processing) and Cloudflare R2 for documents
    if (type === 'avatar') {
      try {
        const folder = `placementhub/avatars`;
        const cloudinaryResult = await uploadToCloudinary(file, folder, {
          transformation: transformations.avatar,
          resource_type: 'image'
        });
        
        uploadResult = {
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id
        };
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return errorResponse('Failed to upload avatar', 500);
      }
    } else {
      // Use Cloudflare R2 for documents (consistency with other uploads)
      try {
        const folder = `documents/${type}s`;
        const r2Result = await uploadFile(file, folder);
        
        uploadResult = {
          url: r2Result.url,
          publicId: r2Result.key
        };
      } catch (uploadError) {
        console.error('R2 upload error:', uploadError);
        return errorResponse(`Failed to upload ${type} document`, 500);
      }
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

    // Update the appropriate field
    const fieldName = `${type}Url`;
    const publicIdField = `${type}PublicId`;
    
    vault.extraFields = {
      ...vault.extraFields,
      [fieldName]: uploadResult.url,
      [publicIdField]: uploadResult.publicId, // Store for future deletion
    };

    vault.completenessScore = calculateVaultCompleteness(vault);
    await vault.save();

    return successResponse({ 
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      type: type,
      storage: type === 'avatar' ? 'cloudinary' : 'cloudflare'
    }, `${type} uploaded successfully`);
  } catch (error: any) {
    console.error('API error:', error);
    return errorResponse(error.message, 500);
  }
}

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
