import { buildGrantDashboard } from '@/lib/pipeline';
import { ActionBucket, OpportunitySource } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseCsvParam(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const states = parseCsvParam(searchParams.get('states'))?.map((item) => item.toUpperCase());
  const sources = parseCsvParam(searchParams.get('sources')) as OpportunitySource[] | undefined;
  const buckets = parseCsvParam(searchParams.get('buckets')) as ActionBucket[] | undefined;
  const statuses = parseCsvParam(searchParams.get('statuses')) as Array<'Open' | 'Forecast' | 'Closed' | 'Rolling' | 'Unknown'> | undefined;
  const search = searchParams.get('search')?.trim() || undefined;

  const data = await buildGrantDashboard({
    states,
    sources,
    buckets,
    statuses,
    search
  });

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
