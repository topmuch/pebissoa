'use client';

import { useTranslation } from '@/lib/i18n';
import { legalDocs } from '@/lib/legal-content';
import { LegalDocView } from '@/components/shared/legal-doc';

export default function MentionsLegalesPage() {
  const { locale } = useTranslation();

  return <LegalDocView doc={legalDocs[locale]?.['mentions-legales'] ?? legalDocs.fr['mentions-legales']} />;
}
