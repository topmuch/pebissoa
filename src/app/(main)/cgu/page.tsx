'use client';

import { useTranslation } from '@/lib/i18n';
import { legalDocs } from '@/lib/legal-content';
import { LegalDocView } from '@/components/shared/legal-doc';

export default function CguPage() {
  const { locale } = useTranslation();

  return <LegalDocView doc={legalDocs[locale]?.['cgu'] ?? legalDocs.fr['cgu']} />;
}
