import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

/**
 * Extensions servables publiquement par les routes d'images.
 * TOUT autre extension est refusée (404) AVANT toute résolution de fichier :
 * indispensable quand un volume legacy mal ciblé expose des fichiers
 * sensibles (ex : pebiss.db, pebiss.db-wal — base de données téléchargeable).
 */
export const SERVABLE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp', '.avif', '.svg', '.pdf',
]);

export function isServableFilename(filename: string): boolean {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0) return false; // pas d'extension ou nom vide avant le point
  const ext = filename.slice(dot).toLowerCase();
  return SERVABLE_EXTENSIONS.has(ext);
}

/**
 * Resolve the uploads directory.
 *
 * Priority:
 *   1. UPLOADS_DIR env var (explicit, recommended for production)
 *   2. Fallback: <cwd>/uploads
 *
 * In production (Docker/Coolify): UPLOADS_DIR=/app/uploads
 * In development: uses <project>/uploads
 */
function resolveUploadsDir(): string {
  // 1. Explicit env var (production)
  if (process.env.UPLOADS_DIR) {
    return process.env.UPLOADS_DIR;
  }

  // 2. Fallback: <cwd>/uploads
  return join(process.cwd(), 'uploads');
}

let _uploadsDir: string | null = null;

export function getUploadsDir(): string {
  if (!_uploadsDir) {
    _uploadsDir = resolveUploadsDir();
    // Ensure directory exists
    if (!existsSync(_uploadsDir)) {
      mkdirSync(_uploadsDir, { recursive: true });
      console.log(`[uploads] Created directory: ${_uploadsDir}`);
    }
  }
  return _uploadsDir;
}

/**
 * Pristine copy of the production images baked into the Docker image
 * (/app/.bundled-uploads, created by the Dockerfile). Used as a FALLBACK
 * by the image-serving routes when a file is missing from the persistent
 * volume — so seeded images always display even if the volume fill failed.
 * Returns null when no bundled copy exists (local dev without it).
 */
export function getBundledUploadsDir(): string | null {
  const candidates = [
    process.env.BUNDLED_UPLOADS_DIR,
    '/app/.bundled-uploads',
    join(process.cwd(), '.bundled-uploads'),
  ].filter((v): v is string => !!v);
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return null;
}

/**
 * LEGACY upload directories — sources de récupération pour les images
 * créées AVANT le changement de volume Coolify (l'ancien volume était
 * monté sur /app/public/uploads). Si ce volume est encore monté dans le
 * conteneur, les images manquantes du nouveau volume y sont cherchées
 * automatiquement par les routes de service d'images ET recopiées au
 * démarrage par scripts/copy-bundled-uploads.cjs.
 */
export function getLegacyUploadsDirs(): string[] {
  const candidates = [
    process.env.LEGACY_UPLOADS_DIR,
    '/app/public/uploads',
    join(process.cwd(), 'public', 'uploads'),
  ].filter((v): v is string => !!v);
  return candidates.filter((dir) => existsSync(dir));
}

import { stat } from 'fs/promises';

/**
 * Résout un nom de fichier uploadé dans TOUTES les sources connues,
 * dans l'ordre :
 *   1. volume persistant (UPLOADS_DIR — source de vérité, où l'on écrit)
 *   2. copie embarquée dans l'image Docker (/app/.bundled-uploads)
 *   3. anciens volumes legacy (/app/public/uploads — volume Coolify historique)
 * Retourne le chemin du premier fichier régulier trouvé, sinon null.
 */
export async function resolveUploadFilePath(filename: string): Promise<string | null> {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return null;
  }

  const candidates = [getUploadsDir()];
  const bundled = getBundledUploadsDir();
  if (bundled) candidates.push(bundled);
  candidates.push(...getLegacyUploadsDirs());

  for (const dir of candidates) {
    const filePath = join(dir, filename);
    try {
      const s = await stat(filePath);
      if (s.isFile()) return filePath;
    } catch {
      // absent de cette source — essayer la suivante
    }
  }
  return null;
}

/**
 * Placeholder SVG affiché à la place d'une image introuvable (HTTP 200
 * avec Cache-Control: no-store) — évite les icônes « image cassée » sur
 * tout le site pendant qu'une image manque, tout en laissant le fichier
 * se révéler automatiquement s'il est restauré plus tard (reload).
 */
export function imagePlaceholderSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320" role="img" aria-label="Image indisponible">
  <rect width="480" height="320" fill="#f5f5f4"/>
  <rect x="10" y="10" width="460" height="300" fill="none" stroke="#e7e5e4" stroke-width="2" rx="14"/>
  <g transform="translate(240 148)">
    <rect x="-34" y="-26" width="68" height="52" rx="8" fill="#e7e5e4"/>
    <rect x="-26" y="-18" width="52" height="36" rx="5" fill="#f5f5f4"/>
    <circle cx="8" cy="0" r="9" fill="#d6d3d1"/>
    <path d="M-26 12 L-10 -4 L2 8 L12 -2 L26 12 Z" fill="#d6d3d1"/>
  </g>
  <circle cx="240" cy="148" r="52" fill="none" stroke="#d6d3d1" stroke-width="2"/>
</svg>`;
}
