import { Opportunity } from '@/lib/types';

export const curatedPrograms: Opportunity[] = [
  {
    id: 'indiana-eecbg-2026',
    title: 'Indiana EECBG Funding Opportunity',
    agency: 'Indiana Office of Energy Development',
    programName: 'Energy Efficiency and Conservation Block Grant',
    source: 'state_energy_office_curated',
    sourceUrl: 'https://www.in.gov/oed/grants-and-funding-opportunities/eecbg-program/',
    description:
      'Formula-based energy efficiency and conservation funding for eligible local governments. Strong fit for municipal lighting upgrades, controls, building upgrades, and related public-sector energy projects.',
    status: 'Open',
    postedDate: '2026-02-02',
    updatedDate: '2026-03-01',
    dueDate: '2026-05-15',
    state: 'IN',
    geography: 'State',
    fundingMax: 1000000,
    totalFunding: 1000000,
    matchRequired: false,
    eligibilityTags: ['local governments', 'tribes', 'public sector'],
    projectTags: ['led lighting', 'facility lighting', 'controls', 'energy retrofit', 'municipal'],
    buyerTypeTags: ['municipality', 'public works', 'parks', 'schools'],
    naicsTags: ['238210', '541330', '561210'],
    notes: 'High fit when applicant is an Indiana local government or eligible public entity with shovel-ready lighting scope.'
  },
  {
    id: 'indiana-sep-grants',
    title: 'Indiana State Energy Program Grants',
    agency: 'Indiana Office of Energy Development',
    programName: 'State Energy Program',
    source: 'state_energy_office_curated',
    sourceUrl: 'https://www.in.gov/oed/grants-and-funding-opportunities/oed-grant-programs/',
    description:
      'State energy program funding supporting infrastructure investment, resilience planning, and efficiency projects. Useful feeder source for public-sector retrofit pursuits.',
    status: 'Rolling',
    updatedDate: '2026-01-15',
    state: 'IN',
    geography: 'State',
    matchRequired: false,
    eligibilityTags: ['local governments', 'communities', 'public sector'],
    projectTags: ['energy retrofit', 'facility lighting', 'infrastructure', 'resilience'],
    buyerTypeTags: ['municipality', 'county', 'schools'],
    naicsTags: ['238210', '541330'],
    notes: 'Treat as watch-list feeder until a live NOFO is posted.'
  },
  {
    id: 'naseo-home-energy-rebates',
    title: 'State Home Energy Rebates Program Tracker',
    agency: 'NASEO / State Energy Offices',
    programName: 'HOMES / HEEHR',
    source: 'state_energy_office_curated',
    sourceUrl: 'https://www.naseo.org/topics/home-energy-rebates',
    description:
      'State-by-state rebate rollout visibility. Mostly residential, but still strategically useful as a market signal for state energy office activity and implementation partners.',
    status: 'Rolling',
    geography: 'Multi-State',
    matchRequired: false,
    eligibilityTags: ['state energy offices', 'implementation partners'],
    projectTags: ['rebates', 'energy efficiency', 'program delivery'],
    buyerTypeTags: ['state energy office'],
    naicsTags: ['541611', '561210'],
    notes: 'Usually low direct fit for public lighting sales; better for partnership intelligence than direct pursuit.'
  },
  {
    id: 'dsire-state-incentives',
    title: 'DSIRE State Incentives and Energy Efficiency Programs',
    agency: 'NC Clean Energy Technology Center',
    programName: 'DSIRE',
    source: 'utility_curated',
    sourceUrl: 'https://dsireusa.org/',
    description:
      'Comprehensive incentive and rebate database covering state, local, utility, and federal efficiency programs. Best used as a structured feed source for utility and state rebate pipeline building.',
    status: 'Rolling',
    geography: 'Multi-State',
    matchRequired: false,
    eligibilityTags: ['commercial', 'public sector', 'schools', 'municipal'],
    projectTags: ['utility rebate', 'led lighting', 'controls', 'energy retrofit'],
    buyerTypeTags: ['utility', 'state program administrator', 'municipality'],
    naicsTags: ['238210', '541330', '561210'],
    notes: 'High value source for rebate-style pipeline mapping. Needs state-level source curation to reduce noise.'
  },
  {
    id: 'doe-cmei-exchange',
    title: 'DOE CMEI Funding Opportunities',
    agency: 'U.S. Department of Energy',
    programName: 'DOE CMEI eXCHANGE',
    source: 'doe_exchange_curated',
    sourceUrl: 'https://eere-exchange.energy.gov/',
    description:
      'DOE exchange portal for funding opportunities. Strong strategic value when NOFOs touch public infrastructure, building energy upgrades, resilience, or implementation support.',
    status: 'Rolling',
    geography: 'Federal',
    matchRequired: true,
    eligibilityTags: ['private sector', 'public sector', 'teams', 'consortia'],
    projectTags: ['energy retrofit', 'infrastructure', 'efficiency', 'implementation'],
    buyerTypeTags: ['federal', 'state partners'],
    naicsTags: ['541330', '541690', '561210'],
    notes: 'Usually higher lift, higher ticket, and often partnership-led rather than direct product sale.'
  }
];
