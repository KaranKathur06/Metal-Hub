'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ImagePlus, Layers, ShieldCheck, RefreshCw, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';

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
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [pendingSuppliers, setPendingSuppliers] = useState<Supplier[]>([]);

  const [bannerForm, setBannerForm] = useState(defaultBannerForm);
  const [capabilityForm, setCapabilityForm] = useState(defaultCapabilityForm);

  const authHeaders = useMemo(() => {
    const base: Record<string, string> = {};
    if (token) {
      base.Authorization = `Bearer ${token}`;
    }
    return base;
  }, [token]);

  const loadDashboard = async () => {
    const response = await fetch('/api/admin/dashboard', {
      headers: authHeaders,
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to load dashboard');
    setStats(data);
  };

  const loadBanners = async () => {
    const response = await fetch('/api/admin/banners', {
      headers: authHeaders,
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to load banners');
    setBanners(Array.isArray(data) ? data : []);
  };

  const loadCapabilities = async () => {
    const response = await fetch('/api/admin/capabilities', {
      headers: authHeaders,
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to load capabilities');
    setCapabilities(Array.isArray(data) ? data : []);
  };

  const loadPendingSuppliers = async () => {
    const response = await fetch('/api/admin/suppliers/pending', {
      headers: authHeaders,
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to load suppliers');
    setPendingSuppliers(data?.suppliers || []);
  };

  const loadAll = async () => {
    if (!token) return;

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
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const createBanner = async () => {
    if (!bannerForm.title || !bannerForm.subtitle || !bannerForm.imageUrl) return;

    const response = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bannerForm),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data?.message || 'Failed to create banner');
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
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(capabilityForm),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data?.message || 'Failed to create capability');
      return;
    }

    setCapabilityForm(defaultCapabilityForm);
    await loadCapabilities();
    await loadDashboard();
  };

  const toggleBanner = async (banner: Banner) => {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });

    await loadBanners();
  };

  const toggleCapability = async (capability: Capability) => {
    await fetch(`/api/admin/capabilities/${capability.id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: !capability.isActive }),
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
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: next.map((item) => item.id) }),
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
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: next.map((item) => item.id) }),
    });

    await loadCapabilities();
  };

  const removeBanner = async (id: string) => {
    await fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    await loadBanners();
    await loadDashboard();
  };

  const removeCapability = async (id: string) => {
    await fetch(`/api/admin/capabilities/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    await loadCapabilities();
    await loadDashboard();
  };

  const approveSupplier = async (id: string) => {
    await fetch(`/api/admin/suppliers/${id}/approve`, {
      method: 'POST',
      headers: authHeaders,
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

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Admin Marketplace Control</h1>
          <p className="mt-2 text-muted-foreground">Manage hero banners, capabilities, and supplier approvals.</p>
        </div>
        <Button variant="outline" onClick={loadAll} disabled={!token || loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Access Token</CardTitle>
          <CardDescription>
            Paste a valid admin JWT to manage marketplace content and approvals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            placeholder="Bearer token"
            value={token}
            onChange={(event) => setToken(event.target.value.trim())}
          />
        </CardContent>
      </Card>

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
                <Button onClick={createBanner} disabled={!token}>Create Banner</Button>
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
                <Button onClick={createCapability} disabled={!token}>Create Capability</Button>
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
                  <Button onClick={() => approveSupplier(supplier.id)} disabled={!token}>
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


