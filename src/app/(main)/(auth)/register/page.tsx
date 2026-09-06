'use client';

import { useState, useRef, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  CheckCircle2,
  Loader2,
  Sparkles,
  Globe,
  User,
  X,
  PartyPopper,
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
                className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white px-8"
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
    <div className="min-h-[70vh] px-4 py-8 md:py-12">
      <div className="container mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              P
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('onboarding_title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t('onboarding_subtitle')}
          </p>
        </div>

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
              <Card className="border-border/40 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  {/* Step header */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      {t(`onboarding_step${currentStep}_title`)}
                    </h2>
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
                            ? 'border-primary/30 bg-primary/5'
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
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              className="gap-1"
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
              className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white gap-1"
            >
              {t('onboarding_next')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-pebiss-orange hover:bg-pebiss-orange/90 text-white px-8"
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

        {/* Login link */}
        <p className="text-sm text-muted-foreground text-center mt-8">
          {t('register_has_account')}{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('register_login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
