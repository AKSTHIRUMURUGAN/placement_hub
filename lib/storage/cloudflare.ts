import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME!;

export async function uploadFile(
  file: File,
  folder: string = 'files'
): Promise<{ url: string; key: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  // Generate signed URL (valid for 7 days)
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });

  return { url, key: fileName };
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export async function getSignedFileUrl(key: string, expiresIn: number = 604800): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}
