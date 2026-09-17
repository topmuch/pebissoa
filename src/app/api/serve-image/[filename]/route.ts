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

// GET /api/serve-image/[filename] - Reliable image serving (single segment, no catch-all)
// This route works reliably in Next.js standalone mode (Docker/Coolify)
//
// Ordre de recherche du fichier :
//   1. volume persistant UPLOADS_DIR (/app/uploads)
//   2. copie embarquée dans l'image Docker (/app/.bundled-uploads)
//   3. anciens volumes legacy (/app/public/uploads — volume Coolify historique)
//
// Si le fichier est introuvable PARTOUT : placeholder SVG (HTTP 200,
// no-store) au lieu d'un 404 — le site ne montre plus d'« image cassée »
// et l'image réapparaît automatiquement dès qu'elle est restaurée.
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
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
