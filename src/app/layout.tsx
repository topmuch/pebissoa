import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0066CC',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pebiss.gw';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pebiss - Annuaire Professionnel de Guinée-Bissau",
    template: "%s | Pebiss",
  },
  description: "Pebiss est le premier annuaire professionnel de Guinée-Bissau. Trouvez et référencez des entreprises facilement.",
  keywords: [
    "annuaire Guinée-Bissau",
    "entreprises Guinée-Bissau",
    "référencement professionnel",
    "business directory Guinée-Bissau",
    "Bissau",
    "Pebiss",
    "professionnel Guinée-Bissau",
    "trouver une entreprise Guinée-Bissau",
    "services Guinée-Bissau",
    "commerces Guinée-Bissau",
  ],
  authors: [{ name: "Pebiss", url: SITE_URL }],
  creator: "Pebiss",
  publisher: "Pebiss",
  openGraph: {
    title: "Pebiss - Annuaire Professionnel de Guinée-Bissau",
    description: "Pebiss est le premier annuaire professionnel de Guinée-Bissau. Trouvez et référencez des entreprises facilement.",
    type: "website",
    locale: "fr_GW",
    siteName: "Pebiss",
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/hero-banner.jpg`, width: 1344, height: 768, alt: "Pebiss - Annuaire Professionnel de Guinée-Bissau" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pebiss - Annuaire Professionnel de Guinée-Bissau",
    description: "Pebiss est le premier annuaire professionnel de Guinée-Bissau. Trouvez et référencez des entreprises facilement.",
    images: [`${SITE_URL}/hero-banner.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
        <SonnerToaster />
        <Toaster />
      </body>
    </html>
  );
}
