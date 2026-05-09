'use client';

import { useOps } from '@/lib/ops/ops-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OpsRedirectPage() {
  const { mode } = useOps();
  const router = useRouter();

  useEffect(() => {
    router.replace(mode === 'crm' ? '/ops/crm' : '/ops/admin');
  }, [mode, router]);

  return null;
}
