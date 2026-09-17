#!/usr/bin/env node
/**
 * Sauvetage des images de production pebiss.com avant Redeploy.
 * Les fichiers actuels de /app/uploads vivent dans la couche ÉPHÉMÈRE du
 * conteneur (aucun volume Coolify monté sur /app/uploads) : ils seraient
 * DÉTRUITS au prochain Redeploy. On les télécharge et on les embarque dans
 * git (uploads/) → le Dockerfile les copie dans /app/.bundled-uploads et
 * copy-bundled-uploads.cjs les restaure dans le volume au boot.
 *
 * Sources balayées : /api/businesses (liste), /api/businesses/<slug> (fiche :
 * photos, produits, services), /api/banners?position=all.
 * On collecte toute chaîne /^\/(api\/)?uploads\/<nom>$/ dans les JSON.
 * Fichier absent en prod = réponse placeholder SVG → listé « perdu ».
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = 'https://pebiss.com';
const OUT_DIR = '/home/z/my-project/uploads';
const TMP_DIR = '/home/z/my-project/.harvest-tmp';

function fetchJson(urlPath) {
  const out = execFileSync('curl', ['-s', '--max-time', '30', `${BASE}${urlPath}`], {
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out.toString('utf8'));
}

function collectUploadRefs(node, set) {
  if (typeof node === 'string') {
    const m = node.match(/^\/(api\/)?uploads\/([A-Za-z0-9][A-Za-z0-9._-]*)$/);
    if (m) set.add(m[2]);
  } else if (Array.isArray(node)) {
    node.forEach((v) => collectUploadRefs(v, set));
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach((v) => collectUploadRefs(v, set));
  }
}

(async () => {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const refs = new Set();

  // 1. Liste des entreprises
  const list = fetchJson('/api/businesses?limit=100&page=1');
  collectUploadRefs(list, refs);
  const slugs = (list.businesses || []).map((b) => b.slug);
  console.log(`Entreprises publiques: ${slugs.length}`);

  // 2. Fiches détaillées (photos, produits, services)
  let done = 0;
  for (const slug of slugs) {
    try {
      const detail = fetchJson(`/api/businesses/${encodeURIComponent(slug)}`);
      collectUploadRefs(detail, refs);
    } catch (e) {
      console.log(`  ⚠ fiche ${slug}: ${e.message.slice(0, 80)}`);
    }
    done++;
    if (done % 20 === 0) console.log(`  fiches scannées: ${done}/${slugs.length}`);
  }

  // 3. Bannières (annonces)
  try {
    collectUploadRefs(fetchJson('/api/banners?position=all'), refs);
  } catch {}
  // 4. Réglages publics (logo/favicon du site)
  try {
    collectUploadRefs(fetchJson('/api/settings'), refs);
  } catch {}

  console.log(`Références d'images uniques trouvées: ${refs.size}`);

  const alreadyLocal = new Set(fs.readdirSync(OUT_DIR).filter((f) => !f.startsWith('.')));
  const toFetch = [...refs].filter((f) => !alreadyLocal.has(f));
  console.log(`Déjà présents localement (seed git): ${refs.size - toFetch.length} — à télécharger: ${toFetch.length}`);

  const saved = [];
  const lost = [];
  for (const name of toFetch) {
    const dest = path.join(TMP_DIR, name);
    try {
      execFileSync('curl', ['-s', '--max-time', '30', '-o', dest, `${BASE}/api/uploads/${name}`], {
        maxBuffer: 64 * 1024 * 1024,
      });
      const size = fs.statSync(dest).size;
      const buf = fs.readFileSync(dest);
      const isSvgPlaceholder = buf.subarray(0, 200).includes('<svg') && buf.includes('Image indisponible');
      if (isSvgPlaceholder || size < 800) {
        lost.push(name);
        fs.unlinkSync(dest);
      } else {
        fs.copyFileSync(dest, path.join(OUT_DIR, name));
        saved.push({ name, size });
      }
    } catch (e) {
      lost.push(name);
    }
  }

  console.log(`\n✅ SAUVETÉS (${saved.length}):`);
  saved.forEach((s) => console.log(`   ${s.name} (${(s.size / 1024).toFixed(0)} Ko)`));
  if (lost.length) {
    console.log(`\n❌ PERDUS — introuvables en prod, à re-uploader (${lost.length}):`);
    lost.forEach((n) => console.log(`   ${n}`));
  }
  fs.writeFileSync('/home/z/my-project/.harvest-report.json', JSON.stringify({ saved, lost, totalRefs: refs.size }, null, 2));
})();
