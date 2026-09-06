import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { getUploadsDir } from '@/lib/uploads';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

// Allowed file types
const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf',
]);

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

// Content type mapping for security
const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    // Check file extension
    const ext = extname(file.name).toLowerCase().replace('.', '');
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}` },
        { status: 400 }
      );
    }

    // Validate content type matches extension
    const expectedType = CONTENT_TYPES[ext];
    if (expectedType && file.type && !file.type.startsWith(expectedType.split('/')[0])) {
      return NextResponse.json(
        { error: 'File content type does not match extension' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueName = `${randomUUID()}.${ext}`;
    const uploadsDir = getUploadsDir();
    const filePath = join(uploadsDir, uniqueName);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return the URL path (not the filesystem path)
    return NextResponse.json({
      url: `/api/serve-image/${uniqueName}`,
      filename: uniqueName,
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('[upload] Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}