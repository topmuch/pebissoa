'use client';

/**
 * Onglet « Messages » du dashboard — tous les messages du formulaire
 * de contact du site + les demandes de réinitialisation de mot de passe
 * (formulaire « Mot de passe oublié » de la page de connexion).
 *
 * Fonctions : filtre Tous / Non lus, badge de compteur, ouverture d'un
 * message (marque automatiquement comme lu), réponse par e-mail (mailto),
 * marquer non lu, suppression.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Inbox,
  Mail,
  Phone,
  MessageSquare,
  KeyRound,
  MailOpen,
  Trash2,
  Loader2,
  Reply,
  RotateCcw,
  Calendar,
} from 'lucide-react';

interface ContactMessage {
  id: string;
  type: string; // contact | password_reset
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface MessagesResponse {
  messages: ContactMessage[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export default function MessagesPage() {
  const { t, locale } = useTranslation();
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data, isLoading, isError } = useQuery<MessagesResponse>({
    queryKey: ['dashboard-messages', filter],
    queryFn: async () => {
      const res = await fetch(`/api/messages?filter=${filter}&limit=100`);
      if (!res.ok) throw new Error('load failed');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // Marque le message comme lu à l'ouverture
  const markReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead }),
      });
      if (!res.ok) throw new Error('update failed');
      return res.json();
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-messages'] });
      if (vars.isRead) {
        setSelected((s) => (s && s.id === vars.id ? { ...s, isRead: true } : s));
      }
    },
    onError: () => toast.error(t('msg_load_error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-messages'] });
      setSelected(null);
      toast.success(t('msg_deleted'));
    },
    onError: () => toast.error(t('msg_load_error')),
  });

  function openMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.isRead) {
      markReadMutation.mutate({ id: msg.id, isRead: true });
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString(locale === 'pt' ? 'pt-PT' : locale === 'en' ? 'en-GB' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const messages = data?.messages ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066CC]/10 text-[#0066CC]">
              <Inbox className="h-5 w-5" />
            </span>
            {t('msg_title')}
            {unreadCount > 0 && (
              <Badge className="bg-[#0066CC] text-white hover:bg-[#0066CC]">
                {unreadCount} {t('msg_unread_badge')}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('msg_subtitle')}</p>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#0066CC] text-white'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {t('msg_filter_all')}
            <span className={`ml-1 ${filter === 'all' ? 'text-white/80' : 'text-muted-foreground'}`}>
              {data?.total ?? '…'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#0066CC] text-white'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <MailOpen className="h-3.5 w-3.5" />
            {t('msg_filter_unread')}
            {unreadCount > 0 && (
              <span className={`ml-1 ${filter === 'unread' ? 'text-white/80' : 'text-[#0066CC] font-bold'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenu */}
      {isLoading || status === 'loading' ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center text-muted-foreground">
            {t('msg_load_error')}
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-muted-foreground">
              {filter === 'unread' ? t('msg_empty_unread') : t('msg_empty')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`border-0 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                msg.isRead ? 'bg-card' : 'bg-[#0066CC]/[0.04] border-l-4 border-l-[#0066CC]'
              }`}
              onClick={() => openMessage(msg)}
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-4">
                  {/* Icône type */}
                  <div
                    className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${
                      msg.type === 'password_reset'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-[#0066CC]/10 text-[#0066CC]'
                    }`}
                  >
                    {msg.type === 'password_reset' ? (
                      <KeyRound className="h-5 w-5" />
                    ) : (
                      <Mail className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm truncate ${msg.isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>
                        {msg.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${
                          msg.type === 'password_reset'
                            ? 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/10'
                            : 'border-[#0066CC]/20 text-[#0066CC] bg-[#0066CC]/5 dark:border-[#4D9FFF]/30 dark:text-[#4D9FFF]'
                        }`}
                      >
                        {msg.type === 'password_reset' ? t('msg_type_password_reset') : t('msg_type_contact')}
                      </Badge>
                      {!msg.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#0066CC] shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    {msg.subject && (
                      <p className="text-sm text-foreground/80 font-medium truncate mt-0.5">{msg.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{msg.message}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 min-w-0">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{msg.email}</span>
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {msg.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog détail message */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 pr-6">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      selected.type === 'password_reset'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-[#0066CC]/10 text-[#0066CC]'
                    }`}
                  >
                    {selected.type === 'password_reset' ? (
                      <KeyRound className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">{selected.subject || selected.name}</span>
                  </span>
                </DialogTitle>
                <DialogDescription className="text-left">
                  {formatDate(selected.createdAt)}
                  {' · '}
                  {selected.type === 'password_reset' ? t('msg_type_password_reset') : t('msg_type_contact')}
                </DialogDescription>
              </DialogHeader>

              {/* Expéditeur */}
              <div className="rounded-xl bg-muted/60 p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{t('contact_page_form_name')}</p>
                    <p className="font-medium text-foreground truncate">{selected.name}</p>
                  </div>
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-[13px] font-semibold transition-colors shrink-0"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    {t('msg_reply_by_email')}
                  </a>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{t('contact_page_form_email')}</p>
                    <p className="font-medium text-foreground truncate">{selected.email}</p>
                  </div>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a href={`tel:${selected.phone}`} className="font-medium text-[#0066CC] hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Corps du message */}
              <div className="rounded-xl border border-border p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={markReadMutation.isPending}
                  onClick={() => markReadMutation.mutate({ id: selected.id, isRead: !selected.isRead })}
                >
                  {markReadMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : selected.isRead ? (
                    <RotateCcw className="h-3.5 w-3.5" />
                  ) : (
                    <MailOpen className="h-3.5 w-3.5" />
                  )}
                  {selected.isRead ? t('msg_mark_unread') : t('msg_mark_read')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(selected.id)}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {t('msg_delete')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
