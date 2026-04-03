export const priorityProjectTags = [
  'led lighting',
  'sports lighting',
  'street lighting',
  'parking lot lighting',
  'facility lighting',
  'controls',
  'energy retrofit',
  'esco',
  'municipal',
  'school',
  'public sector',
  'roadway',
  'infrastructure'
];

export const exclusionKeywords = [
  'solar only',
  'residential only',
  'vehicle purchase only',
  'academic research only',
  'biomedical',
  'healthcare services',
  'farmland',
  'arts and culture',
  'wildlife only'
];

export const defaultPriorityStates = (process.env.PRIORITY_STATES ?? 'IN,TX,AR,AL,MT')
  .split(',')
  .map((item) => item.trim().toUpperCase())
  .filter(Boolean);
