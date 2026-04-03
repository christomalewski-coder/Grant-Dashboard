import { Opportunity } from '@/lib/types';

const DEFAULT_XML_URL = 'https://www.grants.gov/extract/GrantsDBExtractLatestVersion2.zip';

function xmlValue(block: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(regex);
  return match?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

function normalizeText(input?: string): string {
  return (input ?? '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function shouldKeepOpportunity(text: string): boolean {
  const haystack = text.toLowerCase();
  const keepKeywords = [
    'energy efficiency',
    'lighting',
    'streetlight',
    'street light',
    'facility',
    'building upgrade',
    'retrofit',
    'esco',
    'municipal',
    'infrastructure',
    'public works',
    'grid',
    'resilience',
    'community energy'
  ];

  const hardExclusions = [
    'biomedical',
    'healthcare delivery',
    'behavioral health',
    'farmland',
    'museum',
    'humanities',
    'arts',
    'wildlife'
  ];

  const hasKeepKeyword = keepKeywords.some((keyword) => haystack.includes(keyword));
  const hasExclusion = hardExclusions.some((keyword) => haystack.includes(keyword));
  return hasKeepKeyword && !hasExclusion;
}

function parseGrantsXml(xml: string): Opportunity[] {
  const synopsisBlocks = xml.match(/<OpportunitySynopsisDetail_1_0>[\s\S]*?<\/OpportunitySynopsisDetail_1_0>/g) ?? [];

  return synopsisBlocks
    .map((block) => {
      const title = normalizeText(xmlValue(block, 'OpportunityTitle'));
      const agency = normalizeText(xmlValue(block, 'AgencyName')) || 'Federal Agency';
      const opportunityId = normalizeText(xmlValue(block, 'OpportunityID')) || crypto.randomUUID();
      const description = normalizeText(xmlValue(block, 'Description'));
      const closeDate = normalizeText(xmlValue(block, 'CloseDate'));
      const postDate = normalizeText(xmlValue(block, 'PostDate'));
      const lastUpdatedDate = normalizeText(xmlValue(block, 'LastUpdatedDate'));
      const awardCeiling = Number(xmlValue(block, 'AwardCeiling') ?? '');
      const awardFloor = Number(xmlValue(block, 'AwardFloor') ?? '');
      const fundingActivity = normalizeText(xmlValue(block, 'CategoryOfFundingActivity'));
      const opportunityNumber = normalizeText(xmlValue(block, 'FundingOpportunityNumber'));
      const url = opportunityNumber
        ? `https://www.grants.gov/search-results-detail/${opportunityId}`
        : 'https://www.grants.gov/';

      const fullText = [title, agency, description, fundingActivity].join(' ');
      if (!shouldKeepOpportunity(fullText)) return null;

      const status: Opportunity['status'] =
        closeDate && new Date(closeDate).getTime() < Date.now() ? 'Closed' : 'Open';

      const lower = fullText.toLowerCase();
      const projectTags = [
        lower.includes('lighting') ? 'led lighting' : '',
        lower.includes('street') ? 'street lighting' : '',
        lower.includes('facility') || lower.includes('building') ? 'facility lighting' : '',
        lower.includes('retrofit') ? 'energy retrofit' : '',
        lower.includes('esco') ? 'esco' : '',
        lower.includes('infrastructure') ? 'infrastructure' : '',
        lower.includes('community') ? 'public sector' : ''
      ].filter(Boolean);

      return {
        id: `grants-${opportunityId}`,
        title,
        agency,
        programName: opportunityNumber,
        source: 'grants_gov_xml' as const,
        sourceUrl: url,
        description: description || fundingActivity || title,
        status,
        postedDate: postDate || undefined,
        updatedDate: lastUpdatedDate || undefined,
        dueDate: closeDate || undefined,
        geography: 'Federal' as const,
        awardFloor: Number.isFinite(awardFloor) ? awardFloor : undefined,
        awardCeiling: Number.isFinite(awardCeiling) ? awardCeiling : undefined,
        fundingMin: Number.isFinite(awardFloor) ? awardFloor : undefined,
        fundingMax: Number.isFinite(awardCeiling) ? awardCeiling : undefined,
        matchRequired: undefined,
        eligibilityTags: ['federal applicants'],
        projectTags: projectTags.length ? projectTags : ['energy retrofit'],
        buyerTypeTags: ['federal', 'state partner', 'community'],
        naicsTags: ['541330', '561210'],
        notes: fundingActivity || undefined
      } satisfies Opportunity;
    })
    .filter((item): item is Opportunity => Boolean(item));
}

async function unzipFirstXml(zipBuffer: ArrayBuffer): Promise<string> {
  const bytes = Buffer.from(zipBuffer);
  const signature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  const start = bytes.indexOf(signature);
  if (start === -1) {
    throw new Error('ZIP signature not found in Grants.gov extract.');
  }

  // Lightweight unzip via native DecompressionStream is not available in Node here.
  // Vercel Node runtime includes zlib, but ZIP is not gzip. We parse the first local file header.
  const compressionMethod = bytes.readUInt16LE(start + 8);
  const compressedSize = bytes.readUInt32LE(start + 18);
  const fileNameLength = bytes.readUInt16LE(start + 26);
  const extraFieldLength = bytes.readUInt16LE(start + 28);
  const dataStart = start + 30 + fileNameLength + extraFieldLength;
  const fileData = bytes.subarray(dataStart, dataStart + compressedSize);

  if (compressionMethod !== 8) {
    throw new Error(`Unsupported ZIP compression method: ${compressionMethod}`);
  }

  const zlib = await import('zlib');
  return zlib.inflateRawSync(fileData).toString('utf8');
}

export async function fetchGrantsGovOpportunities(): Promise<Opportunity[]> {
  const xmlUrl = process.env.GRANTS_GOV_XML_URL || DEFAULT_XML_URL;
  const response = await fetch(xmlUrl, {
    headers: {
      'User-Agent': 'grant-opportunity-dashboard/1.0'
    },
    next: { revalidate: 60 * 60 * 6 }
  });

  if (!response.ok) {
    throw new Error(`Grants.gov XML fetch failed with status ${response.status}`);
  }

  const zipBuffer = await response.arrayBuffer();
  const xml = await unzipFirstXml(zipBuffer);
  return parseGrantsXml(xml).slice(0, 250);
}
