import React, { useMemo, useState } from 'react';

export const GUIDE_SECTIONS = [
  {
    title: 'Starting Dose',
    body: 'The total amount of medication you take each day when you begin the taper. This is your baseline.',
  },
  {
    title: 'Current Dose',
    body: 'The amount of medication you are taking right now, at this point in the taper. It decreases as the taper progresses.',
  },
  {
    title: 'Target Dose',
    body: 'The final dose you want to reach by the end of the taper. The taper stops once this dose is reached.',
  },
  {
    title: 'Linear Taper',
    body: 'You reduce by the same amount of mg at each interval. For example, reduce 0.5mg every week. The size of each cut stays the same throughout.',
  },
  {
    title: 'Hyperbolic Taper',
    body: 'Each reduction is a percentage of your current dose. Because the dose gets smaller, each cut also gets smaller over time. This can feel gentler as the dose decreases.',
  },
  {
    title: 'Percentage of Original Dose',
    body: 'Each reduction is a percentage of your original starting dose. Because the original dose stays the same, every cut is the same size. This is like a linear taper but expressed as a percentage.',
  },
  {
    title: 'Fixed Daily Reduction',
    body: 'You reduce by the same amount of mg every single day. This is the most gradual approach. For example, reduce 0.02mg every day.',
  },
  {
    title: 'Microtaper',
    body: 'Microtaper is not a separate strategy. It simply means reductions happen daily instead of weekly or monthly. You can combine microtaper with any strategy (linear, hyperbolic, etc.).',
  },
  {
    title: 'Stepwise Taper',
    body: 'Reductions happen at intervals (weekly, monthly, etc.) rather than every day. You reduce, then hold that dose for the rest of the interval, then reduce again.',
  },
  {
    title: 'Hold / Pause',
    body: 'A period where the taper stops and you stay at your current dose. Holds let your body adjust before continuing. You can add multiple holds at any point in the schedule.',
  },
  {
    title: 'Liquid Concentration',
    body: 'Liquid medication has a concentration measured in mg per mL. For example, 1mg/mL means each 1mL of liquid contains 1mg of medication. The calculator converts between mg and mL automatically.',
  },
  {
    title: 'mg vs mL',
    body: 'mg (milligrams) measures the amount of medication. mL (milliliters) measures the volume of liquid. The concentration (mg/mL) connects the two: mg = mL x (mg/mL).',
  },
  {
    title: 'Daily Reduction',
    body: 'The amount the total daily dose decreases each day. In stepwise mode, the reduction happens on the first day of each interval and the dose stays the same for the rest.',
  },
  {
    title: 'Weekly Reduction',
    body: 'The total amount the dose decreases over one week. This equals the daily reduction times 7, or the interval reduction if the frequency is weekly.',
  },
  {
    title: 'Monthly Reduction',
    body: 'The total amount the dose decreases over 30 days. This helps you understand the overall pace of the taper.',
  },
  {
    title: 'Cut Distribution',
    body: 'When you take multiple doses per day, cut distribution decides which dose gets reduced first. Options: alternate between doses, cut the first dose first, cut the last dose first, or split evenly across all doses.',
  },
  {
    title: 'Dose Schedule',
    body: 'The list of doses you take each day. Each dose has a label (like Morning or Evening), a tablet amount in mg, and optionally a liquid amount in mL.',
  },
  {
    title: 'Dose Frequency',
    body: 'How many times per day you take medication. Common schedules are once daily, twice daily, three times daily, or four times daily.',
  },
  {
    title: 'Tablet Dose',
    body: 'The amount of medication in tablet form, measured in mg. Tablets usually come in fixed sizes (like 5mg, 10mg) which can make precise tapering harder.',
  },
  {
    title: 'Liquid Dose',
    body: 'The amount of medication in liquid form, measured in mL. Liquid allows more precise dosing because you can measure small fractions, which is useful for tapering.',
  },
  {
    title: 'Current Interval',
    body: 'The number of days between reductions. For example, a weekly interval means you reduce once every 7 days. Daily interval means you reduce every day.',
  },
  {
    title: 'Reduction Interval',
    body: 'Same as current interval. It is how often you reduce the dose. You can choose daily, weekly, every 2 weeks, every 4 weeks, monthly, or a custom number of days.',
  },
  {
    title: 'Calendar Scheduling',
    body: 'If you enter a start date, the schedule shows real calendar dates and weekdays for each day. This helps you plan around appointments or life events.',
  },
  {
    title: 'Print / Export',
    body: 'You can print the schedule or export it as a CSV file. The CSV can be opened in spreadsheet apps like Excel or Google Sheets for further analysis.',
  },
];

export default function GuidePanel() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return GUIDE_SECTIONS;
    return GUIDE_SECTIONS.filter(section => (
      section.title.toLowerCase().includes(normalizedQuery) ||
      section.body.toLowerCase().includes(normalizedQuery)
    ));
  }, [normalizedQuery]);

  return (
    <div className="panel guide-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Compass Guide</p>
          <h2 className="panel-title">Guide</h2>
        </div>
        <div className="guide-search">
          <label htmlFor="guideSearch">Search guide</label>
          <input
            id="guideSearch"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search terms"
          />
        </div>
      </div>
      <p className="guide-intro">
        This guide explains the terms and concepts used in the taper calculator.
        All plans should be reviewed with an appropriate healthcare professional.
      </p>
      <div className="guide-grid">
        {filteredSections.map((section, i) => (
          <div key={i} className="guide-card">
            <h3 className="guide-card-title">{section.title}</h3>
            <p className="guide-card-body">{section.body}</p>
          </div>
        ))}
      </div>
      {filteredSections.length === 0 && (
        <p className="guide-empty">No guide entries match that search.</p>
      )}
    </div>
  );
}
