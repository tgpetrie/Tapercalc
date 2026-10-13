/**
 * presets.js — starting points drawn from published tapering guidance.
 *
 * Every option here is a DRAFT ROUTE to review with a prescriber, never an
 * instruction. The numbers come from guidance written for benzodiazepines;
 * for other medications they do not apply directly.
 *
 * Sources (checked October 2026):
 *  - ASAM-led joint clinical practice guideline on benzodiazepine tapering
 *    (2025; ASAM with nine other societies). As summarized: start with a
 *    5–10% reduction (the first at about 5%); then adjust in steps of 5–10%
 *    every 2–4 weeks; never exceed 25% every 2 weeks; reduce a percentage
 *    of the *current* dose (hyperbolic) rather than the original; microtaper
 *    with liquid formulations is an option; pause or slow for symptoms; the
 *    goal is not always zero. Most recommendations rest on expert consensus.
 *  - Ashton Manual (benzo.org.uk): equal steps in diazepam-equivalent mg —
 *    1 mg every 1–2 weeks under 20 mg/day, 2 mg per step up to 40 mg/day,
 *    0.5 mg steps near the end; the person sets the pace and may hold.
 *  - Benzodiazepine Information Coalition (an advocacy group): not more than
 *    5–10% of the current dose per four weeks; micro-tapers total no more
 *    than 5–10% a month.
 */

export const SOURCES = {
  asam: {
    label: 'ASAM-led joint guideline (2025)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12463782',
  },
  ashton: {
    label: 'Ashton Manual',
    url: 'https://benzo.org.uk/ashtbd',
  },
  bic: {
    label: 'Benzodiazepine Information Coalition',
    url: 'https://www.benzoinfo.com/benzodiazepine-tapering-strategies/',
  },
};

const round2 = (n) => Math.round(n * 100) / 100;

export const PRESETS = [
  {
    id: 'asam-cautious',
    name: 'Cautious',
    line: '5% of what’s left, every 4 weeks',
    why: 'The guideline’s starting point: a first reduction of about 5%, with the steps shrinking as the dose does.',
    source: SOURCES.asam,
    strategy: () => ({ shape: 'percent', percent: 5, intervalDays: 28, distribution: 'step' }),
  },
  {
    id: 'asam-standard',
    name: 'Standard',
    line: '10% of what’s left, every 4 weeks',
    why: 'Inside the guideline’s range of 5–10% steps every 2–4 weeks, and at the limit the Benzodiazepine Information Coalition suggests per four weeks.',
    source: SOURCES.asam,
    strategy: () => ({ shape: 'percent', percent: 10, intervalDays: 28, distribution: 'step' }),
  },
  {
    id: 'asam-quicker',
    name: 'Quicker',
    line: '10% of what’s left, every 2 weeks',
    why: 'The upper end of the guideline’s range. Symptoms are a reason to pause or slow down.',
    source: SOURCES.asam,
    strategy: () => ({ shape: 'percent', percent: 10, intervalDays: 14, distribution: 'step' }),
  },
  {
    id: 'micro',
    name: 'Micro-taper',
    line: '5% a month, in tiny slices',
    why: 'The same pace as Cautious, spread into small daily or weekly slices. The guideline mentions microtapering with liquid formulations; it suits people who are sensitive to larger steps.',
    source: SOURCES.asam,
    strategy: () => ({ shape: 'percent', percent: 5, intervalDays: 28, distribution: 'micro' }),
  },
  {
    id: 'ashton',
    name: 'Equal steps',
    line: 'the same amount off every 2 weeks',
    why: 'A linear taper in the style of the Ashton Manual: 1 mg every 1–2 weeks at under 20 mg a day, about 5% of a 20 mg start. Here each step is 5% of your starting dose, so the last steps are relatively larger.',
    source: SOURCES.ashton,
    strategy: (dose) => ({ shape: 'linear', amount: Math.max(0.01, round2(dose * 0.05)), intervalDays: 14, distribution: 'step' }),
  },
  {
    id: 'ceiling',
    name: 'Fastest the guideline allows',
    line: '25% of what’s left, every 2 weeks',
    why: 'The guideline says reductions should never exceed 25% every 2 weeks. That is a limit, not a target — and symptoms are a reason to pause or slow down.',
    source: SOURCES.asam,
    strategy: () => ({ shape: 'percent', percent: 25, intervalDays: 14, distribution: 'step' }),
  },
];
