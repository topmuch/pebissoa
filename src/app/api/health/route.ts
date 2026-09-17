import { NextResponse } from 'next/server';
import { getUploadsDir } from '@/lib/uploads';
import { readdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

// GET /api/health - Diagnostic endpoint (public, no sensitive data)
// Useful to verify a production deployment (Docker/Coolify):
//   { ok, db, uploads: { dir, writable, files } }
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

  // 2. Uploads directory (exists? writable? how many files?)
  try {
    const dir = getUploadsDir();
    const uploads: Record<string, unknown> = { dir };

    uploads.files = existsSync(dir) ? readdirSync(dir).filter((f) => !f.startsWith('.')).length : 0;

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

    report.uploads = uploads;
  } catch (e) {
    report.uploads = { error: e instanceof Error ? e.message : String(e) };
    report.ok = false;
  }

  return NextResponse.json(report, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
