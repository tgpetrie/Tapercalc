/**
 * drugClasses.js — what Compass can honestly say for each kind of medication.
 *
 * The rule: a draft route is offered only where published guidance exists,
 * and only with that guidance's own figures and a link to it. Where evidence
 * is thin, the choice is a record, plus a clearly-labelled draft at most.
 * Where stopping on your own can be dangerous, no route is offered at all.
 *
 * Checked October 2026 against: CDC 2022 opioid guideline (via CDC Stacks),
 * NICE NG222 (via BJGP Life), bpac NZ gabapentinoid deprescribing (2024),
 * a 2021 systematic review of stimulant discontinuation (Frontiers in
 * Psychiatry), MedlinePlus on alcohol withdrawal, SAMHSA National Helpline.
 * Z-drugs, barbiturates, steroids, beta-blockers and others are NOT covered
 * because no guidance was verified for them.
 */
import { PRESETS, SOURCES as BZD_SOURCES } from './presets.js';

export const SAMHSA = {
  label: 'SAMHSA National Helpline',
  url: 'https://www.samhsa.gov/find-help/national-helpline',
  phone: '1-800-662-4357',
  tel: 'tel:18006624357',
};

const S = {
  cdc: { label: 'CDC opioid guideline (2022)', url: 'https://stacks.cdc.gov/view/cdc/153603' },
  nice: { label: 'NICE NG222', url: 'https://www.nice.org.uk/guidance/ng222' },
  bpac: { label: 'bpacnz: deprescribing gabapentinoids (2024)', url: 'https://bpac.org.nz/2024/deprescribing-gabapentin.aspx' },
  stim: { label: 'Systematic review of stimulant discontinuation (2021)', url: 'https://frontiersin.org/articles/10.3389/fpsyt.2021.642798/full' },
  alcohol: { label: 'MedlinePlus: alcohol withdrawal', url: 'https://medlineplus.gov/ency/article/000764.htm' },
};

const pct = (percent, intervalDays, distribution = 'step') => () =>
  ({ shape: 'percent', percent, intervalDays, distribution });

