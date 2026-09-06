import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { getUploadsDir } from '@/lib/uploads';
import { join } from 'path';

// Content type mapping
const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

// GET /api/uploads/[...path] - Serve uploaded files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filename = path.join('/');

    // Prevent path traversal attacks
    if (filename.includes('..') || filename.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Persistent uploads directory (same volume as database)
    const uploadsDir = getUploadsDir();
    const filePath = join(uploadsDir, filename);

    // Check file exists and get its stats
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Read and serve file
    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(filename);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        // Allow browser revalidation — don't use 'immutable'
        // so images refresh correctly after redeployment
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    // File not found or other error
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
