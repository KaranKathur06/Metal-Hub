import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(req, { backendPath: `/admin/suppliers/${params.id}/approve`, method: 'POST' });
}