export const CLASSES = {
  benzodiazepine: {
    label: 'Benzodiazepine',
    names: ['alprazolam', 'xanax', 'diazepam', 'valium', 'lorazepam', 'ativan', 'clonazepam', 'klonopin', 'temazepam', 'restoril', 'oxazepam', 'chlordiazepoxide', 'librium', 'clobazam'],
    level: 'guideline',
    intro: 'There is detailed published guidance for tapering benzodiazepines. These options come from it.',
    presets: PRESETS,
  },
  opioid: {
    label: 'Opioid pain medicine',
    names: ['oxycodone', 'oxycontin', 'percocet', 'hydrocodone', 'vicodin', 'norco', 'morphine', 'codeine', 'tramadol', 'ultram', 'hydromorphone', 'dilaudid', 'oxymorphone', 'tapentadol', 'fentanyl patch'],
    level: 'guideline',
    intro: 'The CDC’s 2022 guideline says opioids should not be stopped abruptly or reduced rapidly. For people who have taken them for a year or more, it says tapers of 10% per month or slower are likely to be better tolerated than faster ones, and that a taper can be paused and may need to slow at low doses.',
    caution: 'If you take methadone or buprenorphine as part of treatment for opioid use disorder, don’t change your dose without your treatment team.',
    presets: [
      { id: 'cdc-10', name: 'Monthly', line: '10% of what’s left, every 4 weeks', why: 'The guideline’s benchmark for long-term use: 10% a month or slower.', source: S.cdc, strategy: pct(10, 28) },
      { id: 'cdc-5', name: 'Slower', line: '5% of what’s left, every 4 weeks', why: 'Slower than the benchmark, which the guideline says is likely to be better tolerated.', source: S.cdc, strategy: pct(5, 28) },
    ],
  },
  antidepressant: {
    label: 'Antidepressant',
    names: ['sertraline', 'zoloft', 'fluoxetine', 'prozac', 'escitalopram', 'lexapro', 'citalopram', 'celexa', 'paroxetine', 'paxil', 'venlafaxine', 'effexor', 'duloxetine', 'cymbalta', 'desvenlafaxine', 'pristiq', 'mirtazapine', 'remeron', 'amitriptyline', 'nortriptyline', 'bupropion', 'wellbutrin', 'trazodone', 'fluvoxamine'],
    level: 'guideline',
    intro: 'NICE recommends hyperbolic reductions for antidepressants — each cut a share of the current dose — and notes that after long-term use tapering often takes months or even years. It doesn’t fix one percentage: the rate should be individualised, starting with a test reduction, with extra care over the last few milligrams.',
    presets: [
      { id: 'ad-10', name: 'Monthly', line: '10% of what’s left, every 4 weeks', why: 'A hyperbolic draft to adjust after a test reduction. The percentage is a starting point for discussion, not a figure from the guideline.', source: S.nice, strategy: pct(10, 28) },
      { id: 'ad-5', name: 'Slower', line: '5% of what’s left, every 4 weeks', why: 'For people who are sensitive to reductions or have taken it for a long time. Again a starting point, not a figure from the guideline.', source: S.nice, strategy: pct(5, 28) },
      { id: 'ad-micro', name: 'Micro-taper', line: '5% a month, in tiny slices', why: 'The same slow pace spread into small slices, which suits people who are sensitive to larger steps.', source: S.nice, strategy: pct(5, 28, 'micro') },
    ],
  },
  gabapentinoid: {
    label: 'Gabapentin or pregabalin',
    names: ['gabapentin', 'neurontin', 'gralise', 'pregabalin', 'lyrica'],
    level: 'guideline',
    intro: 'A 2024 deprescribing guide from bpacnz suggests reducing by 5–10% of the current dose every two to six weeks. Some people tolerate up to 25% per step and others need slower. Symptoms are a reason to hold or slow down.',
    presets: [
      { id: 'gaba-gentle', name: 'Gentle', line: '5% of what’s left, every 4 weeks', why: 'The low end of the suggested 5–10%, mid-range on timing.', source: S.bpac, strategy: pct(5, 28) },
      { id: 'gaba-standard', name: 'Standard', line: '10% of what’s left, every 4 weeks', why: 'The upper end of the suggested 5–10% every two to six weeks.', source: S.bpac, strategy: pct(10, 28) },
      { id: 'gaba-quicker', name: 'Quicker', line: '10% of what’s left, every 2 weeks', why: 'The fastest of the suggested range of 5–10% every two to six weeks.', source: S.bpac, strategy: pct(10, 14) },
    ],
  },
  stimulant: {
    label: 'Stimulant (ADHD medicine)',
    names: ['adderall', 'amphetamine', 'dextroamphetamine', 'dexedrine', 'methylphenidate', 'ritalin', 'concerta', 'focalin', 'vyvanse', 'lisdexamfetamine', 'evekeo', 'mydayis'],
    level: 'limited',
    intro: 'No tapering schedule has been shown to be evidence-based for stimulants. A 2021 review found some people stop with no rebound or withdrawal symptoms, while most whose symptoms were going to return saw them within about two weeks. It describes a gradual taper over weeks to months as a clinical precaution, not a tested protocol. Ask your prescriber what makes sense for you.',
    presets: [
      { id: 'stim-gradual', name: 'Gradual step-down', line: 'a fifth of today’s dose off every 2 weeks', why: 'About ten weeks in all — in the “weeks to months” the review describes. A draft to discuss, not a tested schedule.', source: S.stim, strategy: (dose) => ({ shape: 'linear', amount: Math.max(0.01, Math.round(dose * 0.2 * 100) / 100), intervalDays: 14, distribution: 'step' }) },
    ],
  },
  alcohol: {
    label: 'Alcohol',
    names: ['alcohol', 'beer', 'wine', 'liquor', 'vodka', 'whiskey', 'whisky', 'drinking'],
    level: 'supervised',
    source: S.alcohol,
  },
  other: {
    label: 'Something else',
    names: [],
    level: 'none',
    intro: 'Compass doesn’t have verified tapering guidance for this one yet, so it won’t draw a route. It can keep a record of your doses and days, and the summary page is useful to bring to a prescriber.',
    presets: [],
  },
};

/** Best guess from the name as typed; null if nothing matches. */
export function classify(name = '') {
  const n = name.toLowerCase();
  if (n.trim().length < 3) return null;
  for (const [id, c] of Object.entries(CLASSES)) {
    if (c.names.some((w) => n.includes(w))) return id;
  }
  return null;
}
