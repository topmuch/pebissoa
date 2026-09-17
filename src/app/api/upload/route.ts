import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getUploadsDir } from '@/lib/uploads';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp', '.avif', '.pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/upload - Upload one or more files (multipart/form-data, field name: "files")
// Returns { urls: string[], url: string, files: [{ url, filename, originalName, size }] }
// — urls[0] / files[i].url served via /api/uploads/<filename>
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const submitted = formData.getAll('files').filter((f): f is File => f instanceof File);

    if (submitted.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier reçu (champ attendu : "files")' },
        { status: 400 }
      );
    }

    const uploadsDir = getUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    const urls: string[] = [];
    const files: { url: string; filename: string; originalName: string; size: number }[] = [];

    for (const file of submitted) {
      const ext = extname(file.name || '').toLowerCase() || '.jpg';
      if (ext === '.heic' || ext === '.heif') {
        return NextResponse.json(
          { error: `${file.name} : les photos iPhone (HEIC) ne sont pas supportées. Convertissez-les en JPG.` },
          { status: 400 }
        );
      }
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Format non supporté (${ext}) : ${file.name}. Utilisez JPG, PNG, GIF, WebP ou AVIF.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Fichier trop volumineux (max 10 Mo) : ${file.name}` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${randomUUID()}${ext}`;
      await writeFile(join(uploadsDir, filename), buffer);
      urls.push(`/api/uploads/${filename}`);
      files.push({
        url: `/api/uploads/${filename}`,
        filename,
        originalName: file.name,
        size: file.size,
      });
    }

    // "files" est attendu par certains consommateurs (dialog d'édition admin,
    // upload multi-photos du dashboard) — ne pas retirer.
    return NextResponse.json({ url: urls[0], urls, files });
  } catch (error) {
    console.error('Error uploading files:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Erreur lors du téléchargement du fichier (${detail})` },
      { status: 500 }
    );
  }
}
