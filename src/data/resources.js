export const RESOURCE_CATEGORIES = [
  'Urgent / Crisis Support',
  'Medication / Taper Education',
  'Finding Professional Support',
  'Daily Coping Tools',
  'Support Communities',
  'Printable Tools',
];

export const STARTER_RESOURCES = [
  {
    id: '988-lifeline',
    title: '988 Suicide & Crisis Lifeline',
    category: 'Urgent / Crisis Support',
    description: 'Free 24/7 crisis support in the United States by call, text, or chat.',
    url: 'https://988lifeline.org/',
    sourceName: '988 Lifeline',
    cost: 'free',
    type: 'hotline',
    tags: ['crisis', 'urgent', 'mental health', 'us'],
    region: 'US',
    lastReviewed: '2026-07-07',
  },
  {
    id: 'samhsa-national-helpline',
    title: 'SAMHSA National Helpline',
    category: 'Finding Professional Support',
    description: 'Confidential treatment referral and information service for mental health and substance use support.',
    url: 'https://www.samhsa.gov/find-help/helplines/national-helpline',
    sourceName: 'SAMHSA',
    cost: 'free',
    type: 'organization',
    tags: ['treatment referral', 'mental health', 'substance use', 'us'],
    region: 'US',
    lastReviewed: '2026-07-07',
  },
  {
    id: 'fda-benzodiazepine-safety',
    title: 'FDA Benzodiazepine Safety Communication',
    category: 'Medication / Taper Education',
    description: 'FDA safety information about benzodiazepine risks, dependence, withdrawal, and gradual tapering.',
    url: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-requiring-boxed-warning-updated-improve-safe-use-benzodiazepine-drug-class',
    sourceName: 'FDA',
    cost: 'free',
    type: 'guide',
    tags: ['benzodiazepine', 'withdrawal', 'safety', 'taper'],
    region: 'US',
    lastReviewed: '2026-07-07',
  },
  {
    id: 'asam-benzodiazepine-tapering',
    title: 'ASAM Benzodiazepine Tapering Guideline',
    category: 'Medication / Taper Education',
    description: 'Clinical guideline resource for benzodiazepine tapering and withdrawal-risk reduction.',
    url: 'https://www.asam.org/quality-care/clinical-guidelines/benzodiazepine-tapering',
    sourceName: 'ASAM',
    cost: 'free',
    type: 'guide',
    tags: ['benzodiazepine', 'clinical guideline', 'taper', 'prescriber'],
    region: 'US',
    lastReviewed: '2026-07-07',
  },
  {
    id: 'compass-appointment-questions',
    title: 'Appointment Question Sheet',
    category: 'Printable Tools',
    description: 'Internal Compass worksheet concept for preparing taper questions before a clinical appointment.',
    url: '',
    sourceName: 'Compass',
    cost: 'free',
    type: 'worksheet',
    tags: ['printable', 'appointment', 'questions'],
    region: 'Global',
    lastReviewed: '2026-07-07',
  },
];

export function filterResources(resources, query = '', category = 'All') {
  const normalizedQuery = query.trim().toLowerCase();
  return resources.filter((resource) => {
    const matchesCategory = category === 'All' || resource.category === category;
    const matchesQuery = !normalizedQuery || [
      resource.title,
      resource.category,
      resource.description,
      resource.sourceName,
      ...(resource.tags || []),
    ].join(' ').toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}
