// scripts/copy-bundled-uploads.cjs
// Remplit le volume persistant UPLOADS_DIR au démarrage du conteneur.
// Sources (dans l'ordre) :
//   1. /app/.bundled-uploads  — images de production embarquées dans l'image Docker
//   2. anciens volumes legacy (/app/public/uploads, LEGACY_UPLOADS_DIR) — images
//      créées avant le changement de volume Coolify ; si l'ancien volume est
//      encore monté, ses fichiers sont récupérés automatiquement ici.
// - Ne copie que les fichiers absents (ne jamais écraser les uploads users)
// - Idempotent : peut tourner à chaque démarrage sans risque

const fs = require('fs');
const path = require('path');

const BUNDLED = process.env.BUNDLED_UPLOADS_DIR || '/app/.bundled-uploads';
const DEST = process.env.UPLOADS_DIR || '/app/uploads';

// Anciens emplacements possibles des uploads (volume Coolify historique, etc.)
const LEGACY_DIRS = [
  process.env.LEGACY_UPLOADS_DIR,
  '/app/public/uploads',
].filter((d) => d && fs.existsSync(d));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyMissing(srcDir, destDir) {
  ensureDir(destDir);
  let copied = 0, skipped = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copied += copyMissing(src, dest);
    } else {
      // Skip anything that already exists (never overwrite user uploads)
      if (fs.existsSync(dest)) {
        skipped++;
      } else {
        fs.copyFileSync(src, dest);
        copied++;
      }
    }
  }
  return copied;
}

try {
  ensureDir(DEST);

  // 1. Images embarquées dans l'image Docker
  let totalCopied = 0;
  if (fs.existsSync(BUNDLED)) {
    totalCopied += copyMissing(BUNDLED, DEST);
    console.log(`📸 Images embarquées (${BUNDLED}) : ${totalCopied} nouvelles copiées`);
  } else {
    console.log(`ℹ️  Pas d'images embarquées (${BUNDLED} absent) — étape ignorée.`);
  }

  // 2. Anciens volumes legacy (récupération des images d'avant le changement de volume)
  for (const legacyDir of LEGACY_DIRS) {
    const n = copyMissing(legacyDir, DEST);
    totalCopied += n;
    console.log(`♻️  Volume legacy (${legacyDir}) : ${n} images récupérées vers ${DEST}`);
  }

  const total = fs.readdirSync(DEST).length;
  console.log(`✅ Uploads : ${totalCopied} fichiers copiés au total, ${total} fichiers dans ${DEST}`);
} catch (err) {
  console.error('⚠️  copy-bundled-uploads:', err.message);
  // Non bloquant : le site doit démarrer même si la copie échoue
}
