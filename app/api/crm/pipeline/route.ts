/**
 * Metal Hub — CRM Pipeline API Route
 *
 * GET /api/crm/pipeline    → Get leads grouped by stage with aggregates
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST'] as const;

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.CRM_PIPELINE],
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const pipeline: Record<string, { leads: any[]; count: number; totalValue: number }> = {};

  // Fetch all active leads grouped by stage
  for (const stage of STAGES) {
    const { data, count } = await auth.supabase
      .from('leads')
      .select('id, company_name, contact_name, contact_email, deal_value, probability, assigned_to, next_follow_up, created_at, updated_at', { count: 'exact' })
      .eq('stage', stage)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(50);

    const leads = data || [];
    const totalValue = leads.reduce((sum, lead) => sum + (parseFloat(lead.deal_value) || 0), 0);

    pipeline[stage] = {
      leads,
      count: count || 0,
      totalValue,
    };
  }

  // Aggregates
  const totalLeads = Object.values(pipeline).reduce((sum, stage) => sum + stage.count, 0);
  const totalPipelineValue = Object.values(pipeline).reduce((sum, stage) => sum + stage.totalValue, 0);
  const convertedCount = pipeline.CONVERTED?.count || 0;
  const lostCount = pipeline.LOST?.count || 0;
  const winRate = (convertedCount + lostCount) > 0
    ? Math.round((convertedCount / (convertedCount + lostCount)) * 100)
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      pipeline,
      aggregates: {
        totalLeads,
        totalPipelineValue,
        convertedCount,
        lostCount,
        winRate,
      },
    },
  });
}
