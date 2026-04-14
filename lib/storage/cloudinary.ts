import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: File,
  folder: string = 'placementhub'
): Promise<{ url: string; publicId: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: 'auto',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        quality: options.quality || 'auto',
        fetch_format: options.format || 'auto',
        crop: 'fill',
      },
    ],
  });
}

export default cloudinary;
