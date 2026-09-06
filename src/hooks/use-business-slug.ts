'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

export function useBusinessSlug() {
  const { data: session, status } = useSession();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['my-business'],
    queryFn: async () => {
      const res = await fetch('/api/businesses?ownerId=' + session!.user.id);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      return data.businesses?.[0] || null;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
  });

  return {
    slug: business?.slug || null,
    business,
    isLoading,
    error,
  };
}
