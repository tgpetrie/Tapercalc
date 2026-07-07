import React, { useState } from 'react';
import ResourceLibrary from './ResourceLibrary';

const SUPPORT_PROMPTS = [
  {
    question: 'What if today feels too hard?',
    answer: 'This can happen. Log what happened so the route stays accurate. If symptoms are difficult, a rest point may be worth discussing with your prescriber or support person.',
  },
  {
    question: 'Is it okay to hold?',
    answer: 'A rest point can be part of a taper plan. COMPASS can record the rest point, but medication changes should be reviewed with a clinician or trusted support person.',
  },
  {
    question: 'What if I missed a dose?',
    answer: 'Record it honestly. Continuity is preserved by logging what happened. For medication-specific next steps, contact your prescriber or pharmacist.',
  },
  {
    question: 'When should I seek urgent help?',
    answer: 'For urgent safety concerns, contact emergency services or a crisis line. In the United States, call or text 988 for crisis support.',
  },
];

export default function SupportRail() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <aside className="support-rail">
      <div className="support-panel">
        <p className="eyebrow">Need Direction?</p>
        <h2>Questions or concerns</h2>
        <div className="support-prompts">
          {SUPPORT_PROMPTS.map((prompt, index) => (
            <div key={prompt.question} className="support-prompt">
              <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                {prompt.question}
              </button>
              {openIndex === index && <p>{prompt.answer}</p>}
            </div>
          ))}
        </div>
      </div>
      <ResourceLibrary compact />
    </aside>
  );
}
