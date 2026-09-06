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

// GET /api/serve-image/[filename] - Reliable image serving (single segment, no catch-all)
// This route works reliably in Next.js standalone mode (Docker/Coolify)
// Falls back from /api/uploads/[...path] which can be unreliable in standalone builds
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Prevent path traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
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
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
