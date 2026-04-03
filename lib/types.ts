export type OpportunitySource =
  | 'grants_gov_xml'
  | 'doe_exchange_curated'
  | 'state_energy_office_curated'
  | 'utility_curated'
  | 'manual_csv';

export type ActionBucket = 'Pursue' | 'Review' | 'Watch' | 'Expired';
export type DealVerdict = 'Go' | 'No-Go';
export type RealDealVerdict = 'Real Deal' | 'Not Real Deal';

export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  programName?: string;
  source: OpportunitySource;
  sourceUrl: string;
  description: string;
  status: 'Open' | 'Forecast' | 'Closed' | 'Rolling' | 'Unknown';
  postedDate?: string;
  updatedDate?: string;
  dueDate?: string;
  state?: string;
  geography: 'Federal' | 'Multi-State' | 'State' | 'Utility' | 'Local' | 'Unknown';
  fundingMin?: number;
  fundingMax?: number;
  totalFunding?: number;
  awardFloor?: number;
  awardCeiling?: number;
  matchRequired?: boolean;
  eligibilityTags: string[];
  projectTags: string[];
  buyerTypeTags: string[];
  naicsTags: string[];
  notes?: string;
}

export interface ScoredOpportunity extends Opportunity {
  daysToDeadline: number | null;
  score: number;
  bucket: ActionBucket;
  goNoGo: DealVerdict;
  realDeal: RealDealVerdict;
  rationale: string[];
  exclusionReasons: string[];
}

export interface DashboardResponse {
  refreshedAt: string;
  totals: {
    total: number;
    pursue: number;
    review: number;
    watch: number;
    expired: number;
    go: number;
    realDeal: number;
  };
  opportunities: ScoredOpportunity[];
  sourceSummary: {
    source: OpportunitySource;
    count: number;
  }[];
}

export interface DashboardQuery {
  states?: string[];
  sources?: OpportunitySource[];
  buckets?: ActionBucket[];
  statuses?: Opportunity['status'][];
  search?: string;
}
