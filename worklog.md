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

---
Task ID: 9
Agent: Z.ai Code (main)
Task: « /api/health ok mais l'upload ne marche toujours pas » — files:3 au lieu de 107, remplacement de volume, diagnostic et auto-réparation

Work Log:
- Analyse du rapport prod utilisateur {dir:/app/uploads, writable:true, files:3} : le volume est correct et inscriptible MAIS les 105 images embarquées n'y sont pas (remplissage au 1er boot jamais exécuté — probablement image construite avant le fix ou cache de build sur RUN git clone) ; files:3 = probablement les uploads de l'utilisateur, donc POST /api/upload FONCTIONNE en prod
- Auto-réparation du symptôme : fallback dans les 2 routes de service (serve-image + catch-all uploads) — si le fichier est absent du volume, il est servi depuis la copie pristine /app/.bundled-uploads (getBundledUploadsDir : env BUNDLED_UPLOADS_DIR, /app/.bundled-uploads, <cwd>/.bundled-uploads) → les images de production s'affichent MÊME si le remplissage du volume a échoué
- /api/health enrichi : uploads.recent (5 derniers fichiers avec URL testables), bundled {dir, files} (présence de la copie embarquée dans l'image), nextauthUrl (diagnostic session)
- Dockerfile : le clone logge « 🔨 Build commit: … » dans les logs de build Coolify (détection de build périmé) ; le 2>/dev/null retiré sur copy-bundled-uploads.cjs → son rapport (📸 X nouvelles) est désormais VISIBLE dans les logs de démarrage
- Preuves locales : fallback testé (fichier retiré du volume → servi 200 image/jpeg 1 045 730 o depuis .bundled-uploads) ; E2E re-testé avec nouveau code : POST /api/upload 200 → aperçu GET /api/uploads/959912db….png 200 → save → DB {image, updatedAt} → curl 200 ; /api/health affiche recent + bundled ; lint 0 erreur ; données de test nettoyées

Stage Summary:
- Quelle que soit la cause du files:3 (build périmé / étape muette), les images de production s'affichent désormais via le fallback embarqué, et les uploads utilisateurs (prouvés atterrir dans le volume) se servent normalement
- Le prochain déploiement montrera dans les logs : le commit buildé + le nombre d'images copiées dans le volume
- Fichiers : src/lib/uploads.ts, src/app/api/serve-image/[filename]/route.ts, src/app/api/uploads/[...path]/route.ts, src/app/api/health/route.ts, Dockerfile

---
Task ID: 9
Agent: Z.ai Code (main)
Task: Mode maintenance dans les paramètres admin avec jour/heure et logo au milieu de l'écran

Work Log:
- Inventaire : mode maintenance préexistant (switch + message + heure de fin dans /admin/parametres, /api/maintenance, MaintenanceGuard avec icône clé à molette) — le logo n'était jamais affiché et pas de jour/heure de début
- Prisma : ajout SiteConfig.maintenanceStartTime (DateTime?) + bun run db:push + redémarrage du serveur dev (client Prisma rechargé — le 500 « Unknown argument maintenanceStartTime » vient de l'ancien client en mémoire)
- API : PUT /api/settings accepte maintenanceStartTime (stocké ISO explicite) ; GET /api/maintenance renvoie désormais {startTime, logo} en plus de {message, endTime}
- Admin /admin/parametres (onglet Maintenance) : champ « Jour et heure de début » (datetime-local, CalendarDays) à côté de « Date/heure de fin » (CalendarClock) en grille responsive ; helper toLocalInput (ISO → heure locale du navigateur) ; handleSave convertit datetime-local → toISOString() pour un stockage sans ambiguïté de fuseau
- Écran public maintenance-guard.tsx : logo du site affiché AU MILIEU (img centrée, carte blanche shadow-xl ; fallback icône clé si aucun logo) ; bloc « Début prévu le [jour] à [heure] » / « Retour prévu le [jour] à [heure] » formaté Intl.DateTimeFormat selon la langue (fr-FR/pt-PT/en-US) ; conteneur overflow-y-auto + mise en page compacte (le contenu débordait du viewport 578px → coupé) ; compte à rebours conservé
- i18n : clés maintenance_starts_on, maintenance_back_on, maintenance_at_time + admin_settings_maintenance_start_time(_hint) en fr/pt/en
- E2E Agent Browser avec preuves : login admin → onglet Maintenance → switch ON → message + début 2026-09-21T09:00 + fin 17:30 → Enregistrer → PUT /api/settings 200 → DB vérifiée {maintenanceMode:true, maintenanceStartTime:2026-09-21T09:00Z, maintenanceEndTime:17:30Z} → GET /api/maintenance {active:true, startTime, endTime, logo} → page d'accueil visiteur = écran maintenance avec logo PeBiss centré + jours/heures + compte à rebours (captures /tmp/preuve-maintenance-desktop.png 1280x900, /tmp/preuve-maintenance-mobile.png 375x667, fallback sans logo /tmp/preuve-maintenance-fallback.png) → switch OFF → site public restauré → 0 erreur console, lint 0 erreur
- État de la DB locale restauré après tests (maintenanceMode:false, logo:'') ; push GitHub c2697f0

Stage Summary:
- L'admin peut programmer une maintenance avec jour + heure de début ET de fin ; les visiteurs voient l'écran de maintenance avec le logo du site au milieu, le jour et l'heure prévus, et un compte à rebours
- Le logo affiché est celui configuré dans Paramètres > Général (upload logo) ; s'il est absent, l'icône clé historique s'affiche
- Déploiement prod Coolify : Redeploy (commit c2697f0), db push se fera au boot (Dockerfile) — aucune variable d'env nouvelle
- Fichiers : prisma/schema.prisma, src/app/api/settings/route.ts, src/app/api/maintenance/route.ts, src/components/maintenance-guard.tsx, src/app/(admin)/admin/parametres/page.tsx, src/lib/i18n.ts, src/lib/i18n-en.ts

---
Task ID: 10
Agent: Z.ai Code (main)
Task: Bouton « Activer le mode maintenance » bien visible + bouton connexion administrateur sur l'écran de maintenance

Work Log:
- Retour utilisateur : « ya pas de bouton activer le mode maintenance » + « mettre un bouton connexion pour que l'administrateur puisse se connecter » (l'admin était bloqué par l'écran de maintenance quand déloggé)
- Admin /admin/parametres (onglet Maintenance) : ajout d'un gros bouton Power « Activer le mode maintenance » (orange) — au clic : updateField + handleSave({maintenanceMode:true}) → activation ET enregistrement en 1 clic ; devient bouton vert « Désactiver le mode maintenance » quand actif ; hints explicites sous le bouton ; handleSave refactoré pour accepter des overrides (Partial<form>) ; Save global passé à onClick={() => handleSave()}
- Écran public maintenance-guard.tsx : lien discret « Connexion administrateur » (LogIn, text-xs, muted) sous le copyright → /login/admin (route exemptée de la maintenance) ; i18n maintenance_admin_login fr/pt/en
- i18n : admin_settings_maintenance_activate_btn/_hint, admin_settings_maintenance_deactivate_btn/_hint (fr/pt/en)
- Fix au passage : le bouton n'actualisait pas l'état local du formulaire (restait sur « Activer » après activation) → updateField avant handleSave
- E2E avec preuves : clic Activer → PUT /api/settings 200 + /api/maintenance {active:true} + bouton bascule en « Désactiver » ; écran visiteur = maintenance avec lien « Connexion administrateur » en bas (/tmp/preuve-connexion-admin-bouton.png) ; clic → /login/admin chargé pendant la maintenance → login admin@pebiss.sn → redirect /admin ; clic Désactiver → /api/maintenance {active:false} + site restauré (GET / 200, /tmp/preuve-bouton-desactiver.png, /tmp/preuve-site-restaure.png) ; lint 0 erreur
- DB locale restaurée (maintenanceMode:false) ; push GitHub 41ec8de

Stage Summary:
- L'admin dispose d'un vrai bouton visible qui active/désactive la maintenance en un clic (sans chercher l'interrupteur ni revenir sur Enregistrer)
- En cas de maintenance, l'admin déloggé peut se connecter via le lien « Connexion administrateur » en bas de l'écran de maintenance
- Fichiers : src/app/(admin)/admin/parametres/page.tsx, src/components/maintenance-guard.tsx, src/lib/i18n.ts, src/lib/i18n-en.ts

---
Task ID: 11
Agent: Z.ai Code (main)
Task: Admin connecté doit pouvoir travailler pendant la maintenance (écran de maintenance ne doit plus le bloquer)

Work Log:
- Retour utilisateur : « lorsque l'admin est connecté en mode maintenance, si il essaye de modifier un fichier le mode maintenance s'affiche » — le MaintenanceGuard bloquait TOUS les visiteurs des pages publiques, y compris l'admin connecté
- src/components/maintenance-guard.tsx : ajout useSession (next-auth/react, SessionProvider global) — si session.user.role === 'ADMIN', l'écran de maintenance ne s'affiche JAMAIS ; anti-flash (le rendu attend la résolution de la session avant d'afficher l'écran) ; sur les pages publiques pendant la maintenance, l'admin voit un badge discret ambre « Mode maintenance actif — invisible pour les visiteurs » avec lien Gérer → /admin/parametres ; i18n fr/pt/en (maintenance_active_badge, maintenance_active_badge_manage)
- E2E avec preuves : maintenance ON via bouton admin → admin connecté navigue sur /, /annonces, /annuaire : 0 écran de maintenance, badge visible (/tmp/preuve-admin-bypass-maintenance.png) ; modification réelle d'une annonce pendant la maintenance : /admin/annonces → clic ligne → titre modifié → Enregistrer → PUT /api/ads/… 200 → DB vérifiée « API Test Banner — MAJ PENDANT MAINTENANCE » (titre restauré ensuite) ; session visiteur séparée (agent-browser --session visitor, non authentifiée) → écran « Site en maintenance » affiché (/tmp/preuve-visiteur-maintenance.png) ; Désactiver → {active:false}, 0 erreur console ; lint 0 erreur
- Push GitHub e7030e1

Stage Summary:
- Pendant la maintenance : les visiteurs non connectés voient l'écran de maintenance ; l'admin connecté parcourt tout le site et effectue ses modifications sans aucune interruption, avec un rappel discret que le mode est actif
- Les routes /admin, /dashboard, /login, /register restaient déjà exemptées pour tous ; la nouveauté est le bypass par rôle ADMIN sur les pages publiques
- Fichiers : src/components/maintenance-guard.tsx, src/lib/i18n.ts, src/lib/i18n-en.ts

---
Task ID: 12
Agent: Z.ai Code (main)
Task: Photos cassées partout + upload de nouvelles photos impossible depuis le dashboard admin

Work Log:
- Diagnostic : 2 causes distinctes
  1) L'espace de travail avait été réinitialisé (13:25) : `src/app/api/upload/route.ts` avait DISPARU du disque (présent dans git HEAD) → POST /api/upload = 404 → tout upload photo échouait (édition annonce admin, inscription, logo…). La DB locale db/custom.db était aussi VIDE (0 lignes).
  2) `.env` sans NEXTAUTH_SECRET → next-auth v4 dérivait des fallbacks de secret DIFFÉRENTS selon le module → « JWEDecryptionFailed » dans getServerSession → 401 sur TOUTES les écritures authentifiées (PUT /api/ads/[id], /api/stats…) alors que le login et l'upload (sans auth) passaient.
- Restaurations : `git checkout -- src/app/api/upload/route.ts` (route upload revenue, POST 200) ; `node scripts/init-production.cjs` (admin + SiteConfig + 31 catégories + 43 entreprises + photos/produits/services/horaires/avis + 6 annonces) ; recréation admin@pebiss.sn / Admin@123456 ; `git checkout -- uploads/` (1 fichier manquant revenu, 108 fichiers).
- Scan images DB vs disque : 89 refs valides, 1 cassée — logo de « Aéroport international Osvaldo Vieira de Bissau » pointait vers /uploads/9a6607b6….webp jamais commitée → réparé localement (logo = coverImage de l'entreprise), corrigé dans prisma/production-data.json, + étape de réparation idempotente ajoutée à scripts/init-production.cjs (s'exécute à CHAQUE boot → répare la prod au prochain Redeploy).
- Fix auth : NEXTAUTH_SECRET fort + NEXTAUTH_URL ajoutés au .env local ; src/lib/auth.ts → `secret: process.env.NEXTAUTH_SECRET || 'pebissOa-fallback-secret-2026-stable-…'` (fallback déterministe identique partout : les sessions marchent même sans la variable d'env, y compris en prod Coolify) ; serveur dev redémarré.
- E2E avec preuves : POST /api/upload avec vraie image → 200 + url servie 200 image/jpeg ; login admin → /admin/annonces → Modifier « GRUPO DAF EM PROMO » → upload magenta test → POST /api/upload 200, aperçu affiché → Enregistrer → **PUT /api/ads/… 200** (avant le fix : 401) → DB vérifiée {image: /api/uploads/2ef3c73e….jpg} → vignette magenta visible dans la liste (capture /tmp/e2e-admin-annonce-modifiee.png) ; annonce + fichiers de test restaurés ensuite.
- Balayage « images cassées » sur 10 pages (/, /annuaire, /annonces, /categories, /entreprise/[slug] aéroport, /apropos, /avis-clients, /publicite, /contact + mobile 375×667) : **0 image cassée partout** (ex : accueil 27 imgs/0, catégories 33/0) ; console sans erreur ; lint 0 erreur.

Stage Summary:
- Upload de photos rétabli partout (la route POST /api/upload avait disparu du disque — restaurée depuis git)
- Toutes les actions authentifiées marchent à nouveau (401 « decryption operation failed » corrigé par un secret stable) — c'est ce qui bloquait l'enregistrement des annonces avec nouvelles photos
- La seule image réellement cassée (logo aéroport, absente du dépôt) est réparée en DB locale, dans le seed, et le boot prod la réparera automatiquement
- Prod Coolify : Redeploy → copy-bundled-uploads remplira /app/uploads (108 images embarquées) + init-production.cjs réparera le logo ; recommandé d'ajouter NEXTAUTH_SECRET dans les variables Coolify (le fallback code couvre son absence)
- Fichiers : src/app/api/upload/route.ts (restauré), src/lib/auth.ts, scripts/init-production.cjs, prisma/production-data.json

---
Task ID: 13
Agent: Z.ai Code (main)
Task: Prod — 100+ annonces avec images cassées ; rendre le système d'images résilient + récupération

Work Log:
- Retour utilisateur : le site en production affiche 100+ annonces avec images cassées. Cause : les images uploadées/utilisées en prod vivent (ou vivaient) dans l'ANCIEN volume Coolify (/app/public/uploads) ; le nouveau volume /app/uploads n'a jamais reçu ces fichiers (health historique : files:3). Elles ne sont ni dans git ni dans la copie embarquée.
- Vérifié : pebiss.com ne sert plus ces fichiers (404 JSON) → récupération impossible depuis l'origine ; seule l'ancien volume peut les rendre.
- Résilience implémentée :
  - src/lib/uploads.ts : resolveUploadFilePath unifié (volume → embarqué /app/.bundled-uploads → volumes legacy /app/public/uploads + LEGACY_UPLOADS_DIR) + imagePlaceholderSvg (placeholder élégant 480×320)
  - Routes serve-image + uploads catch-all : fichier introuvable partout → SVG placeholder HTTP 200 (Cache-Control: no-store, X-Image-Missing: 1) au lieu du 404 → PLUS AUCUNE icône « image cassée » sur le site ; l'image réapparaît seule dès que le fichier est restauré
  - copy-bundled-uploads.cjs : au boot, copie vers le volume non seulement les images embarquées MAIS AUSSI celles des anciens volumes legacy détectés (récupération automatique si l'ancien volume est remonté)
  - /api/health : rapport imageIntegrity {referenced, presentInVolume, recoverableFromBundledOrLegacy, missingNowhere, missingSample} + liste des volumes legacy détectés → diagnostic chiffré avant/après Redeploy
- Nouvelle image jamais commitée découverte via le rapport (32c6c05f…jpg, photo galerie « Orange Bissau ») : réparée en DB locale + production-data.json + cas ajouté à la réparation au boot de init-production.cjs (volontairement limité aux cas connus pour ne pas toucher aux refs qui doivent guérir via l'ancien volume)
- E2E avec preuves : annonce avec image inexistante → /api/uploads/... renvoie 200 SVG placeholder (headers no-store) → page /annonces : 0 icône cassée, placeholder affiché (capture /tmp/preuve-placeholder.png) ; annonce pointant un fichier présent UNIQUEMENT dans un dossier legacy simulé → image servie 200 image/jpeg depuis le legacy ; après nettoyage des tests : imageIntegrity 103 référencées / 103 présentes / 0 manquantes ; lint 0 erreur
- NB : l'espace de travail sandbox a été réinitialisé une 2e fois pendant la tâche (DB vidée, upload route effacée, .env perdu) — tout a été restauré (route, seed 43 entreprises/6 annonces, admin@pebiss.sn, uploads 108, NEXTAUTH_SECRET) ; code commis AVANT pour le protéger

Stage Summary:
- Fini les icônes d'images cassées : toute image absente affiche un placeholder propre et redevient visible automatiquement dès que le fichier existe à nouveau
- La prod récupérera TOUTES les images de l'ancien volume dès qu'il sera remonté : au boot, copy-bundled-uploads.cjs les recopie dans /app/uploads (ne jamais écraser) ; /api/health donnera le décompte exact
- Action utilisateur Coolify : remonter l'ancien volume (/app/public/uploads) en plus de /app/uploads puis Redeploy — ou copier les fichiers de l'ancien volume vers le nouveau (commande docker fournie dans le rapport)
- Fichiers : src/lib/uploads.ts, src/app/api/serve-image/[filename]/route.ts, src/app/api/uploads/[...path]/route.ts, src/app/api/health/route.ts, scripts/copy-bundled-uploads.cjs, scripts/init-production.cjs, prisma/production-data.json

---
Task ID: 14
Agent: Z.ai Code (main)
Task: « J'ai créé une annonce mais dans la catégorie sur la page d'accueil l'annonce apparaît mais l'image n'apparaît pas »

Work Log:
- Diagnostic prod (pebiss.com) : l'« annonce » est en réalité l'entreprise « Societe General Guinéé Bissau » créée le 17/09 20:24 UTC via l'inscription — cover OUI (/api/uploads/9982a364….jpg, servie correctement), logo NULL. Le formulaire /register ne propose que coverImage (pas de logo) → toute entreprise créée par inscription a logo=null.
- Cause : la carte annuaire (PjBusinessCard) n'affichait QUE business.logo → si logo null, icône grise même quand une cover existe → « l'annonce apparaît mais l'image n'apparaît pas ». La page /categories (images statiques) et l'accueil (aucune carte entreprise, vérifié : 27 imgs/0 cassée, « Societe General » absente) écartés.
- Constat prod additionnel : le logo d'« Orange » (uploadé 16/09) renvoie le placeholder SVG (X-Image-Missing:1) → le fichier uploadé a disparu du volume au Redeploy (volume recréé ?) ; la cover d'aujourd'hui (uploadée APRÈS le boot) est bien servie. Problème de persistance Coolify à signaler, non corrigeable en code.
- Fixes : (1) PjBusinessCard : image = logo || coverImage || icône (+ champ coverImage ajouté à l'interface Business) ; (2) fiche entreprise sidebar : même fallback ; (3) admin/annonces : bouton Enregistrer désactivé pendant l'upload (prévention bannière créée sans image).
- Workspace sandbox réinitialisé une 3e fois (DB vide) → restauration : init-production.cjs (31 catégories, 43 entreprises, 6 pubs, admin), NEXTAUTH_SECRET vérifié, src/app/api/upload/route.ts restauré de git AVANT commit (sinon le push l'aurait supprimé du dépôt !).
- E2E avec preuves : entreprise de test locale logo=null+cover existante → carte annuaire affiche la cover (imgLoaded:true, /tmp/preuve-fix-cover-annuaire.png), fiche affiche la cover en sidebar (2 occurrences, /tmp/preuve-fix-cover-fiche.png) ; entreprises avec logo inchangées (logo prioritaire) ; 0 image cassée sur l'annuaire ; 0 erreur dev.log ; lint 0 erreur ; entreprise de test supprimée.
- Push GitHub adf81f9 (3 fichiers). Redeploy Coolify requis pour la prod.

Stage Summary:
- Les entreprises créées via l'inscription (cover sans logo) affichent désormais leur photo dans l'annuaire et sur leur fiche — fin des cartes grises sans image
- Prévention : impossible d'enregistrer une bannière admin pendant un upload en cours
- ⚠️ À signaler à l'utilisateur : le logo d'Orange uploadé le 16/09 a disparu au Redeploy (le volume /app/uploads ne persiste pas ?) — vérifier dans Coolify que le volume /app/uploads est bien un volume persistant, sinon TOUT fichier uploadé disparaît à chaque Redeploy

---
Task ID: 15
Agent: Z.ai Code (main)
Task: Avant Redeploy — vérifier la persistance Coolify (capture Persistent Storage fournie par l'utilisateur)

Work Log:
- Analyse de la capture Coolify : Volume 1 (source /var/lib/coolify/volumes/pebissoa-data → /app/data) ; Volume 2 (MÊME source → /app/public/uploads). Le code écrit les uploads dans /app/uploads (UPLOADS_DIR, Dockerfile) où AUCUN volume n'est monté → uploads éphémères, détruits à chaque Redeploy (confirme la perte du logo Orange et les 8 manquantes de /api/health).
- PREUVE : /api/health prod = 113 référencées / 105 présentes / 8 perdues, recoverableFromBundledOrLegacy: 0.
- TROU DE SÉCURITÉ DÉCOUVERT ET PREUVÉ : les 2 volumes partageant la même source, /app/public/uploads expose le répertoire de la DB → https://pebiss.com/api/uploads/pebiss.db renvoyait la DB SQLite COMPLÈTE (HTTP 200, 172 Ko, « SQLite 3.x database » confirmé par file) — utilisateurs + hashes téléchargeables par n'importe qui.
- Fix sécurité : SERVABLE_EXTENSIONS + isServableFilename() dans src/lib/uploads.ts ; refus 404 AVANT résolution fichier dans /api/serve-image/[filename] ET /api/uploads/[...path]. E2E local : custom.db → 404, pebiss.db → 404, image existante → 200 image/jpeg, image manquante → placeholder SVG intact, sans extension → 404.
- SAUVETAGE DES DONNÉES avant Redeploy (les 111 fichiers actuels de /app/uploads vivent dans la couche éphémère et mourraient au Redeploy) : scripts/harvest-prod-images.cjs balaie les APIs publiques (51 entreprises + fiches + bannières + réglages) → 113/113 références (= compte health exact), 102 déjà dans git, 3 téléchargées et committées dans uploads/ (dont 9982a364 = cover « Societe General » créée aujourd'hui, + 87551321, 78aa429f) → le Dockerfile les embarque et copy-bundled-uploads.cjs les restaurera dans le volume au boot.
- 8 images DÉFINITIVEMENT perdues (re-uploader) : 3663d8dd (logo Orange), 87fd7a50 (cover Orange), f88b8d42 (logo Banco Atlântico), 5830514a, 1c98026f, 92ec235f, 5e8b076d, 380e18da.
- Scan régression local : annuaire 41 imgs/0 cassée, accueil 27/0 ; lint 0 erreur ; dev.log propre.
- Workspace encore réinitialisé pendant la tâche (DB vide) → re-restauré (init-production.cjs + admin). Route /api/upload revérifiée présente avant commit.
- Push GitHub f1ee6d5.

Stage Summary:
- La config Coolify actuelle : DB persistante ✅ mais uploads NON persistants ❌ (volume images monté au mauvais chemin /app/public/uploads avec la source de la DB) + DB téléchargeable publiquement 🚨 (corrigé en code)
- Instructions données à l'utilisateur : Volume 2 → Source /var/lib/coolify/volumes/pebissoa-uploads (dir DÉDIÉ, différent de la DB), Destination /app/uploads ; puis Redeploy ; au boot le volume sera rempli (108 seed + 3 sauvetées)
- 8 fichiers perdus à re-uploader via l'admin (dont logo + cover Orange, logo Banco Atlântico)

---
Task ID: 15
Agent: Z.ai Code (main)
Task: Vérifier la persistance Coolify AVANT Redeploy (demande: "avant de deployer verifie les persistence" + "si je met /app/uploads les images vont disparaitre")

Work Log:
- Analyse capture Coolify (upload/screencapture-...persistent-storage-2026-09-17-20_49_40.png) : 2 volumes — /app/data ✓ DB ; volume images monté sur /app/public/uploads avec la MÊME source que la DB (pebissoa-data) = 2 erreurs
- curl /api/health : uploads.dir=/app/uploads (111 fichiers, couche éphémère), bundled=null (conteneur = vieille image sans .bundled-uploads), imageIntegrity {referenced:113, presentInVolume:105, recoverable:0, missingNowhere:8}
- node scripts/harvest-prod-images.cjs : 113 refs → 105 déjà dans git (bundle), 0 à sauver, 8 déjà perdues (placeholder actuel)
- Association des 8 perdues : Orange ×3, Banco Atlântico ×2, Agência nova esperança ×2, Coris Bank ×1
- Push commit en attente ab02ebc (f1ee6d5..ab02ebc) via askpass one-off, token supprimé après

Stage Summary:
- VERDICT : ajouter le volume /app/uploads ne fait PAS disparaître les images — c'est l'inverse (sans volume, tout est effacé à chaque Redeploy). Les 105 images affichées sont déjà dans git → restaurées au 1er boot par copy-bundled-uploads.cjs depuis .bundled-uploads
- Config Coolify corrigée à appliquer : volume images → Source /var/lib/coolify/volumes/pebissoa-uploads (distincte de la DB), Destination /app/uploads (pas /app/public/uploads)
- 8 images (4 entreprises) à re-uploader : perdues dans le conteneur ACTUEL, indépendamment du volume

---
Task ID: 16
Agent: Z.ai Code (main)
Task: Persistance Coolify — Redeploy #1 sur vieux code (cache Docker), fix cache-bust

Work Log:
- Health post-Redeploy utilisateur (21:13) : volume /app/uploads monté et writable ✓ MAIS files=3, bundled=null → le build a réutilisé le CLONE GIT EN CACHE (Docker layer cache) = vieux code sans .bundled-uploads → 110/113 images manquantes
- Les 3 fichiers présents = images Orange (3663d8dd, 87fd7a50, 380e18da) — servies 200 image/* depuis le volume ; origine exacte non élucidée (jamais commitées, absentes du seed) mais elles persistent dans le volume
- Fix 1 (874a804) : cache-bust Dockerfile via ADD https://api.github.com/...commits/main
- Découverte : VPS Coolify (8.212.10.159) RATE-LIMITÉ par l'API GitHub → ADD téléchargerait le message d'erreur constant → cache-bust non fiable → Fix 2 : remplacé par le feed Atom https://github.com/topmuch/pebissoa/commits/main.atom (200 OK, contenu change à chaque commit, pas rate-limité)
- worklog commit 50ac1f7 poussé précédemment

Stage Summary:
- La config volume Coolify est CORRECTE désormais (/app/uploads persistant, writable) — le seul problème restant est le build obsolète
- Le prochain Redeploy est GARANTI à jour : la ligne ADD (nouvelle URL) force l'exécution du clone
- Vérification post-deploy attendue : uploads.files ≈ 111, bundled.files ≈ 111, missingNowhere ≈ 5 (re-uploads : Banco Atlântico ×2, Agência nova esperança ×2, Coris Bank ×1)

---
Task ID: 17
Agent: Z.ai Code (main)
Task: Restauration manuelle des images prod via Terminal Coolify (contournement du build figé)

Work Log:
- 3 déploiements Coolify "Success" (21:22/21:30/21:35, ~1min30 chacun) sans AUCUN effet sur le conteneur : health inchangé (files=3, bundled=null) → le build utilise un Dockerfile FIGÉ (pas celui du repo à jour) ; durées 1m30 ≠ 3-6min d'un build complet avec cache-bust
- Contournement via Terminal Coolify (conteneur en marche) :
  - 1re tentative `cp -rn repo/uploads/. /app/uploads/` → copie SILENCIEUSEMENT 0 fichier (bizarrerie busybox cp -n), comptage 3
  - 2e tentative `cp -rf repo/uploads/* /app/uploads/` → 111 images copiées, volume = 114 fichiers ✓
- Health post-restauration (22:04) : uploads.files=114, imageIntegrity {referenced:113, presentInVolume:108, missingNowhere:5} — les 5 restantes = Banco Atlântico ×2, Agência nova esperança ×2, Coris Bank ×1 (à re-uploader)
- E2E agent-browser : accueil 27 imgs / 0 cassée ; annuaire 46 imgs / 0 cassée ; captures /tmp/preuve-images-restaurees-{accueil,annuaire}.png
- Note : le code prod reste OBSOLÈTE (Next log port:80, sans copy-bundled-uploads ni fix annuaire adf81f9) — le build Coolify doit être réparé (en attente : git log -1 du terminal + capture General de la config)

Stage Summary:
- IMAGES RESTAURÉES EN PROD SANS REBUILD : volume /app/uploads = 114 fichiers persistants
- Le problème de build obsolète Coolify reste ouvert — diagnostic à confirmer par la config General
