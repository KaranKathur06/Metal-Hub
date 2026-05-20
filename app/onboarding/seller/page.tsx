'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Check, ChevronRight, Factory, FileText,
  Loader2, Package, ShieldCheck, Sparkles, Upload, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTaxonomyRegistry } from '@/lib/marketplace/use-taxonomy-registry';
import {
  SELLER_ONBOARDING_STEPS,
  getSellerOnboardingProgress,
  canSkipSellerOnboardingStep,
  type SellerOnboardingStepKey,
  type SellerOnboardingState,
} from '@/lib/marketplace/seller-onboarding';

const STEP_ICONS: Record<SellerOnboardingStepKey, typeof User> = {
  account_setup: User,
  company_information: Building2,
  factory_capabilities: Factory,
  documents: FileText,
  first_listing: Package,
  profile_enhancement: Sparkles,
};

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, profile, loading: authLoading, supabase } = useAuth();
  const { data: taxonomy } = useTaxonomyRegistry();
  const { developmentTrustMode } = useAuth();
  const devMode = developmentTrustMode;

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [onboardingState, setOnboardingState] = useState<Partial<SellerOnboardingState>>({
    completedSteps: [], skippedSteps: [], draftSteps: [],
  });
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<SellerOnboardingStepKey>('account_setup');

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setValues((prev) => ({
        ...prev,
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || 'seller',
      }));
      // Mark account_setup as complete if profile exists
      setOnboardingState((prev) => ({
        ...prev,
        completedSteps: [...(prev.completedSteps || []), 'account_setup'],
      }));
      setActiveStep('company_information');
    }
  }, [profile]);

  const progress = getSellerOnboardingProgress(values, onboardingState);

  const updateField = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const markComplete = useCallback((stepKey: SellerOnboardingStepKey) => {
    setOnboardingState((prev) => ({
      ...prev,
      completedSteps: Array.from(new Set([...(prev.completedSteps || []), stepKey])),
      draftSteps: (prev.draftSteps || []).filter((s) => s !== stepKey),
    }));
    // Move to next step
    const idx = SELLER_ONBOARDING_STEPS.findIndex((s) => s.key === stepKey);
    if (idx < SELLER_ONBOARDING_STEPS.length - 1) {
      setActiveStep(SELLER_ONBOARDING_STEPS[idx + 1].key);
    }
  }, []);

  const skipStep = useCallback((stepKey: SellerOnboardingStepKey) => {
    setOnboardingState((prev) => ({
      ...prev,
      skippedSteps: Array.from(new Set([...(prev.skippedSteps || []), stepKey])),
    }));
    const idx = SELLER_ONBOARDING_STEPS.findIndex((s) => s.key === stepKey);
    if (idx < SELLER_ONBOARDING_STEPS.length - 1) {
      setActiveStep(SELLER_ONBOARDING_STEPS[idx + 1].key);
    }
  }, []);

  const handleSaveAndContinue = async () => {
    setSaving(true);
    // Save to Supabase profile/company tables
    if (supabase && profile) {
      try {
        await supabase.from('profiles').update({
          full_name: values.fullName as string,
          phone: values.phone as string,
          onboarding_step: SELLER_ONBOARDING_STEPS.findIndex((s) => s.key === activeStep) + 1,
        }).eq('id', profile.id);
      } catch { /* ignore save errors in dev */ }
    }
    markComplete(activeStep);
    setSaving(false);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/onboarding/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit',
          draftPayload: values,
          skippedSteps: onboardingState.skippedSteps ?? [],
        }),
      });

      const data = await response.json();

      if (response.ok && data.result?.publicSlug) {
        router.push(`/suppliers/${data.result.publicSlug}`);
        return;
      }

      if (!response.ok) {
        console.error('[onboarding commit]', data.error);
      }
    } catch (error) {
      console.error('[onboarding commit]', error);
    } finally {
      setSaving(false);
    }

    router.push('/dashboard/seller');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShieldCheck className="h-12 w-12 text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Login Required</h1>
        <p className="text-sm text-slate-500 mb-6">Please login to access seller onboarding.</p>
        <Link href="/login?redirect=/onboarding/seller"><Button>Login</Button></Link>
      </div>
    );
  }

  const currentStepDef = SELLER_ONBOARDING_STEPS.find((s) => s.key === activeStep)!;
  const canSkip = canSkipSellerOnboardingStep({ step: currentStepDef, developmentTrustMode: devMode });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Seller Onboarding</h1>
            <p className="text-xs text-slate-500">{progress.percent}% complete</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-48 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-500">{progress.completedCount}/{SELLER_ONBOARDING_STEPS.length}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Step sidebar */}
          <nav className="space-y-1">
            {SELLER_ONBOARDING_STEPS.map((step) => {
              const status = progress.steps.find((s) => s.key === step.key)?.status || 'not_started';
              const Icon = STEP_ICONS[step.key];
              const isActive = activeStep === step.key;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveStep(step.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors',
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <span className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    status === 'complete' ? 'bg-emerald-100 text-emerald-600' :
                    status === 'skipped' ? 'bg-amber-100 text-amber-600' :
                    isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400',
                  )}>
                    {status === 'complete' ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate">{step.title}</div>
                    {status === 'complete' && <span className="text-[10px] text-emerald-600">Complete</span>}
                    {status === 'skipped' && <span className="text-[10px] text-amber-600">Skipped</span>}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Step content */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">{currentStepDef.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{currentStepDef.goal}</p>
            </div>

            {/* STEP 1: Account Setup */}
            {activeStep === 'account_setup' && (
              <div className="space-y-4">
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Full Name *</label><Input value={(values.fullName as string) || ''} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Your full name" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Email</label><Input value={(values.email as string) || ''} disabled className="bg-slate-50" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Phone</label><Input value={(values.phone as string) || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91..." /></div>
              </div>
            )}

            {/* STEP 2: Company Information */}
            {activeStep === 'company_information' && (
              <div className="space-y-4">
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Company Name *</label><Input value={(values.companyName as string) || ''} onChange={(e) => updateField('companyName', e.target.value)} placeholder="Your company name" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Business Type *</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={(values.businessType as string) || ''} onChange={(e) => updateField('businessType', e.target.value)}>
                    <option value="">Select type</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="trader">Trader / Distributor</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Industry *</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={(values.industryId as string) || ''} onChange={(e) => updateField('industryId', e.target.value)}>
                    <option value="">Select industry</option>
                    {(taxonomy?.industries || []).map((ind) => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                  </select>
                </div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Website</label><Input value={(values.website as string) || ''} onChange={(e) => updateField('website', e.target.value)} placeholder="https://..." /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Years in Business</label><Input type="number" value={(values.yearsInBusiness as string) || ''} onChange={(e) => updateField('yearsInBusiness', e.target.value)} placeholder="e.g. 15" /></div>
              </div>
            )}

            {/* STEP 3: Factory & Capabilities */}
            {activeStep === 'factory_capabilities' && (
              <div className="space-y-4">
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Production Capacity *</label><Input value={(values.productionCapacity as string) || ''} onChange={(e) => updateField('productionCapacity', e.target.value)} placeholder="e.g. 500 MT/month" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Manufacturing Processes</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(taxonomy?.capabilities || []).map((cap) => (
                      <label key={cap.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" className="rounded" checked={((values.manufacturingProcesses as string[]) || []).includes(cap.id)}
                          onChange={(e) => {
                            const current = (values.manufacturingProcesses as string[]) || [];
                            updateField('manufacturingProcesses', e.target.checked ? [...current, cap.id] : current.filter((id) => id !== cap.id));
                          }} />
                        {cap.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Certifications</label><Input value={(values.certifications as string) || ''} onChange={(e) => updateField('certifications', e.target.value)} placeholder="ISO 9001, AS9100D, etc." /></div>
              </div>
            )}

            {/* STEP 4: Documents */}
            {activeStep === 'documents' && (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Upload className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">Upload Verification Documents</p>
                  <p className="text-xs text-slate-500 mb-4">GST Certificate, Company Registration, ISO Certificates, Product Catalogs</p>
                  <Button variant="outline" size="sm" disabled>Upload Files (Coming Soon)</Button>
                </div>
                {devMode && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
                    <strong>Development Mode:</strong> Document upload can be skipped during development.
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: First Listing */}
            {activeStep === 'first_listing' && (
              <div className="space-y-4">
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Listing Title *</label><Input value={(values.listingTitle as string) || ''} onChange={(e) => updateField('listingTitle', e.target.value)} placeholder="e.g. MS Steel Plates - Grade A" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Category *</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={(values.listingCategoryId as string) || ''} onChange={(e) => updateField('listingCategoryId', e.target.value)}>
                    <option value="">Select category</option>
                    {(taxonomy?.categories || []).map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="mb-1 block text-xs font-semibold text-slate-500">MOQ</label><Input value={(values.moq as string) || ''} onChange={(e) => updateField('moq', e.target.value)} placeholder="e.g. 100 MT" /></div>
                  <div><label className="mb-1 block text-xs font-semibold text-slate-500">Lead Time</label><Input value={(values.leadTime as string) || ''} onChange={(e) => updateField('leadTime', e.target.value)} placeholder="e.g. 7-10 days" /></div>
                </div>
              </div>
            )}

            {/* STEP 6: Profile Enhancement */}
            {activeStep === 'profile_enhancement' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-6 text-center">
                  <Check className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Almost Done!</h3>
                  <p className="text-sm text-slate-600">Your seller profile is ready. You can enhance it later from your dashboard.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                {canSkip && (
                  <Button variant="ghost" size="sm" onClick={() => skipStep(activeStep)} className="text-slate-500">
                    Skip for now
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                {activeStep === 'profile_enhancement' ? (
                  <Button onClick={handleFinish} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button onClick={handleSaveAndContinue} disabled={saving} className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
