import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { resolveUploadFilePath, imagePlaceholderSvg } from '@/lib/uploads';

// Content type mapping
const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function isImage(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ext !== 'pdf';
}

// GET /api/uploads/[...path] - Serve uploaded files (fallback route, rewritten
// par le middleware vers /api/serve-image ; sert aussi les URL historiques).
//
// Ordre de recherche du fichier :
//   1. volume persistant UPLOADS_DIR (/app/uploads)
//   2. copie embarquée dans l'image Docker (/app/.bundled-uploads)
//   3. anciens volumes legacy (/app/public/uploads — volume Coolify historique)
//
// Image introuvable partout → placeholder SVG (200, no-store) au lieu d'un 404.
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

    const filePath = await resolveUploadFilePath(filename);
    if (!filePath) {
      if (isImage(filename)) {
        return new NextResponse(imagePlaceholderSvg(), {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'no-store, must-revalidate',
            'X-Image-Missing': '1',
          },
        });
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const fileStat = await stat(filePath);

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
