import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return proxyToBackend(req, { backendPath: '/suppliers/products', method: 'POST' });
}
