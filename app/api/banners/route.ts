import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return proxyToBackend(req, { backendPath: '/banners' });
}
