import { curatedPrograms } from '@/lib/sources/curatedPrograms';
import { fetchGrantsGovOpportunities } from '@/lib/sources/grantsGovXml';
import { scoreOpportunity } from '@/lib/scoring';
import { DashboardQuery, DashboardResponse, Opportunity, ScoredOpportunity } from '@/lib/types';

function dedupe(opportunities: Opportunity[]): Opportunity[] {
  const seen = new Set<string>();
  return opportunities.filter((item) => {
    const key = `${item.title.toLowerCase()}|${item.agency.toLowerCase()}|${item.dueDate ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyFilters(opportunities: ScoredOpportunity[], query: DashboardQuery): ScoredOpportunity[] {
  return opportunities.filter((item) => {
    if (query.states?.length && item.state && !query.states.includes(item.state)) return false;
    if (query.sources?.length && !query.sources.includes(item.source)) return false;
    if (query.buckets?.length && !query.buckets.includes(item.bucket)) return false;
    if (query.statuses?.length && !query.statuses.includes(item.status)) return false;
    if (query.search) {
      const haystack = [item.title, item.agency, item.description, item.projectTags.join(' ')].join(' ').toLowerCase();
      if (!haystack.includes(query.search.toLowerCase())) return false;
    }
    return true;
  });
}

export async function buildGrantDashboard(query: DashboardQuery = {}): Promise<DashboardResponse> {
  let grantsGov: Opportunity[] = [];
  try {
    grantsGov = await fetchGrantsGovOpportunities();
  } catch {
    grantsGov = [];
  }

  const unified = dedupe([...grantsGov, ...curatedPrograms]);
  const scored = unified
    .map((item) => scoreOpportunity(item, query.states))
    .sort((a, b) => b.score - a.score || (a.daysToDeadline ?? 9999) - (b.daysToDeadline ?? 9999));

  const filtered = applyFilters(scored, query);

  const totals = {
    total: filtered.length,
    pursue: filtered.filter((item) => item.bucket === 'Pursue').length,
    review: filtered.filter((item) => item.bucket === 'Review').length,
    watch: filtered.filter((item) => item.bucket === 'Watch').length,
    expired: filtered.filter((item) => item.bucket === 'Expired').length,
    go: filtered.filter((item) => item.goNoGo === 'Go').length,
    realDeal: filtered.filter((item) => item.realDeal === 'Real Deal').length
  };

  const sourceSummary = Array.from(
    filtered.reduce((map, item) => {
      map.set(item.source, (map.get(item.source) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).map(([source, count]) => ({ source: source as DashboardResponse['sourceSummary'][number]['source'], count }));

  return {
    refreshedAt: new Date().toISOString(),
    totals,
    opportunities: filtered,
    sourceSummary
  };
}
