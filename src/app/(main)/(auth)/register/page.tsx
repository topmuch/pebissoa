'use client';

/**
 * Page /register — inscription entreprise, refonte inspirée PagesJaunes :
 *  1. Bandeau jaune : grand titre + illustration + carte flottante
 *  2. Formulaire multi-étapes (carte blanche qui chevauche le bandeau)
 *  3. Section statistiques « Boostez l'activité de votre entreprise »
 *  4. Section bleue « Un seul outil pour piloter votre visibilité »
 */

import { useState, useRef, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Mail,
  Lock,
  MapPin,
  ImagePlus,
  Upload,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  CheckCircle2,
  Loader2,
  Sparkles,
  Globe,
  User,
  X,
  PartyPopper,
  TrendingUp,
  LayoutGrid,
  BadgePercent,
  Clock,
  Megaphone,
  ClipboardList,
  Star,
  MessagesSquare,
  LogIn,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const TOTAL_STEPS = 4;

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

/** Statistiques de la section blanche (style PagesJaunes) */
const STATS = [
  { icon: TrendingUp, valueKey: 'register_stat1_value', textKey: 'register_stat1_text', circle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { icon: LayoutGrid, valueKey: 'register_stat2_value', textKey: 'register_stat2_text', circle: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400' },
  { icon: BadgePercent, valueKey: 'register_stat3_value', textKey: 'register_stat3_text', circle: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' },
  { icon: Clock, valueKey: 'register_stat4_value', textKey: 'register_stat4_text', circle: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400' },
];

/** Fonctionnalités de la section bleue */
const FEATURES = [
  { icon: ClipboardList, key: 'register_tool_feature1' },
  { icon: Megaphone, key: 'register_tool_feature2' },
  { icon: Star, key: 'register_tool_feature3' },
  { icon: MessagesSquare, key: 'register_tool_feature4' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  // Step 1: Business info
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Step 2: Account info
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3: Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Step 4: Cover photo
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!businessName.trim()) {
          toast({ title: t('register_error'), description: t('onboarding_step1_name_label') + ' requis', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        if (!ownerName.trim() || !ownerEmail.trim() || !password.trim()) {
          toast({ title: t('register_error'), description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
          return false;
        }
        if (password !== confirmPassword) {
          toast({ title: t('register_error'), description: t('register_password_mismatch'), variant: 'destructive' });
          return false;
        }
        if (password.length < 6) {
          toast({ title: t('register_error'), description: t('register_password_short'), variant: 'destructive' });
          return false;
        }
        return true;
      case 3:
        return true; // All optional
      case 4:
        return true; // All optional
      default:
        return true;
    }
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCoverUpload = useCallback(async (file: File) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: t('register_error'), description: 'Format non supporté. Utilisez JPG, PNG ou WebP.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('register_error'), description: 'Fichier trop volumineux. Maximum 5MB.', variant: 'destructive' });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCoverImage(data.url || data.urls?.[0]);
    } catch {
      toast({ title: t('register_error'), description: 'Erreur lors de l\'envoi de la photo', variant: 'destructive' });
      setCoverPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [toast, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  const handleCoverInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
  };

  const scrollToForm = () => {
    document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          password,
          businessName,
          categoryId: categoryId || undefined,
          address: address || undefined,
          city: city || undefined,
          country: country || undefined,
          coverImage: coverImage || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('register_error_generic'));
      }

      // Auto-login (best effort — if it fails, account is still created)
      try {
        const result = await signIn('credentials', {
          email: ownerEmail,
          password,
          redirect: false,
        });
        if (result?.ok) {
          setIsComplete(true);
        } else {
          // Login failed but account created — redirect to login page
          router.push('/login');
        }
      } catch {
        // signIn can throw in some environments — account still created
        router.push('/login');
      }
    } catch (error) {
      toast({
        title: t('register_error_generic'),
        description: error instanceof Error ? error.message : t('register_error_msg'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step icons ---
  const stepIcons = [
    <Building2 key="b" className="h-5 w-5" />,
    <User key="u" className="h-5 w-5" />,
    <MapPin key="m" className="h-5 w-5" />,
    <ImagePlus key="i" className="h-5 w-5" />,
  ];

  const stepColors = [
    'bg-orange-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-violet-500',
  ];

  // --- Completion screen ---
  if (isComplete) {
    return (
      <div className="min-h-[70vh] px-4 py-12 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="container mx-auto max-w-lg text-center"
        >
          <div className="bg-background border border-border/40 rounded-2xl shadow-lg p-8 md:p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6"
            >
              <PartyPopper className="h-10 w-10 text-emerald-600" />
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {t('onboarding_complete_title')}
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('onboarding_complete_desc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-[#FFC600] hover:bg-[#F0B900] text-[#1F1F1F] font-bold px-8"
                onClick={() => router.push('/dashboard/mon-entreprise')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('onboarding_complete_profile')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => router.push('/dashboard')}
              >
                {t('onboarding_complete_dashboard')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFAF6] dark:bg-background">
      {/* ===== 1. Bandeau jaune (style PagesJaunes) ===== */}
      <div className="relative overflow-hidden bg-[#FFC600]">
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/25 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-black/5 pointer-events-none" aria-hidden="true" />

        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 relative">
          <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Textes */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl xl:text-[2.75rem] font-extrabold leading-tight text-[#1F1F1F] mb-5">
                {t('register_hero_title1')}{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="absolute inset-x-0 bottom-0.5 h-[0.32em] bg-white/90 rounded-sm" aria-hidden="true" />
                  <span className="relative">{t('register_hero_title2')}</span>
                </span>
              </h1>
              <p className="text-[#4A4234] text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7">
                {t('register_hero_desc')}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className="h-12 rounded-full bg-[#1F1F1F] px-7 text-base font-bold text-white hover:bg-[#333333] shadow-lg"
                >
                  {t('register_create_button')}
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-full px-5 text-base font-bold text-[#1F1F1F] underline decoration-2 underline-offset-4 hover:bg-white/30 transition-colors"
                >
                  {t('register_login_link')}
                </Link>
              </div>
            </div>

            {/* Illustration + carte flottante */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <Image
                src="/auth/register-hero.jpg"
                alt={t('register_hero_title1')}
                width={864}
                height={648}
                priority
                className="w-full h-auto rounded-[2rem] object-cover shadow-2xl shadow-black/20"
              />
              {/* Carte flottante « fiche bien notée » */}
              <div className="absolute -bottom-5 left-4 sm:-left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-black/10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFC600] text-xl font-extrabold text-[#1F1F1F]">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {t('register_form_card_title')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 2. Formulaire multi-étapes (carte qui chevauche le bandeau) ===== */}
      <div id="register-form" className="container mx-auto px-4">
        <div className="mx-auto -mt-8 md:-mt-12 max-w-2xl scroll-mt-24">
          <Card className="border-border/40 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden">
            {/* En-tête de la carte */}
            <div className="border-b border-border/40 bg-gradient-to-r from-[#FFF8E1] to-white px-6 pt-6 pb-5 text-center md:px-8">
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
                {t('register_form_card_title')}
              </h2>
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#FFC600]/20 px-3.5 py-1 text-xs font-bold text-[#8A6D00] dark:text-[#FFC600]">
                <Sparkles className="h-3.5 w-3.5" />
                {t('register_form_free')}
              </p>
            </div>

            <CardContent className="p-6 md:p-8">
              {/* Progress bar */}
              <div className="mb-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-3">
                  {stepIcons.map((icon, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i + 1 < currentStep) {
                          setDirection(-1);
                          setCurrentStep(i + 1);
                        }
                      }}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                        i + 1 === currentStep
                          ? 'text-foreground'
                          : i + 1 < currentStep
                          ? 'text-muted-foreground hover:text-foreground cursor-pointer'
                          : 'text-muted-foreground/40'
                      }`}
                      disabled={i + 1 >= currentStep}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-all ${
                          i + 1 < currentStep
                            ? stepColors[i]
                            : i + 1 === currentStep
                            ? stepColors[i]
                            : 'bg-muted'
                        } ${i + 1 >= currentStep ? 'opacity-40' : ''}`}
                      >
                        {i + 1 < currentStep ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          icon
                        )}
                      </div>
                      <span className="hidden sm:inline">
                        {t(`onboarding_step${i + 1}_title`).split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step indicator */}
              <div className="text-center mb-6">
                <span className="text-xs text-muted-foreground">
                  {t('onboarding_step')} {currentStep} {t('onboarding_of')} {TOTAL_STEPS}
                </span>
              </div>

              {/* Step content with animation */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {/* Step header */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        {t(`onboarding_step${currentStep}_title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(`onboarding_step${currentStep}_desc`)}
                      </p>
                    </div>

                    {/* Step 1: Business info */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-sm font-medium">
                            {t('onboarding_step1_name_label')} <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="businessName"
                              placeholder={t('onboarding_step1_name_placeholder')}
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className="pl-10"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && goNext()}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">
                            {t('onboarding_step1_category_label')}
                          </Label>
                          <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('onboarding_step1_category_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Account info */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="ownerName" className="text-sm font-medium">
                            {t('onboarding_step2_name_label')} <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="ownerName"
                              placeholder={t('onboarding_step2_name_placeholder')}
                              value={ownerName}
                              onChange={(e) => setOwnerName(e.target.value)}
                              className="pl-10"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ownerEmail" className="text-sm font-medium">
                            {t('onboarding_step2_email_label')} <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="ownerEmail"
                              type="email"
                              placeholder={t('onboarding_step2_email_placeholder')}
                              value={ownerEmail}
                              onChange={(e) => setOwnerEmail(e.target.value)}
                              className="pl-10"
                              onKeyDown={(e) => e.key === 'Enter' && goNext()}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                              {t('onboarding_step2_password_label')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="password"
                                type="password"
                                placeholder={t('onboarding_step2_password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                              {t('onboarding_step2_confirm_label')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder={t('onboarding_step2_confirm_placeholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10"
                                onKeyDown={(e) => e.key === 'Enter' && goNext()}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Location */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium">
                            {t('onboarding_step3_address_label')}
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="address"
                              placeholder={t('onboarding_step3_address_placeholder')}
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="pl-10"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-medium">
                              {t('onboarding_step3_city_label')}
                            </Label>
                            <Input
                              id="city"
                              placeholder={t('onboarding_step3_city_placeholder')}
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && goNext()}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-sm font-medium">
                              {t('onboarding_step3_country_label')}
                            </Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="country"
                                placeholder={t('onboarding_step3_country_placeholder')}
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground text-center pt-2">
                          {t('register_optional')}
                        </p>
                      </div>
                    )}

                    {/* Step 4: Cover photo */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div
                          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                            coverPreview
                              ? 'border-[#FFC600]/50 bg-[#FFC600]/5'
                              : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                          }`}
                          onClick={() => coverInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={handleDrop}
                        >
                          {coverPreview ? (
                            <div className="relative w-full">
                              <img
                                src={coverPreview}
                                alt="Cover"
                                className="w-full h-48 rounded-lg object-cover"
                              />
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    coverInputRef.current?.click();
                                  }}
                                  className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCoverPreview(null);
                                    setCoverImage(null);
                                  }}
                                  className="bg-destructive text-white rounded-full p-1.5 shadow-md hover:bg-destructive/90 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {t('onboarding_step4_upload')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('onboarding_step4_hint')}
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handleCoverInput}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          {t('register_optional')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 gap-3">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goPrev}
                    className="gap-1 rounded-xl"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('onboarding_prev')}
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="gap-1 rounded-xl bg-[#FFC600] font-bold text-[#1F1F1F] hover:bg-[#F0B900] shadow-lg shadow-[#FFC600]/30"
                  >
                    {t('onboarding_next')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="rounded-xl bg-[#FFC600] px-8 font-bold text-[#1F1F1F] hover:bg-[#F0B900] shadow-lg shadow-[#FFC600]/30"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('register_loading')}
                      </div>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t('onboarding_finish')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Login link */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            {t('register_has_account')}{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              {t('register_login_link')}
            </Link>
          </p>
        </div>
      </div>

      {/* ===== 3. Section statistiques (style PagesJaunes) ===== */}
      <section className="mt-16 md:mt-20 bg-white dark:bg-card py-14 md:py-18">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl md:text-3xl font-extrabold text-foreground leading-tight mb-12 md:mb-16">
            {t('register_stats_title1')}
            <br className="hidden md:block" />
            {' '}{t('register_stats_title2')}
          </h2>

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`mb-5 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full ${stat.circle}`}>
                    <Icon className="h-9 w-9 md:h-11 md:w-11" strokeWidth={1.8} />
                  </div>
                  <p className="text-2xl md:text-4xl font-extrabold text-foreground mb-2">
                    {t(stat.valueKey)}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                    {t(stat.textKey)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 4. Section bleue « Un seul outil » (style PagesJaunes) ===== */}
      <section className="bg-[#0099FF] py-14 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mx-auto max-w-3xl text-center text-2xl md:text-3xl font-extrabold text-white leading-tight mb-12 md:mb-16">
            {t('register_tool_title1')}{' '}
            <span className="relative inline-block">
              <span className="absolute inset-x-0 bottom-0.5 h-[0.32em] bg-[#1F1F1F]/70 rounded-sm" aria-hidden="true" />
              <span className="relative">{t('register_tool_title2')}</span>
            </span>
          </h2>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-start gap-4 rounded-2xl bg-white/12 p-5 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.9} />
                  </span>
                  <p className="text-sm md:text-[15px] leading-relaxed text-white">
                    {t(f.key)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="h-12 rounded-full bg-[#FFC600] px-7 text-base font-bold text-[#1F1F1F] shadow-lg hover:bg-[#F0B900]"
            >
              {t('register_create_button')}
            </Button>
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-base font-bold text-white underline decoration-2 underline-offset-4 hover:bg-white/15 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              {t('register_login_link')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
