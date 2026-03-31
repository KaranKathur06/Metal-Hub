import { NextResponse } from 'next/server';

type ProxyOptions = {
  backendPath: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
};

type FallbackInquiry = {
  id: string;
  productName: string;
  category: string;
  description: string;
  quantity: string;
  budgetRange: string;
  budget: number;
  location: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  status: 'OPEN';
};

type FallbackSupplier = {
  id: string;
  companyName: string;
  description: string;
  location: string;
  isVerified: boolean;
  rating: number;
  createdAt: string;
  products: Array<{
    id: string;
    productName: string;
    category: string;
    priceRange: string;
    moq: string;
    productionCapacity: string;
  }>;
};

const CATEGORY_DATA = [
  { slug: 'casting', name: 'Casting' },
  { slug: 'forging', name: 'Forging' },
  { slug: 'fabrication', name: 'Fabrication' },
  { slug: 'machining', name: 'Machining' },
  { slug: 'wire-drawing', name: 'Wire Drawing' },
] as const;

const FALLBACK_CAPABILITIES = CATEGORY_DATA.map((item, index) => ({
  id: `cap-${index + 1}`,
  name: item.name,
  slug: item.slug,
  imageUrl: `/capabilities/${item.slug}.jpg`,
  description: `${item.name} services for industrial procurement and sourcing.`,
  isActive: true,
  orderIndex: index + 1,
}));

const LOCATIONS = [
  'Ahmedabad, India',
  'Pune, India',
  'Chennai, India',
  'Mumbai, India',
  'Bengaluru, India',
  'Dubai, UAE',
  'Houston, USA',
  'Berlin, Germany',
  'Singapore',
  'Delhi NCR, India',
];

function daysAgoISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function parseFirstNumber(value: string) {
  const match = value.match(/[\d,.]+/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number.parseFloat(match[0].replace(/,/g, ''));
}

const FALLBACK_INQUIRIES: FallbackInquiry[] = Array.from({ length: 20 }).map((_, index) => {
  const category = CATEGORY_DATA[index % CATEGORY_DATA.length];

  return {
    id: `inq-${index + 1}`,
    productName: `${category.name} requirement ${index + 1}`,
    category: category.slug,
    description: `Industrial requirement for ${category.name.toLowerCase()} with QA reports and committed delivery schedule.`,
    quantity: `${1000 + index * 100} units`,
    budgetRange: `INR ${250 + index * 10} - ${380 + index * 15} per unit`,
    budget: 250 + index * 10,
    location: LOCATIONS[index % LOCATIONS.length],
    urgency: index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
    createdAt: daysAgoISO(index % 30),
    status: 'OPEN',
  };
});

const FALLBACK_SUPPLIERS: FallbackSupplier[] = Array.from({ length: 20 }).map((_, index) => ({
  id: `sup-${index + 1}`,
  companyName: `MetalHub Supplier ${index + 1}`,
  description: 'Export-focused industrial supplier with multi-process manufacturing capability.',
  location: LOCATIONS[(index + 2) % LOCATIONS.length],
  isVerified: index % 2 === 0,
  rating: Number((3.8 + (index % 6) * 0.2).toFixed(1)),
  createdAt: daysAgoISO((index * 2) % 30),
  products: Array.from({ length: 2 + (index % 2) }).map((__, p) => {
    const category = CATEGORY_DATA[(index + p) % CATEGORY_DATA.length];
    return {
      id: `sp-${index + 1}-${p + 1}`,
      productName: `${category.name} product ${index + 1}-${p + 1}`,
      category: category.slug,
      priceRange: `INR ${200 + index * 15 + p * 10} - ${320 + index * 18 + p * 12}`,
      moq: `${120 + index * 20 + p * 25} pcs`,
      productionCapacity: `${4500 + index * 250} pcs/month`,
    };
  }),
}));

function csvParams(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function dateCutoff(date: string | null) {
  if (!date) return null;
  const now = new Date();
  const cutoff = new Date(now);

  if (date === 'last-24h') cutoff.setHours(now.getHours() - 24);
  else if (date === 'last-7d') cutoff.setDate(now.getDate() - 7);
  else if (date === 'last-30d') cutoff.setDate(now.getDate() - 30);
  else return null;

  return cutoff;
}

function getFallbackMarketplaceData(searchParams: URLSearchParams) {
  const type = searchParams.get('type') === 'suppliers' ? 'suppliers' : 'buyers';
  const search = (searchParams.get('search') || '').toLowerCase();
  const categories = csvParams(searchParams, 'category');
  const locations = csvParams(searchParams, 'location');
  const verifiedOnly = searchParams.get('verified') === 'true';
  const moqRange = searchParams.get('moqRange');
  const date = searchParams.get('date');
  const sort = (searchParams.get('sort') || 'latest').toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(20, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10)));
  const cutoff = dateCutoff(date);

  if (type === 'buyers') {
    let rows = [...FALLBACK_INQUIRIES].filter((row) => {
      if (search && !`${row.productName} ${row.description}`.toLowerCase().includes(search)) return false;
      if (categories.length && !categories.includes(row.category.toLowerCase())) return false;
      if (locations.length && !locations.some((loc) => row.location.toLowerCase().includes(loc))) return false;
      if (cutoff && new Date(row.createdAt) < cutoff) return false;
      if (verifiedOnly && Number.parseInt(row.id.split('-')[1], 10) % 2 !== 0) return false;
      return true;
    });

    if (sort === 'price') rows.sort((a, b) => b.budget - a.budget);
    else rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = rows.length;
    const start = (page - 1) * limit;

    return {
      type: 'buyers',
      inquiries: rows.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      meta: { source: 'fallback' },
    };
  }

  let rows = [...FALLBACK_SUPPLIERS].filter((row) => {
    if (search) {
      const text = `${row.companyName} ${row.description} ${row.products.map((p) => p.productName).join(' ')}`.toLowerCase();
      if (!text.includes(search)) return false;
    }

    if (categories.length && !row.products.some((p) => categories.includes(p.category.toLowerCase()))) return false;
    if (locations.length && !locations.some((loc) => row.location.toLowerCase().includes(loc))) return false;
    if (verifiedOnly && !row.isVerified) return false;
    if (cutoff && new Date(row.createdAt) < cutoff) return false;

    if (moqRange) {
      const ok = row.products.some((p) => {
        const value = parseFirstNumber(p.moq);
        if (moqRange === 'lt-100') return value < 100;
        if (moqRange === '100-1000') return value >= 100 && value <= 1000;
        if (moqRange === 'gt-1000') return value > 1000;
        return true;
      });
      if (!ok) return false;
    }

    return true;
  });

  if (sort === 'rating') rows.sort((a, b) => b.rating - a.rating);
  else if (sort === 'verified') rows.sort((a, b) => Number(b.isVerified) - Number(a.isVerified));
  else if (sort === 'price') {
    rows.sort(
      (a, b) =>
        Math.min(...a.products.map((p) => parseFirstNumber(p.priceRange))) -
        Math.min(...b.products.map((p) => parseFirstNumber(p.priceRange))),
    );
  } else {
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = rows.length;
  const start = (page - 1) * limit;

  return {
    type: 'suppliers',
    suppliers: rows.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    meta: { source: 'fallback' },
  };
}

function getFallbackByPath(path: string, searchParams: URLSearchParams) {
  if (path === '/capabilities') {
    return FALLBACK_CAPABILITIES;
  }

  if (path === '/marketplace') {
    return getFallbackMarketplaceData(searchParams);
  }

  if (path.startsWith('/inquiries/')) {
    const id = path.split('/').pop() || '';
    return FALLBACK_INQUIRIES.find((item) => item.id === id) || null;
  }

  if (path.startsWith('/suppliers/')) {
    const id = path.split('/').pop() || '';
    return FALLBACK_SUPPLIERS.find((item) => item.id === id) || null;
  }

  return null;
}

function getBackendBase(requestUrl: URL) {
  const configured =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const raw = configured.trim();

  if (!raw) {
    return process.env.NODE_ENV === 'production'
      ? requestUrl.origin
      : 'http://localhost:5000';
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (raw.startsWith('//')) {
    return `${requestUrl.protocol}${raw}`;
  }

  const isLocal =
    raw.startsWith('localhost') ||
    raw.startsWith('127.0.0.1') ||
    raw.startsWith('0.0.0.0');

  return `${isLocal ? 'http' : 'https'}://${raw}`;
}

export async function proxyToBackend(req: Request, options: ProxyOptions) {
  const method = options.method || 'GET';
  const requestUrl = new URL(req.url);
  const upstreamUrl = new URL(
    `/api${options.backendPath}`,
    getBackendBase(requestUrl),
  );

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

    if (!upstreamRes.ok) {
      const fallback = getFallbackByPath(options.backendPath, requestUrl.searchParams);
      if (fallback) {
        if (options.backendPath.startsWith('/inquiries/') || options.backendPath.startsWith('/suppliers/')) {
          if (!fallback) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
          }
        }

        return NextResponse.json(fallback, {
          status: 200,
          headers: {
            'x-metallhub-fallback': 'true',
          },
        });
      }
    }

    const text = await upstreamRes.text();
    const contentType = upstreamRes.headers.get('content-type') || 'application/json';

    if (!text || text.trim().length === 0) {
      if (contentType.includes('application/json')) {
        return NextResponse.json(
          {
            message: upstreamRes.ok
              ? 'Empty response received from backend.'
              : `Backend request failed (${upstreamRes.status}) with empty payload.`,
          },
          { status: upstreamRes.status || 502 },
        );
      }

      return new NextResponse('', {
        status: upstreamRes.status,
        headers: {
          'Content-Type': contentType,
        },
      });
    }

    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch {
    const fallback = getFallbackByPath(options.backendPath, requestUrl.searchParams);
    if (fallback) {
      return NextResponse.json(fallback, {
        status: 200,
        headers: {
          'x-metallhub-fallback': 'true',
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Backend unavailable',
        hint: 'Ensure backend is running and NEXT_PUBLIC_API_URL is correct.',
      },
      { status: 503 },
    );
  }
}
