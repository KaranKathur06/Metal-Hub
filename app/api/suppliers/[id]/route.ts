import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(req, { backendPath: `/suppliers/${params.id}` });
}
