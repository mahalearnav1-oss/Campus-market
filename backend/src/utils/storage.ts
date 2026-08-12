import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
const DOCS_DIR = path.join(UPLOAD_DIR, 'documents');

// Ensure upload directories exist
[UPLOAD_DIR, AVATAR_DIR, DOCS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit

export function validateImageFile(file: { mimeType: string; size: number }) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimeType.toLowerCase())) {
    const error: any = new Error('Invalid image file type. Allowed formats: JPEG, PNG, WEBP.');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }
  if (file.size > MAX_FILE_SIZE) {
    const error: any = new Error('Image file size exceeds maximum limit of 5 MB.');
    error.statusCode = 400;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }
}

export function validateDocFile(file: { mimeType: string; size: number }) {
  if (!ALLOWED_DOC_TYPES.includes(file.mimeType.toLowerCase())) {
    const error: any = new Error('Invalid verification document file type. Allowed formats: JPEG, PNG, WEBP, PDF.');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    throw error;
  }
  if (file.size > MAX_FILE_SIZE) {
    const error: any = new Error('Document file size exceeds maximum limit of 5 MB.');
    error.statusCode = 400;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }
}

export async function saveAvatarImage(file: UploadedFile): Promise<string> {
  validateImageFile(file);
  const ext = path.extname(file.originalName) || '.png';
  const filename = `avatar_${crypto.randomBytes(12).toString('hex')}${ext}`;
  const filepath = path.join(AVATAR_DIR, filename);
  await fs.promises.writeFile(filepath, file.buffer);
  return `/uploads/avatars/${filename}`;
}

export async function saveVerificationDocument(file: UploadedFile): Promise<string> {
  validateDocFile(file);
  const ext = path.extname(file.originalName) || '.pdf';
  const filename = `doc_${crypto.randomBytes(16).toString('hex')}${ext}`;
  const filepath = path.join(DOCS_DIR, filename);
  await fs.promises.writeFile(filepath, file.buffer);
  return `/uploads/documents/${filename}`;
}
