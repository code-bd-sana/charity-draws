import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

/**
 * Saves a base64 Data URI image to the specified local directory and returns its public URL.
 * If the input is already a normal URL or relative path, it returns it unchanged.
 */
export async function processAndSaveImage(
  imageInput?: string | null,
  subfolder: string = 'avatars',
): Promise<string | null> {
  if (!imageInput || typeof imageInput !== 'string') {
    return null;
  }

  const trimmed = imageInput.trim();
  if (!trimmed) {
    return null;
  }

  // If already a hosted URL or existing uploads path, return it directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('uploads/')
  ) {
    return trimmed;
  }

  // Check if it is a base64 Data URI: data:image/<type>;base64,<data>
  const match = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (match) {
    const rawExt = match[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt.replace(/[^a-z0-9]/g, '');
    const base64Data = match[2];

    const buffer = Buffer.from(base64Data, 'base64');
    const uploadDir = path.join(process.cwd(), 'uploads', subfolder);

    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    const randomName = randomBytes(16).toString('hex');
    const fileName = `${randomName}.${ext || 'png'}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, buffer);

    const baseUrl = process.env.APP_URL || 'http://127.0.0.1:5000';
    return `${baseUrl}/uploads/${subfolder}/${fileName}`;
  }

  return trimmed;
}
