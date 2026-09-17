// Contenu légal trilingue (FR / PT / EN) des documents :
// - mentions-legales            → Mentions légales / Aviso legal / Legal notice
// - politique-confidentialite   → Politique de confidentialité / Política de privacidade / Privacy policy
// - cgu                         → Conditions générales d'utilisation / Termos e condições / Terms of use
//
// Structure : chaque document est découpé en sections (ancres pour le sommaire),
// chaque section contient des blocs de type paragraphe ('p'), liste ('list') ou
// encadré ('note').

import type { Locale } from './i18n';

export type LegalDocId = 'mentions-legales' | 'politique-confidentialite' | 'cgu';

export interface LegalBlock {
  type: 'p' | 'list' | 'note';
  text?: string;
  items?: string[];
}

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  id: LegalDocId;
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
}

/* ============================== FRANÇAIS ============================== */

const fr: Record<LegalDocId, LegalDoc> = {
  'mentions-legales': {
    id: 'mentions-legales',
    title: 'Mentions légales',
    subtitle: 'Informations légales relatives à l\'éditeur du site Pebiss et aux conditions d\'utilisation de la plateforme.',
    updatedAt: '9 septembre 2026',
    sections: [
      {
        id: 'editeur',
        title: 'Éditeur du site',
        blocks: [
          { type: 'p', text: 'Le site Pebiss (ci-après « la Plateforme »), accessible à l\'adresse pebiss.com ainsi qu\'à ses sous-domaines, est édité par :' },
          { type: 'list', items: [
            'Dénomination : Pebiss',
            'Siège social : Pluba – Curva de Djon Cubala, Bissau, Guinée-Bissau',
            'Téléphone : +245 956 00 7371',
            'E-mail : contact@pebiss.com',
          ] },
          { type: 'note', text: 'Pebiss est le premier annuaire professionnel de Guinée-Bissau : il référence des entreprises, diffuse des annonces professionnelles et met en relation des particuliers et des professionnels.' },
        ],
      },
      {
        id: 'directeur',
        title: 'Directeur de la publication',
        blocks: [
          { type: 'p', text: 'La direction de la publication est assurée par la direction générale de Pebiss, joignable à l\'adresse contact@pebiss.com pour toute question relative aux contenus publiés sur la Plateforme.' },
        ],
      },
      {
        id: 'hebergement',
        title: 'Hébergement',
        blocks: [
          { type: 'p', text: 'La Plateforme est hébergée sur une infrastructure cloud sécurisée garantissant un accès continu au service 24 heures sur 24 et 7 jours sur 7, sous réserve des opérations de maintenance technique et des cas de force majeure.' },
          { type: 'p', text: 'Pour toute question relative à l\'hébergement, contactez-nous à l\'adresse contact@pebiss.com.' },
        ],
      },
      {
        id: 'propriete-intellectuelle',
        title: 'Propriété intellectuelle',
        blocks: [
          { type: 'p', text: 'L\'ensemble des éléments constituant la Plateforme — structure, textes, graphismes, logo, icônes, images, bases de données, logiciels et tout autre contenu — est la propriété exclusive de Pebiss ou de ses partenaires, et est protégé par le droit de la propriété intellectuelle applicable.' },
          { type: 'list', items: [
            'Toute reproduction, représentation, modification ou exploitation, totale ou partielle, du contenu sans autorisation écrite préalable est interdite.',
            'Les marques et logos cités sur la Plateforme appartiennent à leurs détenteurs respectifs.',
            'Les contenus des annonces et des fiches entreprises appartiennent à leurs auteurs (les professionnels inscrits), qui garantissent disposer des droits nécessaires.',
          ] },
        ],
      },
      {
        id: 'responsabilite',
        title: 'Responsabilité',
        blocks: [
          { type: 'p', text: 'Pebiss s\'efforce de fournir des informations aussi exactes et à jour que possible. Toutefois, Pebiss ne peut garantir l\'exactitude, la complétude ou l\'actualité des informations publiées par les professionnels inscrits sur la Plateforme.' },
          { type: 'p', text: 'Pebiss ne saurait être tenu responsable :' },
          { type: 'list', items: [
            'des contenus publiés par les utilisateurs (annonces, avis, photos, descriptions) ;',
            'des relations contractuelles conclues entre un utilisateur et un professionnel référencé ;',
            'd\'une indisponibilité temporaire du service liée à une maintenance ou à un cas de force majeure ;',
            'des dommages indirects résultant de l\'utilisation de la Plateforme.',
          ] },
          { type: 'p', text: 'Toute anomalie peut être signalée à contact@pebiss.com ; nous procéderons aux vérifications nécessaires dans les meilleurs délais.' },
        ],
      },
      {
        id: 'droit-applicable',
        title: 'Droit applicable et litiges',
        blocks: [
          { type: 'p', text: 'Les présentes mentions légales sont soumises au droit guinéo-bissau. En cas de litige relatif à l\'utilisation de la Plateforme, les tribunaux compétents de Bissau (Guinée-Bissau) seront seuls saisis, après tentative de résolution amiable.' },
          { type: 'p', text: 'Pour toute question juridique, écrivez-nous à contact@pebiss.com ou par téléphone au +245 956 00 7371.' },
        ],
      },
    ],
  },

  'politique-confidentialite': {
    id: 'politique-confidentialite',
    title: 'Politique de confidentialité',
    subtitle: 'Comment Pebiss collecte, utilise et protège vos données personnelles.',
    updatedAt: '9 septembre 2026',
    sections: [
      {
        id: 'preambule',
        title: 'Préambule et responsable du traitement',
        blocks: [
          { type: 'p', text: 'La présente politique décrit la manière dont Pebiss, en sa qualité de responsable du traitement, collecte et utilise les données personnelles des utilisateurs de la Plateforme, conformément à la réglementation applicable en matière de protection des données personnelles.' },
          { type: 'p', text: 'Responsable du traitement : Pebiss — Pluba – Curva de Djon Cubala, Bissau, Guinée-Bissau — contact@pebiss.com.' },
          { type: 'note', text: 'En créant un compte ou en utilisant la Plateforme, vous reconnaissez avoir lu et accepté la présente politique de confidentialité.' },
        ],
      },
      {
        id: 'donnees-collectees',
        title: 'Données collectées',
        blocks: [
          { type: 'p', text: 'Nous collectons uniquement les données nécessaires au fonctionnement du service :' },
          { type: 'list', items: [
            'Données de compte : nom, pseudonyme, adresse e-mail, numéro de téléphone, mot de passe (chiffré) ;',
            'Données professionnelles : nom de l\'entreprise, catégorie, adresse, horaires, description, photos et produits publiés ;',
            'Données d\'interaction : avis déposés, messages, recherches effectuées, favoris ;',
            'Données techniques : adresse IP, type d\'appareil, navigateur et journaux de connexion, à des fins de sécurité et de statistiques anonymisées.',
          ] },
        ],
      },
      {
        id: 'finalites',
        title: 'Finalités du traitement',
        blocks: [
          { type: 'p', text: 'Vos données sont utilisées exclusivement pour :' },
          { type: 'list', items: [
            'créer et gérer votre compte et vos annonces ;',
            'publier et mettre à jour les fiches entreprises et les avis ;',
            'vous permettre d\'être contacté par d\'autres utilisateurs ;',
            'améliorer le service, la sécurité et les performances de la Plateforme ;',
            'vous informer de fonctionnalités nouvelles ou d\'offres promotionnelles, avec votre accord préalable.',
          ] },
          { type: 'note', text: 'Nous ne vendons jamais vos données personnelles à des tiers.' },
        ],
      },
      {
        id: 'bases-legales',
        title: 'Bases légales',
        blocks: [
          { type: 'p', text: 'Les traitements décrits reposent sur les bases légales suivantes :' },
          { type: 'list', items: [
            'l\'exécution du contrat vous liant à Pebiss (gestion du compte et des annonces) ;',
            'votre consentement (communications commerciales, cookies non essentiels) ;',
            'l\'intérêt légitime de Pebiss (sécurité, amélioration du service, statistiques) ;',
            'le respect des obligations légales applicables.',
          ] },
        ],
      },
      {
        id: 'conservation',
        title: 'Durée de conservation',
        blocks: [
          { type: 'list', items: [
            'Données de compte : conservées pendant toute la durée de votre inscription, puis archivées 12 mois après la fermeture du compte ;',
            'Annonces et fiches : conservées jusqu\'à leur suppression par l\'auteur ou par Pebiss ;',
            'Avis : conservés tant que la fiche entreprise associée est en ligne, sauf demande de suppression ;',
            'Données techniques et journaux : conservés 12 mois maximum.',
          ] },
        ],
      },
      {
        id: 'destinataires',
        title: 'Destinataires des données',
        blocks: [
          { type: 'p', text: 'Vos données sont destinées à l\'équipe interne de Pebiss et, le cas échéant :' },
          { type: 'list', items: [
            'aux hébergeurs et prestataires techniques chargés de faire fonctionner la Plateforme ;',
            'aux autres utilisateurs, pour les informations que vous rendez publiques (fiche entreprise, annonces, avis) ;',
            'aux autorités compétentes, sur réquisition légale.',
          ] },
          { type: 'p', text: 'Ces destinataires s\'engagent à garantir un niveau de protection équivalent à celui décrit dans la présente politique.' },
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies et traceurs',
        blocks: [
          { type: 'p', text: 'La Plateforme utilise des cookies strictement nécessaires à son fonctionnement (session de connexion, langue préférée, sécurité) ainsi que, avec votre accord, des cookies de mesure d\'audience anonymisée.' },
          { type: 'list', items: [
            'Cookies essentiels : nécessaire au service — aucune action requise de votre part ;',
            'Cookies de mesure d\'audience : déposés uniquement après votre consentement, révocable à tout moment ;',
            'Vous pouvez configurer votre navigateur pour refuser ou supprimer les cookies, sans que cela ne bloque l\'accès aux fonctionnalités essentielles.',
          ] },
        ],
      },
      {
        id: 'securite',
        title: 'Sécurité des données',
        blocks: [
          { type: 'p', text: 'Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données : chiffrement des mots de passe, connexions sécurisées (HTTPS), restriction des accès, sauvegardes régulières et surveillance des tentatives d\'intrusion.' },
          { type: 'p', text: 'En cas de violation de données susceptible d\'engendrer un risque élevé pour vos droits, nous vous en informerons dans les meilleurs délais ainsi que les autorités compétentes.' },
        ],
      },
      {
        id: 'droits',
        title: 'Vos droits',
        blocks: [
          { type: 'p', text: 'Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données personnelles :' },
          { type: 'list', items: [
            'droit d\'accès : obtenir la confirmation et la copie des données vous concernant ;',
            'droit de rectification : faire corriger des données inexactes ou incomplètes ;',
            'droit à l\'effacement : demander la suppression de vos données et de votre compte ;',
            'droit d\'opposition et de limitation : vous opposer à certains traitements ;',
            'droit à la portabilité : recevoir vos données dans un format structuré.',
          ] },
          { type: 'note', text: 'Pour exercer vos droits, écrivez à contact@pebiss.com. Nous répondons à toute demande dans un délai maximum de 30 jours. Vous pouvez également introduire une réclamation auprès de l\'autorité de protection des données compétente.' },
        ],
      },
      {
        id: 'modifications',
        title: 'Contact et modifications',
        blocks: [
          { type: 'p', text: 'Toute question relative à la présente politique peut être adressée à : Pebiss — contact@pebiss.com — +245 956 00 7371 — Pluba – Curva de Djon Cubala, Bissau, Guinée-Bissau.' },
          { type: 'p', text: 'La présente politique peut être modifiée pour refléter les évolutions du service ou de la réglementation. La date de dernière mise à jour figure en tête du document ; les utilisateurs seront informés de toute modification substantielle via la Plateforme.' },
        ],
      },
    ],
  },

  'cgu': {
    id: 'cgu',
    title: 'Conditions générales d\'utilisation',
    subtitle: 'Les règles qui encadrent l\'utilisation de la plateforme Pebiss par les utilisateurs et les professionnels.',
    updatedAt: '9 septembre 2026',
    sections: [
      {
        id: 'objet',
        title: 'Objet et acceptation',
        blocks: [
          { type: 'p', text: 'Les présentes Conditions générales d\'utilisation (ci-après « CGU ») ont pour objet de définir les modalités d\'accès et d\'utilisation de la Plateforme Pebiss, disponible à l\'adresse pebiss.com, par tout utilisateur.' },
          { type: 'p', text: 'L\'inscription, la navigation sur la Plateforme ou la publication de tout contenu valent acceptation pleine et entière des présentes CGU. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.' },
        ],
      },
      {
        id: 'definitions',
        title: 'Définitions',
        blocks: [
          { type: 'list', items: [
            '« Plateforme » : le site Pebiss et l\'ensemble de ses fonctionnalités (annuaire, annonces, avis, espace professionnel) ;',
            '« Utilisateur » : toute personne accédant à la Plateforme ;',
            '« Professionnel » : utilisateur inscrit qui publie une fiche entreprise, des annonces ou des services ;',
            '« Contenu » : toute donnée publiée par un utilisateur (texte, photo, avis, annonce, commentaire) ;',
            '« Compte » : espace personnel créé lors de l\'inscription permettant d\'accéder aux fonctionnalités réservées.',
          ] },
        ],
      },
      {
        id: 'inscription',
        title: 'Accès au service et inscription',
        blocks: [
          { type: 'p', text: 'L\'accès à la consultation de l\'annuaire et des annonces est libre et gratuit. La création d\'un compte est requise pour publier une fiche, une annonce ou un avis.' },
          { type: 'list', items: [
            'L\'inscription est réservée aux personnes majeures et capables, ainsi qu\'aux professionnels dûment autorisés à exercer leur activité ;',
            'Les informations fournies lors de l\'inscription doivent être exactes et à jour ;',
            'Chaque utilisateur est responsable de la confidentialité de ses identifiants et de l\'activité réalisée depuis son compte ;',
            'Un seul compte par personne ou par entreprise est autorisé, sauf accord préalable de Pebiss.',
          ] },
        ],
      },
      {
        id: 'role-pebiss',
        title: 'Rôle de Pebiss',
        blocks: [
          { type: 'p', text: 'Pebiss est un annuaire professionnel et une plateforme de mise en relation. Elle permet aux professionnels de se faire connaître et aux utilisateurs de les trouver, de les contacter et de leur laisser des avis.' },
          { type: 'note', text: 'Pebiss n\'est ni partie prenante ni intermédiaire dans les relations contractuelles entre utilisateurs et professionnels. Les ventes, prestations, paiements et livraisons relèvent de la seule responsabilité des parties concernées.' },
        ],
      },
      {
        id: 'annonces',
        title: 'Publication d\'annonces',
        blocks: [
          { type: 'p', text: 'Tout professionnel peut publier des annonces décrivant ses produits ou services, dans le respect des règles suivantes :' },
          { type: 'list', items: [
            'L\'annonce doit être sincère, exacte et décrire un produit ou service réellement proposé ;',
            'Elle doit être publiée dans la catégorie la plus appropriée ;',
            'Les photos doivent être authentiques et libres de droits ;',
            'Un même bien ou service ne doit pas être publié plusieurs fois en doublon ;',
            'Les annonces obsolètes doivent être mises à jour ou retirées.',
          ] },
          { type: 'p', text: 'Sont strictement interdits les contenus : illicites, frauduleux, trompeurs, discriminatoires, diffamatoires, violents, à caractère sexuel, contraires à l\'ordre public ou aux bonnes mœurs, ou portant atteinte aux droits de tiers (propriété intellectuelle, image, vie privée).' },
        ],
      },
      {
        id: 'avis',
        title: 'Avis clients',
        blocks: [
          { type: 'p', text: 'Les utilisateurs peuvent déposer des avis sur les entreprises référencées afin d\'aider la communauté à choisir. Chaque avis doit refléter une expérience réelle et sincère.' },
          { type: 'list', items: [
            'Les avis injurieux, calomnieux, hors sujet ou publiés contre rémunération seront supprimés ;',
            'Les professionnels ne peuvent pas publier d\'avis sur leur propre entreprise ;',
            'Un professionnel peut répondre publiquement à un avis ;',
            'Pebiss se réserve le droit de modérer ou de supprimer tout avis non conforme.',
          ] },
        ],
      },
      {
        id: 'services-payants',
        title: 'Services payants et publicité',
        blocks: [
          { type: 'p', text: 'Certaines fonctionnalités sont proposées gratuitement. Pebiss peut également proposer des services payants (mise en avant d\'annonces, espaces publicitaires, offres premium) dont les conditions tarifaires sont précisées au moment de la souscription.' },
          { type: 'list', items: [
            'Les tarifs sont exprimés dans la devise indiquée lors de la commande et peuvent évoluer après information préalable des clients concernés ;',
            'Tout espace publicitaire est accordé sous réserve de conformité du contenu avec les présentes CGU ;',
            'Les paiements sont sécurisés ; les conditions de remboursement éventuelles sont précisées dans l\'offre souscrite.',
          ] },
        ],
      },
      {
        id: 'obligations',
        title: 'Obligations des utilisateurs',
        blocks: [
          { type: 'p', text: 'En utilisant la Plateforme, chaque utilisateur s\'engage à :' },
          { type: 'list', items: [
            'respecter les lois et règlements applicables ainsi que les droits des tiers ;',
            'fournir des informations exactes et ne pas usurper l\'identité d\'autrui ;',
            'ne pas tenter d\'accéder frauduleusement aux systèmes d\'information de la Plateforme ;',
            'ne pas utiliser de robots, scrapeurs ou outils automatisés susceptibles de nuire au service ;',
            'ne pas collecter les données d\'autres utilisateurs à des fins commerciales non autorisées.',
          ] },
        ],
      },
      {
        id: 'responsabilite',
        title: 'Responsabilité',
        blocks: [
          { type: 'p', text: 'Pebiss met en œuvre les moyens raisonnables pour assurer un accès continu et de qualité à la Plateforme, sans obligation de résultat absolue.' },
          { type: 'p', text: 'Pebiss ne saurait être tenue responsable :' },
          { type: 'list', items: [
            'des Contenus publiés par les utilisateurs, dont elle n\'est pas l\'auteur ;',
            'des transactions conclues entre utilisateurs et professionnels ;',
            'des interruptions de service liées à la maintenance, à des pannes ou à des cas de force majeure ;',
            'des dommages indirects (perte de chiffre d\'affaires, de données ou d\'opportunités) liés à l\'utilisation de la Plateforme.',
          ] },
        ],
      },
      {
        id: 'suspension',
        title: 'Suspension et résiliation',
        blocks: [
          { type: 'p', text: 'Pebiss peut, à tout moment, modérer, supprimer ou suspendre tout Contenu ou Compte qui ne respecterait pas les présentes CGU, sans préjudice des dommages-intérêts qui pourraient être réclamés.' },
          { type: 'list', items: [
            'Suspension provisoire en cas de manquement susceptible d\'être régularisé, après notification ;',
            'Suppression définitive du Compte en cas de manquement grave ou répété, notamment pour fraude, contenus illicites ou activité concurrente illicite ;',
            'Résiliation à tout moment par l\'utilisateur : la suppression du compte peut être demandée depuis les paramètres du Compte ou par e-mail.',
          ] },
        ],
      },
      {
        id: 'propriete-intellectuelle',
        title: 'Propriété intellectuelle',
        blocks: [
          { type: 'p', text: 'La structure générale de la Plateforme ainsi que les textes, graphismes, logos, icônes et bases de données qui la composent sont la propriété de Pebiss et protégés par le droit de la propriété intellectuelle.' },
          { type: 'p', text: 'L\'Utilisateur conserve la propriété des Contenus qu\'il publie. Il concède toutefois à Pebiss une licence non exclusive, gratuite, mondiale et transférable d\'hébergement, de reproduction et de représentation de ces Contenus, strictement nécessaire à leur diffusion sur la Plateforme, pendant toute la durée de leur publication.' },
        ],
      },
      {
        id: 'modifications-droit',
        title: 'Modification des CGU et droit applicable',
        blocks: [
          { type: 'p', text: 'Pebiss peut modifier les présentes CGU à tout moment. Les nouvelles CGU entrent en vigueur à leur publication sur la Plateforme ; la poursuite de l\'utilisation du service après publication vaut acceptation.' },
          { type: 'p', text: 'Les présentes CGU sont régies par le droit guinéo-bissau. Tout litige relatif à leur interprétation ou exécution sera soumis à une tentative de résolution amiable ; à défaut, les tribunaux de Bissau (Guinée-Bissau) seront compétents.' },
          { type: 'note', text: 'Questions et contact : contact@pebiss.com — +245 956 00 7371 — Pluba – Curva de Djon Cubala, Bissau, Guinée-Bissau.' },
        ],
      },
    ],
  },
};

/* ============================== PORTUGAIS ============================== */

const pt: Record<LegalDocId, LegalDoc> = {
  'mentions-legales': {
    id: 'mentions-legales',
    title: 'Aviso legal',
    subtitle: 'Informação legal sobre o editor do site Pebiss e as condições de utilização da plataforma.',
    updatedAt: '9 de setembro de 2026',
    sections: [
      {
        id: 'editeur',
        title: 'Editor do site',
        blocks: [
          { type: 'p', text: 'O site Pebiss (a seguir, « a Plataforma »), acessível no endereço pebiss.com e nos seus subdomínios, é editado por:' },
          { type: 'list', items: [
            'Denominação: Pebiss',
            'Sede social: Pluba – Curva de Djon Cubala, Bissau, Guiné-Bissau',
            'Telefone: +245 956 00 7371',
            'E-mail: contact@pebiss.com',
          ] },
          { type: 'note', text: 'A Pebiss é o primeiro diretório profissional da Guiné-Bissau: referencia empresas, difunde anúncios profissionais e põe em contacto particulares e profissionais.' },
        ],
      },
      {
        id: 'directeur',
        title: 'Diretor da publicação',
        blocks: [
          { type: 'p', text: 'A direção da publicação é assegurada pela direção-geral da Pebiss, contactável em contact@pebiss.com para qualquer questão relativa aos conteúdos publicados na Plataforma.' },
        ],
      },
      {
        id: 'hebergement',
        title: 'Alojamento',
        blocks: [
          { type: 'p', text: 'A Plataforma é alojada numa infraestrutura cloud segura que garante um acesso contínuo ao serviço 24 horas por dia, 7 dias por semana, salvo operações de manutenção técnica e casos de força maior.' },
          { type: 'p', text: 'Para qualquer questão relacionada com o alojamento, contacte-nos em contact@pebiss.com.' },
        ],
      },
      {
        id: 'propriete-intellectuelle',
        title: 'Propriedade intelectual',
        blocks: [
          { type: 'p', text: 'O conjunto dos elementos que constituem a Plataforma — estrutura, textos, gráficos, logótipo, ícones, imagens, bases de dados, software e qualquer outro conteúdo — é propriedade exclusiva da Pebiss ou dos seus parceiros, estando protegido pelo direito da propriedade intelectual aplicável.' },
          { type: 'list', items: [
            'É proibida qualquer reprodução, representação, modificação ou exploração, total ou parcial, do conteúdo sem autorização escrita prévia.',
            'As marcas e logótipos citados na Plataforma pertencem aos seus respetivos titulares.',
            'Os conteúdos dos anúncios e das fichas de empresas pertencem aos seus autores (os profissionais registados), que garantem dispor dos direitos necessários.',
          ] },
        ],
      },
      {
        id: 'responsabilite',
        title: 'Responsabilidade',
        blocks: [
          { type: 'p', text: 'A Pebiss esforça-se por fornecer informações tão exatas e atualizadas quanto possível. No entanto, a Pebiss não pode garantir a exatidão, a integridade ou a atualidade das informações publicadas pelos profissionais registados na Plataforma.' },
          { type: 'p', text: 'A Pebiss não pode ser responsabilizada por:' },
          { type: 'list', items: [
            'os conteúdos publicados pelos utilizadores (anúncios, avaliações, fotos, descrições);',
            'as relações contratuais celebradas entre um utilizador e um profissional referenciado;',
            'uma indisponibilidade temporária do serviço devida a manutenção ou a caso de força maior;',
            'danos indiretos resultantes da utilização da Plataforma.',
          ] },
          { type: 'p', text: 'Qualquer anomalia pode ser comunicada a contact@pebiss.com; procederemos às verificações necessárias o mais rapidamente possível.' },
        ],
      },
      {
        id: 'droit-applicable',
        title: 'Direito aplicável e litígios',
        blocks: [
          { type: 'p', text: 'O presente aviso legal é regido pelo direito guineense. Em caso de litígio relativo à utilização da Plataforma, apenas os tribunais competentes de Bissau (Guiné-Bissau) serão acionados, após tentativa de resolução amigável.' },
          { type: 'p', text: 'Para qualquer questão jurídica, escreva-nos para contact@pebiss.com ou ligue para +245 956 00 7371.' },
        ],
      },
    ],
  },

  'politique-confidentialite': {
    id: 'politique-confidentialite',
    title: 'Política de privacidade',
    subtitle: 'Como a Pebiss recolhe, utiliza e protege os seus dados pessoais.',
    updatedAt: '9 de setembro de 2026',
    sections: [
      {
        id: 'preambule',
        title: 'Preâmbulo e responsável pelo tratamento',
        blocks: [
          { type: 'p', text: 'A presente política descreve a forma como a Pebiss, na qualidade de responsável pelo tratamento, recolhe e utiliza os dados pessoais dos utilizadores da Plataforma, em conformidade com a regulamentação aplicável em matéria de proteção de dados pessoais.' },
          { type: 'p', text: 'Responsável pelo tratamento: Pebiss — Pluba – Curva de Djon Cubala, Bissau, Guiné-Bissau — contact@pebiss.com.' },
          { type: 'note', text: 'Ao criar uma conta ou ao utilizar a Plataforma, reconhece ter lido e aceitado a presente política de privacidade.' },
        ],
      },
      {
        id: 'donnees-collectees',
        title: 'Dados recolhidos',
        blocks: [
          { type: 'p', text: 'Recolhemos apenas os dados necessários ao funcionamento do serviço:' },
          { type: 'list', items: [
            'Dados da conta: nome, pseudónimo, endereço de e-mail, número de telefone, palavra-passe (encriptada);',
            'Dados profissionais: nome da empresa, categoria, endereço, horários, descrição, fotos e produtos publicados;',
            'Dados de interação: avaliações publicadas, mensagens, pesquisas efetuadas, favoritos;',
            'Dados técnicos: endereço IP, tipo de dispositivo, navegador e registos de ligação, para fins de segurança e de estatísticas anonimizadas.',
          ] },
        ],
      },
      {
        id: 'finalites',
        title: 'Finalidades do tratamento',
        blocks: [
          { type: 'p', text: 'Os seus dados são utilizados exclusivamente para:' },
          { type: 'list', items: [
            'criar e gerir a sua conta e os seus anúncios;',
            'publicar e atualizar as fichas de empresas e as avaliações;',
            'permitir que seja contactado por outros utilizadores;',
            'melhorar o serviço, a segurança e o desempenho da Plataforma;',
            'informá-lo de novas funcionalidades ou ofertas promocionais, com o seu acordo prévio.',
          ] },
          { type: 'note', text: 'Nunca vendemos os seus dados pessoais a terceiros.' },
        ],
      },
      {
        id: 'bases-legales',
        title: 'Bases legais',
        blocks: [
          { type: 'p', text: 'Os tratamentos descritos assentam nas seguintes bases legais:' },
          { type: 'list', items: [
            'a execução do contrato que o vincula à Pebiss (gestão da conta e dos anúncios);',
            'o seu consentimento (comunicações comerciais, cookies não essenciais);',
            'o interesse legítimo da Pebiss (segurança, melhoria do serviço, estatísticas);',
            'o cumprimento das obrigações legais aplicáveis.',
          ] },
        ],
      },
      {
        id: 'conservation',
        title: 'Prazo de conservação',
        blocks: [
          { type: 'list', items: [
            'Dados da conta: conservados durante todo o período do seu registo e, depois, arquivados 12 meses após o encerramento da conta;',
            'Anúncios e fichas: conservados até à sua eliminação pelo autor ou pela Pebiss;',
            'Avaliações: conservadas enquanto a ficha da empresa associada estiver online, salvo pedido de eliminação;',
            'Dados técnicos e registos: conservados por um máximo de 12 meses.',
          ] },
        ],
      },
      {
        id: 'destinataires',
        title: 'Destinatários dos dados',
        blocks: [
          { type: 'p', text: 'Os seus dados destinam-se à equipa interna da Pebiss e, se aplicável:' },
          { type: 'list', items: [
            'aos alojadores e prestadores técnicos encarregados de fazer funcionar a Plataforma;',
            'aos outros utilizadores, para as informações que torna públicas (ficha da empresa, anúncios, avaliações);',
            'às autoridades competentes, mediante requisição legal.',
          ] },
          { type: 'p', text: 'Estes destinatários comprometem-se a garantir um nível de proteção equivalente ao descrito na presente política.' },
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies e marcadores',
        blocks: [
          { type: 'p', text: 'A Plataforma utiliza cookies estritamente necessários ao seu funcionamento (sessão de início de sessão, língua preferida, segurança) bem como, com o seu acordo, cookies de medição de audiência anonimizada.' },
          { type: 'list', items: [
            'Cookies essenciais: necessários ao serviço — não é necessária qualquer ação da sua parte;',
            'Cookies de medição de audiência: instalados apenas após o seu consentimento, revogável em qualquer altura;',
            'Pode configurar o seu navegador para recusar ou eliminar os cookies, sem que isso bloqueie o acesso às funcionalidades essenciais.',
          ] },
        ],
      },
      {
        id: 'securite',
        title: 'Segurança dos dados',
        blocks: [
          { type: 'p', text: 'Implementamos medidas técnicas e organizacionais adequadas para proteger os seus dados: encriptação das palavras-passe, ligações seguras (HTTPS), restrição dos acessos, cópias de segurança regulares e vigilância das tentativas de intrusão.' },
          { type: 'p', text: 'Em caso de violação de dados suscetível de gerar um risco elevado para os seus direitos, informá-lo-emos com a maior brevidade, bem como as autoridades competentes.' },
        ],
      },
      {
        id: 'droits',
        title: 'Os seus direitos',
        blocks: [
          { type: 'p', text: 'Em conformidade com a regulamentação aplicável, dispõe dos seguintes direitos sobre os seus dados pessoais:' },
          { type: 'list', items: [
            'direito de acesso: obter a confirmação e a cópia dos dados que lhe dizem respeito;',
            'direito de retificação: fazer corrigir dados inexatos ou incompletos;',
            'direito ao apagamento: pedir a eliminação dos seus dados e da sua conta;',
            'direito de oposição e de limitação: opor-se a determinados tratamentos;',
            'direito à portabilidade: receber os seus dados num formato estruturado.',
          ] },
          { type: 'note', text: 'Para exercer os seus direitos, escreva para contact@pebiss.com. Respondemos a qualquer pedido num prazo máximo de 30 dias. Também pode apresentar uma reclamação junto da autoridade de proteção de dados competente.' },
        ],
      },
      {
        id: 'modifications',
        title: 'Contacto e modificações',
        blocks: [
          { type: 'p', text: 'Qualquer questão relativa à presente política pode ser enviada para: Pebiss — contact@pebiss.com — +245 956 00 7371 — Pluba – Curva de Djon Cubala, Bissau, Guiné-Bissau.' },
          { type: 'p', text: 'A presente política pode ser modificada para refletir a evolução do serviço ou da regulamentação. A data da última atualização figura no topo do documento; os utilizadores serão informados de qualquer alteração substancial através da Plataforma.' },
        ],
      },
    ],
  },

  'cgu': {
    id: 'cgu',
    title: 'Termos e condições de utilização',
    subtitle: 'As regras que regem a utilização da plataforma Pebiss pelos utilizadores e pelos profissionais.',
    updatedAt: '9 de setembro de 2026',
    sections: [
      {
        id: 'objet',
        title: 'Objeto e aceitação',
        blocks: [
          { type: 'p', text: 'As presentes Condições Gerais de Utilização (a seguir, « CGU ») têm por objeto definir as modalidades de acesso e de utilização da Plataforma Pebiss, disponível no endereço pebiss.com, por qualquer utilizador.' },
          { type: 'p', text: 'O registo, a navegação na Plataforma ou a publicação de qualquer conteúdo valem aceitação plena e integral das presentes CGU. Se não aceitar estas condições, por favor não utilize a Plataforma.' },
        ],
      },
      {
        id: 'definitions',
        title: 'Definições',
        blocks: [
          { type: 'list', items: [
            '« Plataforma »: o site Pebiss e o conjunto das suas funcionalidades (diretório, anúncios, avaliações, espaço profissional);',
            '« Utilizador »: qualquer pessoa que aceda à Plataforma;',
            '« Profissional »: utilizador registado que publica uma ficha de empresa, anúncios ou serviços;',
            '« Conteúdo »: qualquer dado publicado por um utilizador (texto, foto, avaliação, anúncio, comentário);',
            '« Conta »: espaço pessoal criado no momento do registo que permite aceder às funcionalidades reservadas.',
          ] },
        ],
      },
      {
        id: 'inscription',
        title: 'Acesso ao serviço e registo',
        blocks: [
          { type: 'p', text: 'O acesso à consulta do diretório e dos anúncios é livre e gratuito. A criação de uma conta é exigida para publicar uma ficha, um anúncio ou uma avaliação.' },
          { type: 'list', items: [
            'O registo é reservado a pessoas maiores e capazes, bem como a profissionais devidamente autorizados a exercer a sua atividade;',
            'As informações fornecidas no momento do registo devem ser exatas e estar atualizadas;',
            'Cada utilizador é responsável pela confidencialidade das suas credenciais e pela atividade efetuada a partir da sua conta;',
            'É autorizada apenas uma conta por pessoa ou por empresa, salvo acordo prévio da Pebiss.',
          ] },
        ],
      },
      {
        id: 'role-pebiss',
        title: 'Papel da Pebiss',
        blocks: [
          { type: 'p', text: 'A Pebiss é um diretório profissional e uma plataforma de intermediação de contactos. Permite aos profissionais dar-se a conhecer e aos utilizadores encontrá-los, contactá-los e deixar avaliações.' },
          { type: 'note', text: 'A Pebiss não é parte nem intermediária nas relações contratuais entre utilizadores e profissionais. As vendas, prestações, pagamentos e entregas são da exclusiva responsabilidade das partes envolvidas.' },
        ],
      },
      {
        id: 'annonces',
        title: 'Publicação de anúncios',
        blocks: [
          { type: 'p', text: 'Todo o profissional pode publicar anúncios que descrevam os seus produtos ou serviços, no respeito das seguintes regras:' },
          { type: 'list', items: [
            'O anúncio deve ser sincero, exato e descrever um produto ou serviço realmente oferecido;',
            'Deve ser publicado na categoria mais adequada;',
            'As fotos devem ser autênticas e isentas de direitos;',
            'O mesmo bem ou serviço não deve ser publicado várias vezes em duplicado;',
            'Os anúncios desatualizados devem ser atualizados ou retirados.',
          ] },
          { type: 'p', text: 'São estritamente proibidos os conteúdos: ilícitos, fraudulentos, enganosos, discriminatórios, difamatórios, violentos, de natureza sexual, contrários à ordem pública ou aos bons costumes, ou que atinjam os direitos de terceiros (propriedade intelectual, imagem, vida privada).' },
        ],
      },
      {
        id: 'avis',
        title: 'Avaliações de clientes',
        blocks: [
          { type: 'p', text: 'Os utilizadores podem publicar avaliações sobre as empresas referenciadas para ajudar a comunidade a escolher. Cada avaliação deve refletir uma experiência real e sincera.' },
          { type: 'list', items: [
            'As avaliações injuriosas, caluniosas, fora de contexto ou publicadas mediante remuneração serão eliminadas;',
            'Os profissionais não podem publicar avaliações sobre a sua própria empresa;',
            'Um profissional pode responder publicamente a uma avaliação;',
            'A Pebiss reserva-se o direito de moderar ou eliminar qualquer avaliação não conforme.',
          ] },
        ],
      },
      {
        id: 'services-payants',
        title: 'Serviços pagos e publicidade',
        blocks: [
          { type: 'p', text: 'Algumas funcionalidades são oferecidas gratuitamente. A Pebiss pode igualmente propor serviços pagos (destaque de anúncios, espaços publicitários, ofertas premium), cujas condições tarifárias são indicadas no momento da subscrição.' },
          { type: 'list', items: [
            'As tarifas são expressas na moeda indicada no momento da encomenda e podem evoluir após informação prévia dos clientes concernedes;',
            'Todo o espaço publicitário é concedido sob reserva de conformidade do conteúdo com as presentes CGU;',
            'Os pagamentos são seguros; as eventuais condições de reembolso são indicadas na oferta subscrita.',
          ] },
        ],
      },
      {
        id: 'obligations',
        title: 'Obrigações dos utilizadores',
        blocks: [
          { type: 'p', text: 'Ao utilizar a Plataforma, cada utilizador compromete-se a:' },
          { type: 'list', items: [
            'respeitar as leis e os regulamentos aplicáveis, bem como os direitos de terceiros;',
            'fornecer informações exatas e não usurpar a identidade de outrem;',
            'não tentar aceder fraudulentamente aos sistemas informáticos da Plataforma;',
            'não utilizar robots, extractores ou ferramentas automatizadas suscetíveis de prejudicar o serviço;',
            'não recolher os dados de outros utilizadores para fins comerciais não autorizados.',
          ] },
        ],
      },
      {
        id: 'responsabilite',
        title: 'Responsabilidade',
        blocks: [
          { type: 'p', text: 'A Pebiss implementa os meios razoáveis para assegurar um acesso contínuo e de qualidade à Plataforma, sem obrigação de resultado absoluta.' },
          { type: 'p', text: 'A Pebiss não pode ser responsabilizada por:' },
          { type: 'list', items: [
            'os Conteúdos publicados pelos utilizadores, dos quais não é autora;',
            'as transações celebradas entre utilizadores e profissionais;',
            'as interrupções do serviço devidas a manutenção, avarias ou casos de força maior;',
            'os danos indiretos (perda de volume de negócios, de dados ou de oportunidades) ligados à utilização da Plataforma.',
          ] },
        ],
      },
      {
        id: 'suspension',
        title: 'Suspensão e rescisão',
        blocks: [
          { type: 'p', text: 'A Pebiss pode, em qualquer momento, moderar, eliminar ou suspender qualquer Conteúdo ou Conta que não respeite as presentes CGU, sem prejuízo dos danos e juros que possam ser reclamados.' },
          { type: 'list', items: [
            'Suspensão provisória em caso de incumprimento suscetível de ser regularizado, após notificação;',
            'Eliminação definitiva da Conta em caso de incumprimento grave ou repetido, nomeadamente por fraude, conteúdos ilícitos ou atividade concorrencial ilícita;',
            'Rescisão a qualquer momento pelo utilizador: a eliminação da conta pode ser pedida nas definições da Conta ou por e-mail.',
          ] },
        ],
      },
      {
        id: 'propriete-intellectuelle',
        title: 'Propriedade intelectual',
        blocks: [
          { type: 'p', text: 'A estrutura geral da Plataforma, bem como os textos, gráficos, logótipos, ícones e bases de dados que a compõem, são propriedade da Pebiss e estão protegidos pelo direito da propriedade intelectual.' },
          { type: 'p', text: 'O Utilizador mantém a propriedade dos Conteúdos que publica. No entanto, concede à Pebiss uma licença não exclusiva, gratuita, mundial e transferível de alojamento, reprodução e representação desses Conteúdos, estritamente necessária à sua difusão na Plataforma, durante todo o período da sua publicação.' },
        ],
      },
      {
        id: 'modifications-droit',
        title: 'Modificação das CGU e direito aplicável',
        blocks: [
          { type: 'p', text: 'A Pebiss pode modificar as presentes CGU em qualquer momento. As novas CGU entram em vigor na sua publicação na Plataforma; a continuação da utilização do serviço após a publicação vale aceitação.' },
          { type: 'p', text: 'As presentes CGU são regidas pelo direito guineense. Qualquer litígio relativo à sua interpretação ou execução será submetido a uma tentativa de resolução amigável; em caso de falência, os tribunais de Bissau (Guiné-Bissau) serão competentes.' },
          { type: 'note', text: 'Questões e contacto: contact@pebiss.com — +245 956 00 7371 — Pluba – Curva de Djon Cubala, Bissau, Guiné-Bissau.' },
        ],
      },
    ],
  },
};

/* ============================== ANGLAIS ============================== */

const en: Record<LegalDocId, LegalDoc> = {
  'mentions-legales': {
    id: 'mentions-legales',
    title: 'Legal notice',
    subtitle: 'Legal information about the publisher of the Pebiss website and the conditions for using the platform.',
    updatedAt: 'September 9, 2026',
    sections: [
      {
        id: 'editeur',
        title: 'Website publisher',
        blocks: [
          { type: 'p', text: 'The Pebiss website (hereinafter "the Platform"), accessible at pebiss.com and its subdomains, is published by:' },
          { type: 'list', items: [
            'Company name: Pebiss',
            'Registered office: Pluba – Curva de Djon Cubala, Bissau, Guinea-Bissau',
            'Phone: +245 956 00 7371',
            'Email: contact@pebiss.com',
          ] },
          { type: 'note', text: 'Pebiss is the leading professional directory in Guinea-Bissau: it lists businesses, publishes professional ads and connects individuals with professionals.' },
        ],
      },
      {
        id: 'directeur',
        title: 'Publication director',
        blocks: [
          { type: 'p', text: 'Publication direction is provided by Pebiss general management, reachable at contact@pebiss.com for any question regarding content published on the Platform.' },
        ],
      },
      {
        id: 'hebergement',
        title: 'Hosting',
        blocks: [
          { type: 'p', text: 'The Platform is hosted on a secure cloud infrastructure providing continuous access to the service 24 hours a day, 7 days a week, subject to technical maintenance operations and cases of force majeure.' },
          { type: 'p', text: 'For any question regarding hosting, contact us at contact@pebiss.com.' },
        ],
      },
      {
        id: 'propriete-intellectuelle',
        title: 'Intellectual property',
        blocks: [
          { type: 'p', text: 'All the elements composing the Platform — structure, texts, graphics, logo, icons, images, databases, software and any other content — are the exclusive property of Pebiss or its partners and are protected by applicable intellectual property law.' },
          { type: 'list', items: [
            'Any reproduction, representation, modification or exploitation, in whole or in part, of the content without prior written authorization is prohibited.',
            'The trademarks and logos mentioned on the Platform belong to their respective owners.',
            'The content of ads and business listings belongs to their authors (the registered professionals), who warrant that they hold the necessary rights.',
          ] },
        ],
      },
      {
        id: 'responsabilite',
        title: 'Liability',
        blocks: [
          { type: 'p', text: 'Pebiss strives to provide information that is as accurate and up to date as possible. However, Pebiss cannot guarantee the accuracy, completeness or timeliness of information published by registered professionals on the Platform.' },
          { type: 'p', text: 'Pebiss cannot be held liable for:' },
          { type: 'list', items: [
            'content published by users (ads, reviews, photos, descriptions);',
            'contractual relationships entered into between a user and a listed professional;',
            'temporary unavailability of the service due to maintenance or force majeure;',
            'indirect damages resulting from the use of the Platform.',
          ] },
          { type: 'p', text: 'Any anomaly can be reported to contact@pebiss.com; we will carry out the necessary checks as soon as possible.' },
        ],
      },
      {
        id: 'droit-applicable',
        title: 'Governing law and disputes',
        blocks: [
          { type: 'p', text: 'This legal notice is governed by Guinean (Guinea-Bissau) law. In the event of a dispute relating to the use of the Platform, only the competent courts of Bissau (Guinea-Bissau) shall have jurisdiction, after an attempt at amicable resolution.' },
          { type: 'p', text: 'For any legal question, write to us at contact@pebiss.com or call +245 956 00 7371.' },
        ],
      },
    ],
  },

  'politique-confidentialite': {
    id: 'politique-confidentialite',
    title: 'Privacy policy',
    subtitle: 'How Pebiss collects, uses and protects your personal data.',
    updatedAt: 'September 9, 2026',
    sections: [
      {
        id: 'preambule',
        title: 'Preamble and data controller',
        blocks: [
          { type: 'p', text: 'This policy describes how Pebiss, acting as data controller, collects and uses the personal data of Platform users, in accordance with applicable personal data protection regulations.' },
          { type: 'p', text: 'Data controller: Pebiss — Pluba – Curva de Djon Cubala, Bissau, Guinea-Bissau — contact@pebiss.com.' },
          { type: 'note', text: 'By creating an account or using the Platform, you acknowledge that you have read and accepted this privacy policy.' },
        ],
      },
      {
        id: 'donnees-collectees',
        title: 'Data collected',
        blocks: [
          { type: 'p', text: 'We only collect the data necessary for the operation of the service:' },
          { type: 'list', items: [
            'Account data: name, username, email address, phone number, password (encrypted);',
            'Professional data: company name, category, address, opening hours, description, photos and products published;',
            'Interaction data: reviews posted, messages, searches performed, favourites;',
            'Technical data: IP address, device type, browser and connection logs, for security and anonymised statistics purposes.',
          ] },
        ],
      },
      {
        id: 'finalites',
        title: 'Purposes of processing',
        blocks: [
          { type: 'p', text: 'Your data is used exclusively for:' },
          { type: 'list', items: [
            'creating and managing your account and your ads;',
            'publishing and updating business listings and reviews;',
            'allowing you to be contacted by other users;',
            'improving the service, security and performance of the Platform;',
            'informing you about new features or promotional offers, with your prior consent.',
          ] },
          { type: 'note', text: 'We never sell your personal data to third parties.' },
        ],
      },
      {
        id: 'bases-legales',
        title: 'Legal bases',
        blocks: [
          { type: 'p', text: 'The processing described relies on the following legal bases:' },
          { type: 'list', items: [
            'the performance of the contract binding you to Pebiss (account and ads management);',
            'your consent (commercial communications, non-essential cookies);',
            'Pebiss\'s legitimate interest (security, service improvement, statistics);',
            'compliance with applicable legal obligations.',
          ] },
        ],
      },
      {
        id: 'conservation',
        title: 'Data retention',
        blocks: [
          { type: 'list', items: [
            'Account data: kept for the entire duration of your registration, then archived for 12 months after account closure;',
            'Ads and listings: kept until deleted by their author or by Pebiss;',
            'Reviews: kept as long as the related business listing is online, unless deletion is requested;',
            'Technical data and logs: kept for a maximum of 12 months.',
          ] },
        ],
      },
      {
        id: 'destinataires',
        title: 'Recipients of data',
        blocks: [
          { type: 'p', text: 'Your data is intended for the internal Pebiss team and, where applicable:' },
          { type: 'list', items: [
            'hosting providers and technical service providers responsible for operating the Platform;',
            'other users, for the information you make public (business listing, ads, reviews);',
            'competent authorities, upon legal requisition.',
          ] },
          { type: 'p', text: 'These recipients undertake to guarantee a level of protection equivalent to that described in this policy.' },
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and trackers',
        blocks: [
          { type: 'p', text: 'The Platform uses cookies strictly necessary for its operation (login session, preferred language, security) as well as, with your consent, anonymised audience measurement cookies.' },
          { type: 'list', items: [
            'Essential cookies: required for the service — no action is required on your part;',
            'Audience measurement cookies: stored only after your consent, revocable at any time;',
            'You can configure your browser to refuse or delete cookies, without this blocking access to essential features.',
          ] },
        ],
      },
      {
        id: 'securite',
        title: 'Data security',
        blocks: [
          { type: 'p', text: 'We implement appropriate technical and organisational measures to protect your data: password encryption, secure connections (HTTPS), access restriction, regular backups and monitoring of intrusion attempts.' },
          { type: 'p', text: 'In the event of a data breach likely to result in a high risk to your rights, we will notify you as soon as possible as well as the competent authorities.' },
        ],
      },
      {
        id: 'droits',
        title: 'Your rights',
        blocks: [
          { type: 'p', text: 'In accordance with applicable regulations, you have the following rights over your personal data:' },
          { type: 'list', items: [
            'right of access: obtain confirmation and a copy of the data concerning you;',
            'right to rectification: have inaccurate or incomplete data corrected;',
            'right to erasure: request the deletion of your data and your account;',
            'right to object and to restriction: object to certain processing operations;',
            'right to portability: receive your data in a structured format.',
          ] },
          { type: 'note', text: 'To exercise your rights, write to contact@pebiss.com. We respond to any request within a maximum of 30 days. You may also lodge a complaint with the competent data protection authority.' },
        ],
      },
      {
        id: 'modifications',
        title: 'Contact and changes',
        blocks: [
          { type: 'p', text: 'Any question regarding this policy can be sent to: Pebiss — contact@pebiss.com — +245 956 00 7371 — Pluba – Curva de Djon Cubala, Bissau, Guinea-Bissau.' },
          { type: 'p', text: 'This policy may be amended to reflect changes in the service or regulations. The date of the last update appears at the top of the document; users will be informed of any substantial change via the Platform.' },
        ],
      },
    ],
  },

  'cgu': {
    id: 'cgu',
    title: 'Terms and conditions of use',
    subtitle: 'The rules governing the use of the Pebiss platform by users and professionals.',
    updatedAt: 'September 9, 2026',
    sections: [
      {
        id: 'objet',
        title: 'Purpose and acceptance',
        blocks: [
          { type: 'p', text: 'These Terms and Conditions of Use (hereinafter "Terms") are intended to define the terms of access to and use of the Pebiss Platform, available at pebiss.com, by any user.' },
          { type: 'p', text: 'Registration, browsing the Platform or publishing any content constitutes full and complete acceptance of these Terms. If you do not accept these conditions, please do not use the Platform.' },
        ],
      },
      {
        id: 'definitions',
        title: 'Definitions',
        blocks: [
          { type: 'list', items: [
            '"Platform": the Pebiss website and all its features (directory, ads, reviews, professional area);',
            '"User": any person accessing the Platform;',
            '"Professional": a registered user who publishes a business listing, ads or services;',
            '"Content": any data published by a user (text, photo, review, ad, comment);',
            '"Account": the personal space created upon registration which gives access to reserved features.',
          ] },
        ],
      },
      {
        id: 'inscription',
        title: 'Access to the service and registration',
        blocks: [
          { type: 'p', text: 'Access to browsing the directory and ads is free of charge. Creating an account is required to publish a listing, an ad or a review.' },
          { type: 'list', items: [
            'Registration is reserved for adults with legal capacity, as well as professionals duly authorised to carry out their business;',
            'The information provided at registration must be accurate and up to date;',
            'Each user is responsible for the confidentiality of their credentials and for the activity carried out from their account;',
            'One account per person or per company is allowed, unless prior agreement from Pebiss.',
          ] },
        ],
      },
      {
        id: 'role-pebiss',
        title: 'Pebiss\'s role',
        blocks: [
          { type: 'p', text: 'Pebiss is a professional directory and a matchmaking platform. It allows professionals to get known and users to find them, contact them and leave reviews.' },
          { type: 'note', text: 'Pebiss is neither a party to nor an intermediary in the contractual relationships between users and professionals. Sales, services, payments and deliveries are the sole responsibility of the parties involved.' },
        ],
      },
      {
        id: 'annonces',
        title: 'Publishing ads',
        blocks: [
          { type: 'p', text: 'Any professional may publish ads describing their products or services, in compliance with the following rules:' },
          { type: 'list', items: [
            'The ad must be sincere, accurate and describe a product or service actually offered;',
            'It must be published in the most appropriate category;',
            'Photos must be authentic and rights-free;',
            'The same product or service must not be published several times in duplicate;',
            'Outdated ads must be updated or removed.',
          ] },
          { type: 'p', text: 'The following content is strictly prohibited: unlawful, fraudulent, misleading, discriminatory, defamatory, violent, sexual in nature, contrary to public order or morality, or infringing the rights of third parties (intellectual property, image, privacy).' },
        ],
      },
      {
        id: 'avis',
        title: 'Customer reviews',
        blocks: [
          { type: 'p', text: 'Users may post reviews about listed businesses to help the community make choices. Each review must reflect a genuine and sincere experience.' },
          { type: 'list', items: [
            'Insulting, libellous, off-topic reviews or reviews published for payment will be removed;',
            'Professionals may not post reviews about their own business;',
            'A professional may publicly reply to a review;',
            'Pebiss reserves the right to moderate or remove any non-compliant review.',
          ] },
        ],
      },
      {
        id: 'services-payants',
        title: 'Paid services and advertising',
        blocks: [
          { type: 'p', text: 'Some features are offered free of charge. Pebiss may also offer paid services (ad promotion, advertising spaces, premium offers) whose pricing conditions are specified at the time of subscription.' },
          { type: 'list', items: [
            'Prices are expressed in the currency indicated at the time of the order and may change after prior notification of the customers concerned;',
            'Any advertising space is granted subject to the content complying with these Terms;',
            'Payments are secure; any refund conditions are specified in the subscribed offer.',
          ] },
        ],
      },
      {
        id: 'obligations',
        title: 'User obligations',
        blocks: [
          { type: 'p', text: 'When using the Platform, each user undertakes to:' },
          { type: 'list', items: [
            'comply with applicable laws and regulations as well as the rights of third parties;',
            'provide accurate information and not impersonate others;',
            'not attempt to fraudulently access the Platform\'s information systems;',
            'not use robots, scrapers or automated tools likely to harm the service;',
            'not collect other users\' data for unauthorised commercial purposes.',
          ] },
        ],
      },
      {
        id: 'responsabilite',
        title: 'Liability',
        blocks: [
          { type: 'p', text: 'Pebiss implements reasonable means to ensure continuous, quality access to the Platform, without any absolute obligation of result.' },
          { type: 'p', text: 'Pebiss cannot be held liable for:' },
          { type: 'list', items: [
            'Content published by users, of which it is not the author;',
            'transactions entered into between users and professionals;',
            'service interruptions related to maintenance, failures or force majeure;',
            'indirect damages (loss of revenue, data or opportunities) related to the use of the Platform.',
          ] },
        ],
      },
      {
        id: 'suspension',
        title: 'Suspension and termination',
        blocks: [
          { type: 'p', text: 'Pebiss may, at any time, moderate, remove or suspend any Content or Account that does not comply with these Terms, without prejudice to any damages that may be claimed.' },
          { type: 'list', items: [
            'Temporary suspension in the event of a breach that can be remedied, after notification;',
            'Permanent deletion of the Account in the event of a serious or repeated breach, in particular for fraud, unlawful content or unlawful competitive activity;',
            'Termination at any time by the user: account deletion can be requested from the Account settings or by email.',
          ] },
        ],
      },
      {
        id: 'propriete-intellectuelle',
        title: 'Intellectual property',
        blocks: [
          { type: 'p', text: 'The general structure of the Platform as well as the texts, graphics, logos, icons and databases composing it are the property of Pebiss and are protected by intellectual property law.' },
          { type: 'p', text: 'The User retains ownership of the Content they publish. However, they grant Pebiss a non-exclusive, free, worldwide and transferable licence to host, reproduce and represent this Content, strictly necessary for its distribution on the Platform, for the entire duration of its publication.' },
        ],
      },
      {
        id: 'modifications-droit',
        title: 'Changes to the Terms and governing law',
        blocks: [
          { type: 'p', text: 'Pebiss may amend these Terms at any time. The new Terms come into force upon their publication on the Platform; continued use of the service after publication constitutes acceptance.' },
          { type: 'p', text: 'These Terms are governed by Guinean (Guinea-Bissau) law. Any dispute relating to their interpretation or performance shall first be subject to an attempt at amicable resolution; failing that, the courts of Bissau (Guinea-Bissau) shall have jurisdiction.' },
          { type: 'note', text: 'Questions and contact: contact@pebiss.com — +245 956 00 7371 — Pluba – Curva de Djon Cubala, Bissau, Guinea-Bissau.' },
        ],
      },
    ],
  },
};

export const legalDocs: Record<Locale, Record<LegalDocId, LegalDoc>> = { fr, pt, en };

/** Ordre d'affichage de la navigation croisée entre documents légaux. */
export const legalDocOrder: LegalDocId[] = ['mentions-legales', 'politique-confidentialite', 'cgu'];
