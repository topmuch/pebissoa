import { NextResponse } from 'next/server';
import { getUploadsDir, getBundledUploadsDir } from '@/lib/uploads';
import { readdirSync, writeFileSync, unlinkSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

// GET /api/health - Diagnostic endpoint (public, no sensitive data)
// Verify a production deployment (Docker/Coolify):
//   { ok, db, uploads: { dir, writable, files, recent: [{name, url}] }, bundled, nextauthUrl }
export async function GET() {
  const report: Record<string, unknown> = {
    ok: true,
    time: new Date().toISOString(),
  };

  // 1. Database
  try {
    await db.$queryRaw`SELECT 1`;
    report.db = 'ok';
  } catch {
    report.db = 'error';
    report.ok = false;
  }

  // 2. Uploads directory (exists? writable? how many files? latest ones)
  try {
    const dir = getUploadsDir();
    const uploads: Record<string, unknown> = { dir };

    let names: string[] = [];
    if (existsSync(dir)) {
      names = readdirSync(dir).filter((f) => !f.startsWith('.'));
    }
    uploads.files = names.length;

    // Write test — proves the volume/directory is writable by the server process
    const probe = join(dir, `.health-${Date.now()}`);
    try {
      writeFileSync(probe, 'ok');
      unlinkSync(probe);
      uploads.writable = true;
    } catch (e) {
      uploads.writable = false;
      uploads.writeError = e instanceof Error ? e.message : String(e);
      report.ok = false;
    }

    // 5 most recent files with a directly testable URL
    uploads.recent = names
      .map((name) => {
        try {
          return { name, mtime: statSync(join(dir, name)).mtimeMs };
        } catch {
          return null;
        }
      })
      .filter((v): v is { name: string; mtime: number } => !!v)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5)
      .map((f) => ({ name: f.name, url: `/api/uploads/${f.name}` }));

    report.uploads = uploads;
  } catch (e) {
    report.uploads = { error: e instanceof Error ? e.message : String(e) };
    report.ok = false;
  }

  // 3. Bundled copy (baked into the Docker image) — fallback source
  const bundled = getBundledUploadsDir();
  report.bundled = bundled
    ? { dir: bundled, files: existsSync(bundled) ? readdirSync(bundled).filter((f) => !f.startsWith('.')).length : 0 }
    : null;

  // 4. NextAuth URL (helps diagnose session/login issues in production)
  report.nextauthUrl = process.env.NEXTAUTH_URL || null;

  return NextResponse.json(report, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
