import React from 'react';
import { STARTER_RESOURCES } from '../data/resources.js';

/**
 * Library — the field guide in your pack. A shelf, organized by the
 * question you arrived with. Shelves wait; they never badge or update
 * themselves in your face.
 */

const SECTIONS = [
  {
    id: 'descent',
    title: 'Understanding the descent',
    hint: 'why tapers slow down as they go, and what a good route looks like',
    intro: `Most long-term tapers get harder near the bottom, not easier. That isn't a
      personal failing — it's arithmetic. Receptor occupancy doesn't fall in a straight
      line with dose, which is why many people do best with steps that shrink as the
      dose shrinks. Compass draws its pencil this way by default.`,
    categories: ['Medication / Taper Education'],
  },
  {
    id: 'waves',
    title: 'When it gets hard',
    hint: 'waves, windows, and what a rough stretch does and does not mean',
    intro: `Difficult stretches often arrive in waves, and pass the same way. A stormy
      week is information, not a verdict — it usually argues for holding, not for
      abandoning the route. The ink on your Path is proof of every wave you have
      already outlasted.`,
    categories: ['Daily Coping Tools'],
  },
  {
    id: 'prescriber',
    title: 'Talking with your prescriber',
    hint: 'turning your record into a better conversation',
    intro: `The most useful thing you can bring to an appointment is an honest record.
      The Path's snapshot shows your actual route — the holds, the adjustments, the
      weather — in one page. Print it, hand it over, and let the conversation start
      from reality instead of memory.`,
    categories: ['Printable Tools'],
  },
  {
    id: 'support',
    title: 'Finding support',
    hint: 'people to talk to — today if needed',
    intro: `Nobody navigates this well alone. If today is heavy, start at the top of
      this list; those lines are answered around the clock. The rest are communities
      and professionals who understand tapering specifically.`,
    categories: ['Urgent / Crisis Support', 'Finding Professional Support', 'Support Communities'],
  },
  {
    id: 'how-compass-calculates',
    title: 'How Compass calculates',
    hint: 'the arithmetic behind the pencil, in plain language',
    intro: `The future part of your Path is a projection, recomputed every time you look
      at it. It takes your current dose, applies your chosen gradient (a percentage of
      the current dose per step), holds each step for your chosen rhythm, and stops
      pretending precision beyond a season. When reality differs — a hold, an updose,
      a pause — the pencil simply redraws from wherever you actually are. Compass
      never grades the difference between the plan and the day.`,
    categories: [],
  },
];

function Section({ section, onBack }) {
  const resources = STARTER_RESOURCES.filter(r => section.categories.includes(r.category));
  return (
    <div className="reading">
      <button className="back-link" onClick={onBack}>← the shelf</button>
      <h2>{section.title}</h2>
      <p>{section.intro}</p>
      {resources.map(r => (
        <div className="resource" key={r.id}>
          <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
          <div className="resource__desc">{r.description}</div>
        </div>
      ))}
    </div>
  );
}

export default function Library({ openSection, onOpenSection }) {
  const section = SECTIONS.find(s => s.id === openSection);
  return (
    <div className="page library">
      {section ? (
        <Section section={section} onBack={() => onOpenSection(null)} />
      ) : (
        <>
          <h1>Library</h1>
          <ul className="shelf">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <button onClick={() => onOpenSection(s.id)}>
                  {s.title}
                  <span className="shelf__hint">{s.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export { SECTIONS };
