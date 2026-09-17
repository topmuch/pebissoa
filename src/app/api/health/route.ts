import { NextResponse } from 'next/server';
import { getUploadsDir, getBundledUploadsDir, getLegacyUploadsDirs } from '@/lib/uploads';
import { readdirSync, writeFileSync, unlinkSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

// Extrait les noms de fichiers d'une valeur image DB (URL /uploads/x ou /api/uploads/x)
function extractFilename(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const m = value.match(/\/uploads\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Scanne toutes les références d'images de la base et vérifie leur présence
// sur disque (volume, copie embarquée, volumes legacy). Permet de savoir
// PRÉCISÉMENT combien d'images manquent et combien sont récupérables.
async function imageIntegrityReport(volumeFiles: Set<string>) {
  const refs = new Set<string>();
  try {
    const businesses = await db.business.findMany({ select: { logo: true, coverImage: true } });
    for (const b of businesses) {
      const l = extractFilename(b.logo); if (l) refs.add(l);
      const c = extractFilename(b.coverImage); if (c) refs.add(c);
    }
    const photos = await db.businessPhoto.findMany({ select: { url: true } });
    for (const p of photos) { const f = extractFilename(p.url); if (f) refs.add(f); }
    const products = await db.product.findMany({ select: { imageUrl: true } });
    for (const p of products) { const f = extractFilename(p.imageUrl); if (f) refs.add(f); }
    const ads = await db.ad.findMany({ select: { image: true } });
    for (const a of ads) { const f = extractFilename(a.image); if (f) refs.add(f); }
    const configs = await db.siteConfig.findMany({ select: { logo: true } });
    for (const c of configs) { const f = extractFilename(c.logo); if (f) refs.add(f); }
  } catch {
    return null; // DB indisponible — le rapport global dira déjà db:error
  }

  const bundled = getBundledUploadsDir();
  const bundledFiles = new Set<string>(
    bundled && existsSync(bundled) ? readdirSync(bundled).filter((f) => !f.startsWith('.')) : []
  );
  const legacyFiles = new Set<string>();
  for (const dir of getLegacyUploadsDirs()) {
    for (const f of readdirSync(dir).filter((f) => !f.startsWith('.'))) legacyFiles.add(f);
  }

  let present = 0, recoverable = 0, missing = 0;
  const missingSample: string[] = [];
  for (const name of refs) {
    if (volumeFiles.has(name)) { present++; continue; }
    if (bundledFiles.has(name) || legacyFiles.has(name)) recoverable++;
    else {
      missing++;
      if (missingSample.length < 10) missingSample.push(name);
    }
  }

  return {
    referenced: refs.size,
    presentInVolume: present,
    recoverableFromBundledOrLegacy: recoverable,
    missingNowhere: missing,
    missingSample,
  };
}

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

    // 2bis. Intégrité des images référencées par la base
    // → dit EXACTEMENT combien d'images manquent et où les trouver
    try {
      const integrity = await imageIntegrityReport(new Set(names));
      if (integrity) report.imageIntegrity = integrity;
    } catch {
      // jamais bloquant
    }
  } catch (e) {
    report.uploads = { error: e instanceof Error ? e.message : String(e) };
    report.ok = false;
  }

  // 3. Bundled copy (baked into the Docker image) — fallback source
  const bundled = getBundledUploadsDir();
  report.bundled = bundled
    ? { dir: bundled, files: existsSync(bundled) ? readdirSync(bundled).filter((f) => !f.startsWith('.')).length : 0 }
    : null;

  // 3bis. Legacy volumes détectés (ancien volume Coolify /app/public/uploads…)
  const legacyDirs = getLegacyUploadsDirs();
  report.legacy = legacyDirs.length
    ? legacyDirs.map((d) => ({ dir: d, files: readdirSync(d).filter((f) => !f.startsWith('.')).length }))
    : [];

  // 4. NextAuth URL (helps diagnose session/login issues in production)
  report.nextauthUrl = process.env.NEXTAUTH_URL || null;

  return NextResponse.json(report, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
