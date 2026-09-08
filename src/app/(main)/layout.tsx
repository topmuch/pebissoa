import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MaintenanceGuard } from '@/components/maintenance-guard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw';

// JSON-LD WebSite schema — helps Google understand site search
function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pebiss',
    url: SITE_URL,
    description: 'Pebiss est le premier annuaire professionnel de Guinée-Bissau. Trouvez et référencez des entreprises facilement.',
    inLanguage: ['fr', 'pt'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/annuaire?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// JSON-LD Organization schema
function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pebiss',
    url: SITE_URL,
    logo: `${SITE_URL}/pebiss-logo.png`,
    description: 'Pebiss est le premier annuaire professionnel de Guinée-Bissau. Trouvez et référencez des entreprises facilement.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bissau',
      addressCountry: 'GW',
    },
    sameAs: [
      'https://facebook.com/pebiss',
      'https://instagram.com/pebiss',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+245-956-007-371',
      contactType: 'customer service',
      availableLanguage: ['fr', 'pt'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaintenanceGuard>
      <div className="min-h-screen flex flex-col">
        <WebSiteJsonLd />
        <OrganizationJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </MaintenanceGuard>
  );
}
