// scripts/copy-bundled-uploads.cjs
// Copie les images de PRODUCTION embarquées dans l'image Docker
// (/app/.bundled-uploads) vers le volume persistant UPLOADS_DIR.
// - Ne copie que les fichiers absents (ne jamais écraser les uploads users)
// - Idempotent : peut tourner à chaque démarrage sans risque

const fs = require('fs');
const path = require('path');

const BUNDLED = process.env.BUNDLED_UPLOADS_DIR || '/app/.bundled-uploads';
const DEST = process.env.UPLOADS_DIR || '/app/uploads';

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
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
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
  if (!fs.existsSync(BUNDLED)) {
    console.log(`ℹ️  Pas d'images embarquées (${BUNDLED} absent) — étape ignorée.`);
    process.exit(0);
  }
  const copied = copyMissing(BUNDLED, DEST);
  const total = fs.readdirSync(DEST).length;
  console.log(`📸 Images embarquées copiées : ${copied} nouvelles, total dans ${DEST} : ${total} fichiers`);
} catch (err) {
  console.error('⚠️  copy-bundled-uploads:', err.message);
  // Non bloquant : le site doit démarrer même si la copie échoue
}
