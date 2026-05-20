'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle, ArrowRight, CheckCircle, IndianRupee, Loader2,
  MapPin, Package, ShieldCheck, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTaxonomyRegistry } from '@/lib/marketplace/use-taxonomy-registry';
import { BuyerProcurementSection } from '@/components/dashboard/BuyerProcurementSection';
import { ProcurementGateNotice } from '@/components/marketplace/ProcurementGateNotice';
import { evaluateProcurementGate } from '@/lib/marketplace/procurement-gates';
import { getBuyerProcurementContext } from '@/lib/marketplace/procurement-context';

export default function PostRequirementPage() {
  const { isAuthenticated, profile, buyerProfile, user, loading: authLoading, developmentTrustMode } = useAuth();
  const { data: taxonomy } = useTaxonomyRegistry();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdRfqSlug, setCreatedRfqSlug] = useState<string | null>(null);

  const procurementCtx = getBuyerProcurementContext({
    profile,
    buyerProfile,
    emailVerified: Boolean(user?.email_confirmed_at ?? profile?.email),
  });

  const publishGate = evaluateProcurementGate({
    action: 'publish_rfq',
    role: 'buyer',
    currentTrustLevel: procurementCtx.currentTrustLevel,
    profileCompletionPercent: procurementCtx.profileCompletionPercent,
    emailVerified: procurementCtx.emailVerified,
    developmentTrustMode: developmentTrustMode ?? procurementCtx.developmentTrustMode,
  });

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    industryId: '',
    description: '',
    quantity: '',
    unit: 'MT',
    budgetMin: '',
    budgetMax: '',
    deliveryLocation: '',
    deliveryTimeline: '',
    qualitySpecs: '',
    attachmentNote: '',
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep1 = () => {
    if (!form.title.trim()) { setError('Please enter a requirement title'); return false; }
    if (!form.categoryId) { setError('Please select a product category'); return false; }
    if (!form.description.trim()) { setError('Please describe your requirement'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.quantity.trim()) { setError('Please specify quantity'); return false; }
    if (!form.deliveryLocation.trim()) { setError('Please specify delivery location'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    if (!publishGate.allowed && publishGate.hardBlocked) {
      setError(publishGate.message ?? 'Complete your profile before publishing RFQs.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category_id: form.categoryId || null,
          industry_id: form.industryId || null,
          quantity: form.quantity,
          unit: form.unit,
          budget_min: form.budgetMin ? parseInt(form.budgetMin, 10) : null,
          budget_max: form.budgetMax ? parseInt(form.budgetMax, 10) : null,
          delivery_location: form.deliveryLocation,
          delivery_timeline: form.deliveryTimeline,
          quality_specs: form.qualitySpecs,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message ?? 'Failed to post requirement');
        return;
      }

      setCreatedRfqSlug(result.data?.slug ?? null);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post requirement');
    } finally {
      setSaving(false);
    }
  };

  // Success
  if (success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Requirement Posted!</h1>
          <p className="text-sm text-slate-600 mb-6">
            Your requirement &quot;{form.title}&quot; is now live. Verified suppliers will be able to view and respond with quotes.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/marketplace"><Button variant="outline">Browse Marketplace</Button></Link>
            {createdRfqSlug ? (
              <Link href={`/rfq/${createdRfqSlug}`}><Button className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">View RFQ</Button></Link>
            ) : null}
            <Link href="/buyer/requirements"><Button variant="outline">My Requirements</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <Package className="mx-auto h-14 w-14 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a Procurement Requirement</h1>
          <p className="text-slate-500 mb-8">Login or register to post your requirement and receive competitive quotes from verified suppliers.</p>
          <div className="flex justify-center gap-3">
            <Link href="/login?redirect=/post-requirement"><Button variant="outline" className="font-semibold">Login</Button></Link>
            <Link href="/register"><Button className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">Register</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Post Requirement</h1>
            <p className="text-xs text-slate-500">Step {step} of 2</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-16 rounded-full', step >= 1 ? 'bg-blue-500' : 'bg-slate-200')} />
            <div className={cn('h-2 w-16 rounded-full', step >= 2 ? 'bg-blue-500' : 'bg-slate-200')} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <BuyerProcurementSection />
        <ProcurementGateNotice result={publishGate} />

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          {/* STEP 1: What do you need? */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">What do you need?</h2>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Requirement Title *</label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Stainless Steel 304 Sheets, 2mm thick, 500 MT" className="h-11" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Product Category *</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
                    <option value="">Select category</option>
                    {(taxonomy?.categories || []).map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Industry</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={form.industryId} onChange={(e) => update('industryId', e.target.value)}>
                    <option value="">Select industry (optional)</option>
                    {(taxonomy?.industries || []).map((ind) => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Detailed Description *</label>
                <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm min-h-[120px] resize-y" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe specifications, grades, surface finish, tolerances, certifications needed..." />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => { if (validateStep1()) setStep(2); }} className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold h-11 px-8">
                  Next: Quantity & Delivery <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Quantity, Budget, Delivery */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Quantity & Delivery Details</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity *</label>
                  <Input type="number" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} placeholder="e.g. 500" className="h-11" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Unit</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                    <option value="MT">Metric Tons (MT)</option>
                    <option value="KG">Kilograms (KG)</option>
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="SET">Sets</option>
                    <option value="LOT">Lots</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Budget Min (₹)</label>
                  <Input type="number" value={form.budgetMin} onChange={(e) => update('budgetMin', e.target.value)} placeholder="e.g. 40000" className="h-11" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Budget Max (₹)</label>
                  <Input type="number" value={form.budgetMax} onChange={(e) => update('budgetMax', e.target.value)} placeholder="e.g. 55000" className="h-11" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Delivery Location *</label>
                <Input value={form.deliveryLocation} onChange={(e) => update('deliveryLocation', e.target.value)} placeholder="e.g. Mumbai, Maharashtra" className="h-11" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Delivery Timeline</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={form.deliveryTimeline} onChange={(e) => update('deliveryTimeline', e.target.value)}>
                  <option value="">Select timeline</option>
                  <option value="immediate">Immediate (1-3 days)</option>
                  <option value="1-week">Within 1 week</option>
                  <option value="2-weeks">Within 2 weeks</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Quality / Certification Requirements</label>
                <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm min-h-[80px] resize-y" value={form.qualitySpecs} onChange={(e) => update('qualitySpecs', e.target.value)} placeholder="ISO certified, mill test certificates required, etc." />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold h-11 px-8">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <ShieldCheck className="mr-2 h-4 w-4" /> Post Requirement
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Verified suppliers only</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Free to post</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Pan-India delivery</span>
        </div>
      </div>
    </div>
  );
}
