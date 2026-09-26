import { processAndSaveImage } from './image.util';
import * as fs from 'fs';

describe('ImageUtil - processAndSaveImage', () => {
  it('should return null if input is empty or null', async () => {
    expect(await processAndSaveImage(null)).toBeNull();
    expect(await processAndSaveImage('')).toBeNull();
    expect(await processAndSaveImage('   ')).toBeNull();
  });

  it('should return existing URL or uploads path unchanged', async () => {
    expect(await processAndSaveImage('https://example.com/logo.png')).toBe(
      'https://example.com/logo.png',
    );
    expect(await processAndSaveImage('http://localhost:5000/uploads/avatars/test.jpg')).toBe(
      'http://localhost:5000/uploads/avatars/test.jpg',
    );
    expect(await processAndSaveImage('/uploads/avatars/test.jpg')).toBe(
      '/uploads/avatars/test.jpg',
    );
  });

  it('should decode a base64 data URI and save it as a local file', async () => {
    // 1x1 transparent PNG data URI
    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const result = await processAndSaveImage(dataUri, 'avatars');
    expect(result).toBeDefined();
    expect(result).toMatch(/\/uploads\/avatars\/[a-f0-9]+\.png$/);

    // Verify file actually exists on disk and clean it up
    const fileName = result!.split('/uploads/avatars/')[1];
    const filePath = `./uploads/avatars/${fileName}`;
    expect(fs.existsSync(filePath)).toBe(true);

    // Clean up
    fs.unlinkSync(filePath);
  });
});
