import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { getUploadsDir, getBundledUploadsDir } from '@/lib/uploads';
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
    let filePath = join(uploadsDir, filename);

    // Check file exists and get its stats — fall back to the pristine copy
    // baked into the Docker image (/app/.bundled-uploads) when the file is
    // missing from the volume (e.g. volume fill failed at first boot)
    let fileStat = null;
    try {
      const s = await stat(filePath);
      if (s.isFile()) fileStat = s;
    } catch {
      // not in the volume — try the bundled copy below
    }
    if (!fileStat) {
      const bundledDir = getBundledUploadsDir();
      if (bundledDir) {
        const bundledPath = join(bundledDir, filename);
        try {
          const s = await stat(bundledPath);
          if (s.isFile()) {
            filePath = bundledPath;
            fileStat = s;
          }
        } catch {
          // not in the bundled copy either
        }
      }
    }
    if (!fileStat) {
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
