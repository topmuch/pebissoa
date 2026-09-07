import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getUploadsDir } from '@/lib/uploads';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/upload - Upload one or more files (multipart/form-data, field name: "files")
// Returns { urls: string[], url: string } — urls[0] served via /api/uploads/<filename>
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier reçu (champ attendu : "files")' },
        { status: 400 }
      );
    }

    const uploadsDir = getUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const ext = extname(file.name || '').toLowerCase() || '.jpg';
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Type de fichier non autorisé : ${ext}` },
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
    }

    return NextResponse.json({ url: urls[0], urls });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du fichier' },
      { status: 500 }
    );
  }
}
