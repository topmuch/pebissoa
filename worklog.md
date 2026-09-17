# Worklog — Projet actif : pebissoa (github.com/topmuch/pebissoa)

> Historique des travaux précédents (repo pebiss, remplacé suite à erreur de repo de l'utilisateur) :
> correctifs poussés sur topmuch/pebiss main (a303e71 fix db.ts, 45b2868 fix /api/upload, 83ffcc9 uploads, ed678e2 worklog).

---
Task ID: 1
Agent: Z.ai Code (main)
Task: Cloner https://github.com/topmuch/pebissoa.git, installer les dépendances, lancer le dev, corriger le problème d'image

Work Log:
- Cloné topmuch/pebissoa (144 Mo, HEAD a4a310a — contient déjà un fix du bug Prisma via client paresseux)
- Remplacé le contenu de /home/z/my-project par pebissoa (préservation du mountpoint upload/), bun install OK
- Découverte environnement : le sandbox exporte DATABASE_URL=file:/home/z/my-project/db/custom.db globalement, ce qui écrase le .env → .env aligné sur custom.db
- prisma db push + scripts/init-db.cjs : DB seedée (admin admin@pebiss.gw / Admin@123456, 16 catégories, 10 entreprises, avis, annonces, horaires)
- Serveur dev démarré : /, /annuaire, /annonces, /login → 200
- DIAGNOSTIC problème d'image : /api/upload renvoie { url, urls } mais 2 consommateurs attendent un tableau "files" :
  1. src/components/admin/admin-edit-business-dialog.tsx:171 → uploadData.files?.map(f=>f.url) || [] → urls toujours [] → photos ajoutées via le dialog admin JAMAIS enregistrées
  2. src/app/(dashboard)/dashboard/photos/page.tsx:60 → data.files?.map(...) || (data.url ? [data.url] : []) → upload multi-photos : seule la 1ère photo sauvegardée
- CORRECTIF : src/app/api/upload/route.ts renvoie désormais { url, urls, files: [{url, filename, originalName, size}] } (rétrocompatible, lint OK)
- Vérifié curl : upload simple (3 formes de réponse), multi-upload 2 fichiers → urls[2] + files[2], serving /api/uploads/ 200 image/jpeg, rewrite /uploads/* 200
- Vérifié Agent Browser (0 erreur console/page) :
  - Accueil pebissoa rendu (hero, recherche, catégories, cartes entreprises avec images)
  - Dialog admin « Modifier l'entreprise » → onglet Photos → upload → toast « Photo ajoutée avec succès » → ligne BusinessPhoto en base
  - Dashboard entreprise (saveurs-de-bissau@pebiss.gw / ent123) → Photos → upload de 2 photos d'un coup → « 2 photo(s) ajoutée(s) avec succès » → 2 lignes en base
  - Wizard inscription 4 étapes → photo de couverture uploadée → compte créé → coverImage en base, servie 200, page publique 200
- Nettoyé toutes les données de test (user/business/photos de test supprimés, fichiers uploads de test supprimés) — DB revenue à l'état seed (10 entreprises, 11 users, 0 photos)

Stage Summary:
- Pebissoa 100% fonctionnel en local : site + dashboard entreprise + admin, uploads d'images réparés partout (dialog admin, multi-photos dashboard, inscription)
- Fichier modifié (non commité) : src/app/api/upload/route.ts
- Credentials : admin@pebiss.gw / Admin@123456 ; comptes entreprise de démo : <slug>@pebiss.gw / ent123
- DB : db/custom.db (imposée par l'env sandbox) ; UPLOADS_DIR : /home/z/my-project/uploads

---
Task ID: 2
Agent: Z.ai Code (main)
Task: Pousser le correctif upload sur GitHub (token fourni par l'utilisateur)

Work Log:
- Auto-commit sandbox da6e508 (UUID) détecté en HEAD : mélangeait le fix route.ts, .zscripts/ (scripts sandbox) et 7 fichiers uploads de test (PNG placeholder 70 bytes) → historique reconstruit : git reset --mixed a4a310a
- .env vérifié NON tracké (seul .env.example) ; dev.log ignoré ; credentials admin déjà présents upstream (scripts/init-db.cjs) → aucune fuite
- 2 commits créés : 607d0b8 « Fix upload photos : la réponse inclut désormais files » + 82cce93 « docs : journal des travaux »
- Push fast-forward a4a310a..82cce93 → origin/main (github.com/topmuch/pebissoa), vérifié par fetch : origin/main = 82cce93
- Token utilisé via GIT_ASKPASS one-off, jamais stocké dans la config git ni sur disque (fichier /tmp supprimé), redaction des logs
- .zscripts/ et uploads de test volontairement exclus du push (restés non trackés en local)

Stage Summary:
- github.com/topmuch/pebissoa main à jour avec le fix upload photos (607d0b8) et le worklog (82cce93)
- Rappel sécurité : le token GitHub a été partagé en clair dans le chat → à révoquer sur github.com/settings/tokens

---
Task ID: 3
Agent: Z.ai Code (main)
Task: Corriger « le bouton Créer mon compte affiche erreur lors de l'inscription »

Work Log:
- Reproduit via curl : POST /api/auth/register → 500 « Erreur lors de l'inscription » dès que le businessName génère un slug déjà pris (10 slugs du seed, ex. « Saveurs de Bissau »)
- Cause : Prisma P2002 « Unique constraint failed on the fields: (slug) » — le slug était généré sans vérification d'unicité. Pire : le user était créé AVANT le business → user orphelin en base → toute nouvelle tentative avec le même email renvoyait 409 « Un compte avec cet email existe déjà »
- FIX 1 (src/app/api/auth/register/route.ts) : slug garanti unique (suffixe -2, -3…, fallback timestamp au-delà de 100) + user et business créés dans db.$transaction (aucun user orphelin possible)
- FIX 2 (src/app/(main)/entreprise/[slug]/page.tsx) : le select Prisma contenait avgRating: true (champ inexistant) → exception à chaque visite de page entreprise, JSON-LD SEO perdu. Remplacé par db.review.aggregate({ where: { businessId }, _avg: { rating } }) injecté dans business.avgRating
- Curl post-fix : slug dupliqué → 201 avec slug auto-renommé saveurs-de-bissau-2 ; nom normal → 201 ; email existant → 409 clair
- E2E Agent Browser : wizard 4 étapes complet (nom « Bissau Digital Solutions » dont le slug existe déjà, catégorie, compte, localisation, upload photo de couverture) → « Bienvenue sur Pebiss ! 🎉 », auto-login OK, 0 erreur console, business créé en base avec slug bissau-digital-solutions-2, coverImage servie 200
- JSON-LD aggregateRating/ratingValue à nouveau rendu sur /entreprise/* ; plus aucune erreur « Unknown field » dans dev.log
- Nettoyé données de test E2E (user + business + fichier cover) — DB à l'état seed (11 users, 10 businesses)

Stage Summary:
- Inscription entreprise 100% fonctionnelle même avec un nom d'entreprise homonyme
- Page entreprise : JSON-LD SEO réparé (avgRating calculé par agrégation)
- Fichiers modifiés : src/app/api/auth/register/route.ts, src/app/(main)/entreprise/[slug]/page.tsx

---
Task ID: 4
Agent: Z.ai Code (main)
Task: Corriger « j'ai créé un poste sur rubrique assurance mais il ne s'affiche pas dans assurance sur la page d'accueil »

Work Log:
- Vérifié en base + dev.log : AUCUNE donnée créée par l'utilisateur sur ce sandbox (tout est du seed) — son annonce a été créée sur son déploiement (production), le bug est donc dans le code poussé
- Analyse de l'affichage des annonces sur l'accueil : 3 placements (carrousel promo_gauche, bannière promo_droite, grille 336x280 « Accueil — Milieu »)
- BUG 1 (reproduit) : PromoSlider/RightPromoBanner filtraient `.filter((b) => !!b.image)` → toute annonce publiée SANS image était silencieusement ignorée (l'API la renvoyait bien, count: 1, mais elle n'était jamais rendue)
- BUG 2 (reproduit) : HomepageSponsoredGrid (annonces 336x280 « Accueil — Milieu ») défini dans banner-placement.tsx mais jamais importé ni rendu dans page.tsx → ces annonces n'apparaissaient NULLE PART
- FIX 1 : banner-placement.tsx — suppression des filtres par image ; les annonces sans image utilisent un fond dégradé (from-gray-900 via-gray-800 to-black) avec titre+description ; overlay latéral conservé pour les slides promo par défaut avec image (lisibilité)
- FIX 2 : page.tsx — import + rendu de <HomepageSponsoredGrid /> juste après la section rubriques (avant ABOUT)
- E2E Agent Browser : annonce sans image (format promo_gauche) visible dans le carrousel « Promotions Pebiss » de l'accueil + annonce avec image (format 336x280) visible dans la grille sponsorisée — 0 erreur console
- Nettoyé les 2 annonces de test — DB à l'état seed (10 ads)

Stage Summary:
- Toute annonce publiée (avec ou sans image, quel que soit le format d'accueil) est désormais visible sur la page d'accueil
- L'utilisateur devra redéployer (docker build) pour bénéficier du fix sur sa production
- Fichiers modifiés : src/app/(main)/page.tsx, src/components/shared/banner-placement.tsx

---
Task ID: 5
Agent: Z.ai Code (main)
Task: Synchroniser la version locale avec GitHub (topmuch/pebissoa) + bouton « Voir mes annonces » dans le dashboard client

Work Log:
- Synchronisation : `git fetch` puis `git reset --hard origin/main` — supprimé l'auto-commit sandbox f6cd21f (.zscripts/, tool-results/, uploads de test) et les changements de mode de fichiers (100644→100755) ; local = GitHub à 0e951fb ; db/ et .env non trackés donc intacts
- Analyse : le dashboard (/dashboard) est réservé ENTERPRISE/ADMIN (layout redirige les autres vers /) ; « la page profil du client » = page publique /entreprise/[slug] où ses annonces (bannières position=enterprise : sidebar 300x600 + footer detail_728x90) sont affichées
- i18n : nouvelle clé `dash_view_my_ads` dans les 3 langues — fr « Voir mes annonces », pt « Ver os meus anúncios », en « View my ads » (src/lib/i18n.ts ×2 sections, src/lib/i18n-en.ts)
- Dashboard (src/app/(dashboard)/dashboard/page.tsx) : bouton « Voir mes annonces » (icône Eye, variante outline) en 2 emplacements — en-tête à droite du titre (flex responsive, pleine largeur sur mobile) et carte « Actions rapides » sous « Créer une annonce » ; lien `/entreprise/${slug}`, rendu conditionnel sur slug existant
- Bug mobile détecté au passage (préexistant, vérifié par git stash) : débordement horizontal 457px vs 390px — cause : min-content du titre d'annonce `truncate` (nowrap, 307px) qui remonte via min-width:auto des flex/grid items jusqu'au conteneur racine
- Fix responsive : `min-w-0` sur le conteneur principal du DashboardLayout (flex-1 flex-col) + sur les 2 items de la grille lg:grid-cols-3 (Card avis lg:col-span-2 et colonne droite space-y-6) → scrollWidth 390 = innerWidth 390
- Identifiants démo mis à jour : la base actuelle est seedée avec comptes .sn (seed-production.ts), mot de passe vérifié par bcrypt = ent123
- E2E Agent Browser : connexion dakar-digital-solutions@pebiss.sn → /dashboard → bouton visible (en-tête + actions rapides) → clic → redirection OK vers /entreprise/dakar-digital-solutions ; vérifié desktop 1440px et mobile 390px (screenshots) ; 0 erreur console
- Lint ESLint : 0 erreur
- Note : 404 préexistants sur /uploads/*.png (placeholders seed de 70 octets jamais committés sur GitHub) — cosmétique, hors périmètre

Stage Summary:
- Le dashboard client dispose d'un bouton « Voir mes annonces » qui redirige vers la page profil public de l'entreprise où ses annonces sont visibles
- Débordement horizontal mobile du dashboard corrigé (préexistant)
- Fichiers modifiés : src/app/(dashboard)/dashboard/page.tsx, src/components/dashboard/dashboard-layout.tsx, src/lib/i18n.ts, src/lib/i18n-en.ts

---
Task ID: 6
Agent: Z.ai Code (main)
Task: Corriger « impossible de mettre des images — erreur téléchargement »

Work Log:
- Diagnostic : API /api/upload fonctionne (curl 200 + fichier servi 200), et TOUS les écrans testés fonctionnent en E2E sur le sandbox (photos dashboard 3→4, dialog annonces POST 201 + image, wizard inscription étape photo) → l'échec utilisateur est lié au TYPE/TAILLE de fichier ou à son déploiement, et les UI masquaient la cause réelle derrière « Erreur lors du téléchargement »
- Nouveau helper partagé src/lib/upload-client.ts : uploadFiles() (lance une Error avec le message serveur précis), validateImageFile() (pré-check client : taille 10 Mo, HEIC, MIME vide → fallback extension), uploadErrorMessage() (message d'erreur ou fallback i18n)
- API upload : extensions .jfif (JPEG WhatsApp/mobiles) et .avif acceptées ; message dédié pour .heic/.heif (« photos iPhone (HEIC) non supportées, convertissez en JPG ») ; messages d'erreur incluant le nom du fichier
- 9 consommateurs migrés vers le helper + affichage de l'erreur réelle dans les toasts : register/page.tsx (validation MIME remplacée par validateImageFile — corrige le rejet des fichiers avec file.type vide, fréquent sur mobile), dashboard photos/ads/products/mon-entreprise/settings, admin-edit-business-dialog, admin annonces/demo-data/parametres
- Tailles alignées à 10 Mo (API était à 10 Mo, register bloquait à 5 Mo côté client) : hints i18n onboarding_step4_hint / dash_photos_format / dash_settings_avatar_format en fr+pt+en
- compose.yml : ajout du volume pebissoa-uploads:/app/uploads manquant (le README-DEPLOY demandait 2 volumes mais le compose n'en avait qu'1 → images perdues à chaque redéploiement)
- Tests : curl .jfif accepté, .heic message clair, .exe rejet clair ; E2E UI : toast affichant le message HEIC complet, upload .jfif via dropzone photos OK (4→5) ; lint 0 erreur ; photos/annonces de test nettoyées

Stage Summary:
- Les échecs d'upload affichent maintenant la VRAIE raison (format, HEIC, taille) au lieu d'un message générique
- Formats élargis : .jfif et .avif acceptés ; garde-fou explicite pour HEIC
- Volume /app/uploads ajouté au compose → persistance des images en production Coolify
- Fichiers : src/lib/upload-client.ts (nouveau), api/upload/route.ts, register, 5 pages dashboard, dialog admin, 3 pages admin, i18n.ts, i18n-en.ts, compose.yml

---
Task ID: 6
Agent: Z.ai Code (main)
Task: Persistance des uploads en production — l'utilisateur déploie et déclare « je dois mettre /app/uploads dans les variables de persistance »

Work Log:
- Diagnostic : la démarche utilisateur est correcte (volume persistant sur /app/uploads), MAIS le Dockerfile avait un défaut bloquant dans ce scénario
- Trouvé : scripts/copy-bundled-uploads.cjs (remplissage du volume avec les images embarquées) n'était JAMAIS appelé et /app/.bundled-uploads n'était jamais créé dans l'image → au 1er boot avec volume, le volume vide masque les 105 images de l'image Docker → toutes les photos de production 404
- Dockerfile : ajout de `RUN mkdir -p /app/.bundled-uploads && cp -r uploads/. /app/.bundled-uploads/` (copie pristine hors du chemin monté) + appel de `node scripts/copy-bundled-uploads.cjs` dans le CMD avant init-production.cjs
- scripts/copy-bundled-uploads.cjs : condition de skip = existsSync (au lieu de size>0) → plus de re-copie des fichiers vides (.gitkeep) à chaque boot, logs propres
- Tests locaux : simulation volume vide (BUNDLED_UPLOADS_DIR/UPLOADS_DIR) → 108 fichiers copiés au 1er passage, 0 au 2e (idempotent) ; lint 0 erreur ; suppression d'un auto-commit sandbox parasite (a394e0b) par reset --hard origin/main

Stage Summary:
- Déployer avec 2 volumes persistants est maintenant SÛR : /app/uploads (images) et /app/data (SQLite) — au 1er boot le volume uploads est rempli automatiquement avec les 105 images de production, sans jamais écraser les uploads utilisateurs
- UPLOADS_DIR=/app/uploads est déjà défini dans le Dockerfile (ENV + export CMD) : aucune variable d'env supplémentaire requise côté Coolify
- Fichiers : Dockerfile, scripts/copy-bundled-uploads.cjs

---
Task ID: 7
Agent: Z.ai Code (main)
Task: Superadmin — pouvoir cliquer pour modifier une annonce (photo + texte) dans le dashboard admin

Work Log:
- Audit : l'API PUT /api/ads/[id] existait déjà (ADMIN autorisé, tous champs : title, description, image, type, categoryId, format, position, link, isActive, dates) — seul le frontend admin manquait
- Page admin/annonces : bouton crayon « Modifier » dans la colonne Actions + ligne entière cliquable (cursor-pointer, hover) pour ouvrir l'édition ; stopPropagation pour ne pas déclencher l'édition en cliquant supprimer
- Dialog unique create/edit : mode édition pré-remplit tous les champs (titre, description, type, catégorie, format, position, lien, actif, dates au format input date, image avec aperçu) ; titre « Modifier l'annonce » ; bouton « Enregistrer » (vs « Créer »)
- updateMutation → PUT /api/ads/[id] avec gestion d'erreur réelle (toast avec message serveur) ; upload de photo fonctionnel en mode édition (uploadFiles → aperçu → PUT)
- i18n : clés admin_ads_edit / admin_ads_edit_title / admin_ads_updated_msg / admin_ads_error_update en fr + pt + en ; factorisation emptyForm + toDateInput
- E2E Agent Browser : login admin@pebiss.sn → /admin/annonces → crayon → dialog pré-rempli (« Eval Test Banner ») → modification titre + description + upload PNG → Enregistrer → table mise à jour ; édition par clic ligne OK ; image servie HTTP 200 ; DB vérifiée (title/description/image/updatedAt)
- Nettoyage : annonce de test + fichier uploadé supprimés ; lint 0 erreur

Stage Summary:
- Le superadmin peut maintenant modifier n'importe quelle annonce (texte + photo + tous les paramètres) en cliquant sur la ligne ou le crayon dans /admin/annonces
- Aucune modification backend nécessaire (PUT /api/ads/[id] déjà complet)
- Fichiers : src/app/(admin)/admin/annonces/page.tsx, src/lib/i18n.ts, src/lib/i18n-en.ts

---
Task ID: 8
Agent: Z.ai Code (main)
Task: « le bouton modifier est présent mais l'upload des photos ne marche pas » — durcissement prod + diagnostics + preuves

Work Log:
- Audit : le client (upload-client.ts) et POST /api/upload fonctionnent (preuve réseau locale) ; suspect principal pour la production = la route catch-all /api/uploads/[...path] « unreliable in standalone builds » (commentaire du repo lui-même) JAMAIS contournée : les URLs /uploads/* et /api/uploads/* y passaient toutes
- middleware.ts : /uploads/* ET /api/uploads/* sont maintenant réécrits vers /api/serve-image/[filename] (route single-segment fiable en standalone) ; matcher étendu à /api/uploads/:path* ; le catch-all reste en secours
- src/app/api/health/route.ts (NOUVEAU) : endpoint de diagnostic public { ok, db, uploads: { dir, writable, files } } avec test d'écriture réel — permet de PROUVER l'état du volume uploads sur le déploiement Coolify
- api/upload/route.ts : la réponse 500 inclut maintenant le vrai message d'erreur serveur (ex : EACCES) au lieu d'un générique
- Preuves E2E (Agent Browser, réseau + DB) : POST /api/upload 200 → GET /api/uploads/ee36b2f5….png 200 (aperçu immédiat) → PUT /api/ads/… 200 → GET /api/ads 200 ; DB { image: /api/uploads/ee36b2f5…, updatedAt } ; curl image persistée HTTP 200 image/png ; screenshot /tmp/preuve-upload-ok.png ; 0 erreur console ; les 3 chemins de service (/, /api/serve-image, /api/uploads) vérifiés 200 en curl ; /api/health {"ok":true,"db":"ok","files":107,"writable":true}
- Nettoyage : fichier test supprimé, annonce API Test Banner restaurée (image=null) ; lint 0 erreur

Stage Summary:
- Le service d'images passe par la route fiable standalone (/api/serve-image) pour TOUS les formats d'URL (historiques /uploads/ et nouveaux /api/uploads/)
- /api/health permet à l'utilisateur de vérifier son déploiement prod en 1 URL (volume inscriptible ? nb fichiers ? DB ok ?)
- Fichiers : src/middleware.ts, src/app/api/health/route.ts (nouveau), src/app/api/upload/route.ts
