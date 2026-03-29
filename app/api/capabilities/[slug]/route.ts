import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  return proxyToBackend(req, { backendPath: `/capabilities/${params.slug}` });
}
