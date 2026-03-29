import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(req, { backendPath: `/admin/banners/${params.id}`, method: 'PUT' });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(req, { backendPath: `/admin/banners/${params.id}`, method: 'DELETE' });
}
