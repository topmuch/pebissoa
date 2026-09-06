import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

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