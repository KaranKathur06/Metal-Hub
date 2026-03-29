import { proxyToBackend } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return proxyToBackend(req, { backendPath: '/inquiries' });
}

export async function POST(req: Request) {
  return proxyToBackend(req, { backendPath: '/inquiries', method: 'POST' });
}
