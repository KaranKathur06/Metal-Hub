"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuyerProcurementSection } from "@/components/dashboard/BuyerProcurementSection";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTaxonomyRegistry } from "@/lib/marketplace/use-taxonomy-registry";

export default function BuyerOnboardingPage() {
  const router = useRouter();
  const { profile, isAuthenticated, loading } = useAuth();
  const { data: taxonomy } = useTaxonomyRegistry();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    procurementCategoryId: "",
    annualProcurementVolume: "",
    businessType: "",
  });

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Failed to save profile");
        return;
      }
      router.push("/buyer/requirements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-16 text-center text-slate-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <p className="mb-4 text-slate-600">Login to set up your buyer procurement profile.</p>
        <Link href="/login?redirect=/onboarding/buyer">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-slate-900">Buyer profile setup</h1>
          <p className="mt-1 text-sm text-slate-600">
            Improve procurement trust before publishing high-value RFQs.
          </p>
        </div>
      </div>

      <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Building2 className="h-5 w-5 text-blue-600" />
            Company identity
          </h2>
          <div className="mt-6 space-y-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Company name *</label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Procurement category</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.procurementCategoryId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, procurementCategoryId: e.target.value }))
                }
              >
                <option value="">Select category</option>
                {(taxonomy?.categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Annual procurement volume
              </label>
              <Input
                value={form.annualProcurementVolume}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, annualProcurementVolume: e.target.value }))
                }
                placeholder="e.g. INR 5–10 Cr"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Business type</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.businessType}
                onChange={(e) => setForm((prev) => ({ ...prev, businessType: e.target.value }))}
              >
                <option value="">Select type</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="trader">Trader</option>
                <option value="oem">OEM</option>
              </select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="font-bold">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save buyer profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <BuyerProcurementSection />
      </div>
    </div>
  );
}
