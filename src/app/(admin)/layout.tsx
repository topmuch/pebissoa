import type { Metadata } from 'next';
import { AdminLayout } from '@/components/admin/admin-layout';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googlebot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
