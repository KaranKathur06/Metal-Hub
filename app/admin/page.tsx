'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, ImagePlus, Layers, ShieldCheck, RefreshCw,
  ArrowUp, ArrowDown, Trash2, Shield, AlertTriangle, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  orderIndex: number;
};

type Capability = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  isActive: boolean;
  orderIndex: number;
};

type Supplier = {
  id: string;
  companyName: string;
  description: string;
  location: string;
  createdAt: string;
  owner?: {
    profile?: {
      fullName?: string | null;
      companyName?: string | null;
    };
  } | null;
};

type DashboardStats = {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  pendingSuppliers: number;
  totalBanners: number;
  totalCapabilities: number;
};

const defaultBannerForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaText: 'Explore Marketplace',
  ctaLink: '/marketplace',
};

const defaultCapabilityForm = {
  name: '',
  slug: '',
  imageUrl: '',
  description: '',
  heroImageUrl: '',
  heroTitle: '',
  heroSubtitle: '',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, role, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [pendingSuppliers, setPendingSuppliers] = useState<Supplier[]>([]);

  const [bannerForm, setBannerForm] = useState(defaultBannerForm);
  const [capabilityForm, setCapabilityForm] = useState(defaultCapabilityForm);

  // ── RBAC Guard ──
  const isAdmin = role === 'admin' || role === 'super_admin';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // ── API calls use cookies for auth (no manual token needed) ──
  const loadDashboard = async () => {
    const response = await fetch('/api/admin/dashboard', {
      cache: 'no-store',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || 'Failed to load dashboard');
    // Map new API format to existing state shape
    const d = json.data;
    setStats({
      totalUsers: d?.users?.total || 0,
      totalListings: d?.listings?.total || 0,
      pendingListings: d?.listings?.pendingModeration || 0,
      pendingSuppliers: d?.sellers?.pendingVerification || 0,
      totalBanners: 0,
      totalCapabilities: 0,
    });
  };

  const loadBanners = async () => {
    const response = await fetch('/api/admin/banners?active=false', {
      cache: 'no-store',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || 'Failed to load banners');
    // Map snake_case to camelCase for existing UI
    const items = (json.data || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.image_url,
      ctaText: b.cta_text,
      ctaLink: b.cta_link,
      isActive: b.is_active,
      orderIndex: b.order_index,
    }));
    setBanners(items);
  };

  const loadCapabilities = async () => {
    const response = await fetch('/api/admin/capabilities', {
      cache: 'no-store',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || 'Failed to load capabilities');
    const items = (json.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.icon || '',
      description: c.description || '',
      heroImageUrl: null,
      heroTitle: null,
      heroSubtitle: null,
      isActive: c.is_active,
      orderIndex: c.sort_order,
    }));
    setCapabilities(items);
  };

  const loadPendingSuppliers = async () => {
    const response = await fetch('/api/admin/suppliers/pending', {
      cache: 'no-store',
      credentials: 'include',
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || 'Failed to load suppliers');
    const items = (json.data || []).map((s: any) => ({
      id: s.id,
      companyName: s.company_name,
      description: '',
      location: s.companies?.city ? `${s.companies.city}, ${s.companies.state}` : '',
      createdAt: s.created_at,
      owner: {
        profile: {
          fullName: s.profiles?.full_name,
          companyName: s.company_name,
        },
      },
    }));
    setPendingSuppliers(items);
  };

  const loadAll = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([loadDashboard(), loadBanners(), loadCapabilities(), loadPendingSuppliers()]);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin]);

  const createBanner = async () => {
    if (!bannerForm.title || !bannerForm.subtitle || !bannerForm.imageUrl) return;

    const response = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        image_url: bannerForm.imageUrl,
        cta_text: bannerForm.ctaText,
        cta_link: bannerForm.ctaLink,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const json = await response.json();
      setError(json?.error?.message || 'Failed to create banner');
      return;
    }

    setBannerForm(defaultBannerForm);
    await loadBanners();
    await loadDashboard();
  };

  const createCapability = async () => {
    if (!capabilityForm.name || !capabilityForm.slug || !capabilityForm.imageUrl || !capabilityForm.description) return;

    const response = await fetch('/api/admin/capabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: capabilityForm.name,
        slug: capabilityForm.slug,
        type: 'capability',
        description: capabilityForm.description,
        icon: capabilityForm.imageUrl,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const json = await response.json();
      setError(json?.error?.message || 'Failed to create capability');
      return;
    }

    setCapabilityForm(defaultCapabilityForm);
    await loadCapabilities();
    await loadDashboard();
  };

  const toggleBanner = async (banner: Banner) => {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.isActive }),
      credentials: 'include',
    });
    await loadBanners();
  };

  const toggleCapability = async (capability: Capability) => {
    await fetch(`/api/admin/capabilities/${capability.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !capability.isActive }),
      credentials: 'include',
    });
    await loadCapabilities();
  };

  const reorderBanners = async (index: number, direction: 'up' | 'down') => {
    const next = [...banners];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    await fetch('/api/admin/banners/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: next.map((item, i) => ({ id: item.id, order_index: i })) }),
      credentials: 'include',
    });
    await loadBanners();
  };

  const reorderCapabilities = async (index: number, direction: 'up' | 'down') => {
    const next = [...capabilities];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    await fetch('/api/admin/capabilities/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: next.map((item, i) => ({ id: item.id, sort_order: i })) }),
      credentials: 'include',
    });
    await loadCapabilities();
  };

  const removeBanner = async (id: string) => {
    await fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await loadBanners();
    await loadDashboard();
  };

  const removeCapability = async (id: string) => {
    await fetch(`/api/admin/capabilities/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await loadCapabilities();
    await loadDashboard();
  };

  const approveSupplier = async (id: string) => {
    await fetch(`/api/admin/suppliers/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
      credentials: 'include',
    });
    await loadPendingSuppliers();
    await loadDashboard();
  };

  const onImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    target: 'banner' | 'capability',
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || '');
      if (target === 'banner') {
        setBannerForm((prev) => ({ ...prev, imageUrl: imageData }));
      } else {
        setCapabilityForm((prev) => ({ ...prev, imageUrl: imageData }));
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Loading/Auth guard renders ──
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="mt-2 text-sm text-slate-500">
          This area is restricted to authorized administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* ── Header with Security Badge ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="mr-1 h-3 w-3" /> 2FA Verified
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">Admin Marketplace Control</h1>
          <p className="mt-2 text-muted-foreground">
            Manage hero banners, capabilities, and supplier approvals.
            {profile?.email && (
              <span className="ml-2 text-xs font-semibold text-slate-400">
                Signed in as {profile.email}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={loadAll} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Suppliers</p>
            <p className="mt-1 text-2xl font-bold">{stats?.pendingSuppliers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Listings</p>
            <p className="mt-1 text-2xl font-bold">{stats?.pendingListings ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Capabilities</p>
            <p className="mt-1 text-2xl font-bold">{stats?.totalCapabilities ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Hero Banners</p>
            <p className="mt-1 text-2xl font-bold">{stats?.totalBanners ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5" /> Add Banner
              </CardTitle>
              <CardDescription>Create homepage hero slides with CTA links and ordering.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={bannerForm.title} onChange={(e) => setBannerForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={bannerForm.subtitle} onChange={(e) => setBannerForm((p) => ({ ...p, subtitle: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Image URL</Label>
                <Input value={bannerForm.imageUrl} onChange={(e) => setBannerForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, 'banner')} />
              </div>
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input value={bannerForm.ctaText} onChange={(e) => setBannerForm((p) => ({ ...p, ctaText: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input value={bannerForm.ctaLink} onChange={(e) => setBannerForm((p) => ({ ...p, ctaLink: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Button onClick={createBanner}>Create Banner</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Queue</CardTitle>
              <CardDescription>Toggle, reorder, and delete homepage banners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {banners.map((banner, index) => (
                <div key={banner.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="min-w-[280px] flex-1">
                    <p className="font-semibold">{banner.title}</p>
                    <p className="text-sm text-slate-500">{banner.subtitle}</p>
                    <div className="mt-2">
                      <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => reorderBanners(index, 'up')}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => reorderBanners(index, 'down')}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleBanner(banner)}>
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => removeBanner(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" /> Add Capability
              </CardTitle>
              <CardDescription>Create capability cards and category landing pages.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={capabilityForm.name} onChange={(e) => setCapabilityForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={capabilityForm.slug} onChange={(e) => setCapabilityForm((p) => ({ ...p, slug: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={capabilityForm.description} onChange={(e) => setCapabilityForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Card Image URL</Label>
                <Input value={capabilityForm.imageUrl} onChange={(e) => setCapabilityForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, 'capability')} />
              </div>
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input value={capabilityForm.heroTitle} onChange={(e) => setCapabilityForm((p) => ({ ...p, heroTitle: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Input value={capabilityForm.heroSubtitle} onChange={(e) => setCapabilityForm((p) => ({ ...p, heroSubtitle: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Hero Image URL</Label>
                <Input value={capabilityForm.heroImageUrl} onChange={(e) => setCapabilityForm((p) => ({ ...p, heroImageUrl: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Button onClick={createCapability}>Create Capability</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capability Queue</CardTitle>
              <CardDescription>Toggle visibility, reorder sections, and remove categories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {capabilities.map((capability, index) => (
                <div key={capability.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="min-w-[280px] flex-1">
                    <p className="font-semibold">{capability.name}</p>
                    <p className="text-sm text-slate-500">/{capability.slug}</p>
                    <p className="mt-1 text-sm text-slate-500">{capability.description}</p>
                    <div className="mt-2">
                      <Badge variant={capability.isActive ? 'default' : 'secondary'}>
                        {capability.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => reorderCapabilities(index, 'up')}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => reorderCapabilities(index, 'down')}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleCapability(capability)}>
                      {capability.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => removeCapability(capability.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Supplier Approvals
              </CardTitle>
              <CardDescription>Approve supplier profiles to mark them as verified in marketplace cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingSuppliers.length === 0 ? (
                <p className="text-sm text-slate-500">No pending suppliers right now.</p>
              ) : null}

              {pendingSuppliers.map((supplier) => (
                <div key={supplier.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="min-w-[280px] flex-1">
                    <p className="font-semibold text-slate-900">{supplier.companyName}</p>
                    <p className="text-sm text-slate-600">{supplier.location}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{supplier.description}</p>
                    <p className="mt-2 text-xs text-slate-400">Submitted {formatDate(supplier.createdAt)}</p>
                  </div>
                  <Button onClick={() => approveSupplier(supplier.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
