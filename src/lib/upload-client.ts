// Client-side helper for uploading files to /api/upload.
//
// Throws an Error whose message is the specific server error
// (ex : « Type de fichier non autorisé : .heic », « Fichier trop volumineux… »)
// so UIs can show WHY an upload failed instead of a generic message.
export interface UploadedFileInfo {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export interface UploadResult {
  url?: string;
  urls?: string[];
  files?: UploadedFileInfo[];
}

const MAX_SIZE_MB = 10;

// Client-side pre-check with a friendly, explicit message.
// Falls back to the file extension when the browser provides no MIME type
// (fréquent sur mobile : .jfif, anciens navigateurs Android, etc.).
const OK_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'application/pdf'];
const OK_EXT = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp', '.avif', '.pdf'];

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Fichier trop volumineux : ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum ${MAX_SIZE_MB} Mo.`;
  }
  const ext = (file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '');
  if (ext === '.heic' || ext === '.heif') {
    return `${file.name} : les photos iPhone (HEIC) ne sont pas supportées. Convertissez-les en JPG (Paramètres → Appareil photo → Format « Compatibilité maximale »).`;
  }
  if (file.type && !OK_MIME.includes(file.type) && !OK_EXT.includes(ext)) {
    return `Format non supporté : ${file.name}. Utilisez JPG, PNG, GIF, WebP ou AVIF.`;
  }
  if (!file.type && !OK_EXT.includes(ext)) {
    return `Format non reconnu : ${file.name}. Utilisez JPG, PNG, GIF, WebP ou AVIF.`;
  }
  return null;
}

export async function uploadFiles(files: File | File[]): Promise<UploadResult> {
  const list = Array.isArray(files) ? files : [files];
  if (list.length === 0) throw new Error('Aucun fichier sélectionné');

  for (const file of list) {
    const problem = validateImageFile(file);
    if (problem) throw new Error(problem);
  }

  const fd = new FormData();
  list.forEach((file) => fd.append('files', file));

  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  let data: { error?: string } & UploadResult | null = null;
  try {
    data = await res.json();
  } catch {
    // réponse non-JSON (ex : page d'erreur proxy)
  }
  if (!res.ok) {
    throw new Error(data?.error || `Erreur lors du téléchargement (code ${res.status})`);
  }
  return data as UploadResult;
}

export function uploadErrorMessage(err: unknown, fallback: string): string {
  const msg = err instanceof Error && err.message ? err.message : '';
  return msg || fallback;
}
