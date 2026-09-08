'use client';

/**
 * Page /login/admin — Espace Administrateur (séparé de l'espace annonceur).
 * Refuse les comptes non-admin après connexion.
 */

import { LoginForm } from '@/components/auth/login-form';

export default function AdminLoginPage() {
  return <LoginForm variant="admin" />;
}
