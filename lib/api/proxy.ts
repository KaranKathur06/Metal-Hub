import { NextResponse } from 'next/server';

type ProxyOptions = {
  backendPath: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
};

export async function proxyToBackend(req: Request, options: ProxyOptions) {
  const method = options.method || 'GET';
  const requestUrl = new URL(req.url);
  const upstreamBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const upstreamUrl = new URL(`/api${options.backendPath}`, upstreamBase);

  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const auth = req.headers.get('authorization');
  if (auth) {
    headers.Authorization = auth;
  }

  let body: string | undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    body = await req.text();
    headers['Content-Type'] = req.headers.get('content-type') || 'application/json';
  }

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method,
      headers,
      body,
      cache: 'no-store',
    });

    const text = await upstreamRes.text();

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: 'Backend unavailable',
      },
      { status: 503 },
    );
  }
}
