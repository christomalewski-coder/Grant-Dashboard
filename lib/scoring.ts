import { defaultPriorityStates, exclusionKeywords, priorityProjectTags } from '@/data/sourceRegistry';
import { daysUntil } from '@/lib/date';
import { Opportunity, ScoredOpportunity } from '@/lib/types';

function includesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function normalizeCorpus(opportunity: Opportunity): string {
  return [
    opportunity.title,
    opportunity.agency,
    opportunity.programName,
    opportunity.description,
    opportunity.projectTags.join(' '),
    opportunity.eligibilityTags.join(' '),
    opportunity.buyerTypeTags.join(' '),
    opportunity.notes
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function scoreOpportunity(opportunity: Opportunity, states: string[] = defaultPriorityStates): ScoredOpportunity {
  const corpus = normalizeCorpus(opportunity);
  const daysToDeadline = daysUntil(opportunity.dueDate);
  const rationale: string[] = [];
  const exclusionReasons: string[] = [];

  let score = 0;

  const fitHits = opportunity.projectTags.filter((tag) => priorityProjectTags.includes(tag));
  if (fitHits.length > 0) {
    score += Math.min(30, fitHits.length * 6);
    rationale.push(`Project fit hits: ${fitHits.join(', ')}`);
  }

  if (includesAny(corpus, ['public sector', 'municipal', 'school', 'county', 'city', 'community'])) {
    score += 18;
    rationale.push('Public-sector buyer fit');
  }

  if (includesAny(corpus, ['led lighting', 'lighting', 'facility lighting', 'street lighting', 'controls'])) {
    score += 15;
    rationale.push('Direct lighting / controls relevance');
  }

  if (opportunity.state && states.includes(opportunity.state.toUpperCase())) {
    score += 12;
    rationale.push(`Priority geography: ${opportunity.state}`);
  } else if (opportunity.geography === 'Federal' || opportunity.geography === 'Multi-State') {
    score += 8;
    rationale.push('Scalable geography');
  }

  if (opportunity.fundingMax && opportunity.fundingMax >= 250000) {
    score += 10;
    rationale.push('Funding size can support meaningful project scope');
  }

  if (daysToDeadline == null) {
    score += 4;
    rationale.push('No hard deadline listed yet');
  } else if (daysToDeadline > 21 && daysToDeadline <= 120) {
    score += 14;
    rationale.push(`Near-term workable timeline: ${daysToDeadline} days`);
  } else if (daysToDeadline > 120) {
    score += 7;
    rationale.push('Longer-cycle opportunity');
  } else if (daysToDeadline >= 0 && daysToDeadline <= 21) {
    score += 4;
    rationale.push('Fast deadline; requires triage');
  }

  if (opportunity.matchRequired === false) {
    score += 8;
    rationale.push('No match requirement indicated');
  } else if (opportunity.matchRequired === true) {
    score -= 4;
    rationale.push('Match requirement may add friction');
  }

  if (includesAny(corpus, exclusionKeywords)) {
    exclusionReasons.push('Keyword-based exclusion trigger');
    score -= 30;
  }

  if (includesAny(corpus, ['residential']) && !includesAny(corpus, ['public housing', 'community'])) {
    exclusionReasons.push('Primarily residential program');
    score -= 20;
  }

  if (opportunity.status === 'Closed' || (daysToDeadline !== null && daysToDeadline < 0)) {
    exclusionReasons.push('Deadline passed');
    score = Math.max(0, score - 100);
  }

  score = Math.max(0, Math.min(100, score));

  let bucket: ScoredOpportunity['bucket'] = 'Watch';
  if (opportunity.status === 'Closed' || (daysToDeadline !== null && daysToDeadline < 0)) {
    bucket = 'Expired';
  } else if (score >= 70) {
    bucket = 'Pursue';
  } else if (score >= 45) {
    bucket = 'Review';
  }

  const goNoGo: ScoredOpportunity['goNoGo'] = bucket === 'Pursue' || bucket === 'Review' ? 'Go' : 'No-Go';
  const realDeal: ScoredOpportunity['realDeal'] = score >= 60 && exclusionReasons.length === 0 ? 'Real Deal' : 'Not Real Deal';

  return {
    ...opportunity,
    daysToDeadline,
    score,
    bucket,
    goNoGo,
    realDeal,
    rationale,
    exclusionReasons
  };
}
