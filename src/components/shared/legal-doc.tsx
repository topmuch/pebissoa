'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CalendarClock,
  ChevronRight,
  FileText,
  Info,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { legalDocOrder, type LegalDoc, type LegalDocId } from '@/lib/legal-content';
import { cn } from '@/lib/utils';

/** Métadonnées d'affichage des documents légaux (route, icône, clé i18n du libellé). */
const docMeta: Record<LegalDocId, { href: string; Icon: typeof FileText; labelKey: string }> = {
  'mentions-legales': { href: '/mentions-legales', Icon: FileText, labelKey: 'legal' },
  'politique-confidentialite': { href: '/politique-confidentialite', Icon: ShieldCheck, labelKey: 'privacy' },
  'cgu': { href: '/cgu', Icon: ScrollText, labelKey: 'terms' },
};

function OtherDocsCard({ currentId }: { currentId: LegalDocId }) {
  const { t } = useTranslation();
  return (
    <section className="py-14 px-4" aria-label={t('legal_other_docs')}>
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          {t('legal_other_docs')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {legalDocOrder.map((id) => {
            const meta = docMeta[id];
            return (
              <Link
                key={id}
                href={meta.href}
                aria-current={id === currentId ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5',
                  id === currentId ? 'border-[#0066CC]/50 ring-1 ring-[#0066CC]/20' : 'border-border'
                )}
              >
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
                    id === currentId
                      ? 'bg-[#0066CC] text-white'
                      : 'bg-[#0066CC]/10 text-[#0066CC] group-hover:bg-[#0066CC] group-hover:text-white'
                  )}
                >
                  <meta.Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold leading-snug',
                    id === currentId ? 'text-[#0066CC]' : 'text-foreground group-hover:text-[#0066CC]'
                  )}
                >
                  {t(meta.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TableOfContents({ doc, showHeading = true }: { doc: LegalDoc; showHeading?: boolean }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>(doc.sections[0]?.id ?? '');

  // Met en surbrillance la section visible dans le sommaire
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [doc]);

  return (
    <nav aria-label={t('legal_toc')} className="space-y-2">
      {showHeading && (
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#0066CC] mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t('legal_toc')}
        </h2>
      )}
      <ol className="space-y-1">
        {doc.sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={activeId === section.id ? 'true' : undefined}
              className={cn(
                'flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm leading-snug transition-colors',
                activeId === section.id
                  ? 'bg-[#0066CC]/10 text-[#0066CC] font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <span
                className={cn(
                  'mt-px text-xs font-bold tabular-nums',
                  activeId === section.id ? 'text-[#0066CC]' : 'text-muted-foreground/70'
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalDocView({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F6F6F6] dark:bg-[#0F0F1A]">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0066CC] to-[#0099FF] py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Fil d'Ariane */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-white font-medium">{doc.title}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {doc.title}
          </h1>
          <p className="text-white/85 text-base md:text-lg max-w-2xl mx-auto">
            {doc.subtitle}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm text-white">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            <span>
              {t('legal_updated')}&nbsp;{doc.updatedAt}
            </span>
          </div>
        </div>
      </section>

      {/* Contenu : sommaire sticky (desktop) + sections */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10">
          {/* Sommaire — sticky sur desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border bg-card p-5 shadow-sm">
              <TableOfContents doc={doc} />
            </div>
          </aside>

          {/* Document */}
          <article className="min-w-0">
            {/* Sommaire replié sur mobile */}
            <details className="lg:hidden mb-8 rounded-xl border bg-card shadow-sm" open>
              <summary className="cursor-pointer select-none px-5 py-4 text-sm font-bold uppercase tracking-wider text-[#0066CC] flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('legal_toc')}
              </summary>
              <div className="px-3 pb-4">
                <TableOfContents doc={doc} showHeading={false} />
              </div>
            </details>

            <div className="space-y-6">
              {doc.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-28 rounded-xl border bg-card p-6 md:p-8 shadow-sm"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="flex items-start gap-3 text-xl md:text-2xl font-bold text-foreground mb-4"
                  >
                    <span
                      className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0066CC] text-sm font-bold text-white"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{section.title}</span>
                  </h2>

                  <div className="space-y-4">
                    {section.blocks.map((block, bIdx) => {
                      if (block.type === 'list') {
                        return (
                          <ul key={bIdx} className="space-y-2.5 pl-1">
                            {block.items?.map((item, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066CC]" aria-hidden="true" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.type === 'note') {
                        return (
                          <div
                            key={bIdx}
                            className="flex items-start gap-3 rounded-lg border border-[#0066CC]/20 bg-[#0066CC]/5 p-4"
                            role="note"
                          >
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0066CC]" aria-hidden="true" />
                            <p className="text-sm md:text-base text-foreground/85 leading-relaxed font-medium">
                              {block.text}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p key={bIdx} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {block.text}
                        </p>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Navigation croisée entre les documents légaux */}
      <OtherDocsCard currentId={doc.id} />
    </div>
  );
}
