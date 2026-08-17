import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { image, filename: originalName } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'No image data provided.' },
      });
    }

    let buffer: Buffer;
    let extension = 'png';

    // Handle Data URL format (data:image/jpeg;base64,...)
    if (typeof image === 'string' && image.startsWith('data:')) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_FORMAT', message: 'Invalid data URL image format.' },
        });
      }
      let mimeExt = matches[1].toLowerCase();
      if (mimeExt === 'jpeg') mimeExt = 'jpg';
      extension = mimeExt;
      buffer = Buffer.from(matches[2], 'base64');
    } else if (typeof image === 'string') {
      // Raw base64 string
      buffer = Buffer.from(image, 'base64');
      if (originalName) {
        const ext = path.extname(originalName).replace('.', '').toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
          extension = ext === 'jpeg' ? 'jpg' : ext;
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Image must be a base64 string or data URL.' },
      });
    }

    // Enforce 10MB limit
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Image size exceeds 10MB limit.' },
      });
    }

    const uniqueName = `product-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const imageUrl = `/api/v1/uploads/${uniqueName}`;

    res.status(201).json({
      success: true,
      data: {
        imageUrl,
        filename: uniqueName,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
