# QA and Acceptance Criteria

Last updated: 2026-07-07

This document defines manual and automated checks for Compass.

## Required Commands

Before a development milestone:

```bash
node --input-type=module - <<'NODE'
import { runCalculationSanityChecks } from './src/utils/taperEngine.js';
const results = runCalculationSanityChecks();
console.table(results);
if (results.some(result => !result.passed)) process.exit(1);
NODE
```

```bash
npm run build
```

## Route Engine Acceptance

Pass when:

- all sanity checks pass
- linear fixed amount produces reductions
- hyperbolic cuts shrink
- original-percent cuts stay fixed
- fixed daily reduces on consecutive days
- holds create hold rows
- multi-dose totals are correct
- start date creates date and weekday
- target status is reached

Any route engine behavior change must update `06_ROUTE_ENGINE_SPECIFICATION.md`.

## Today Acceptance

Pass when:

- Today shows scheduled dose total.
- Continue Journey is the primary action.
- Plot My Course is not shown on Today.
- A saved check-in changes Today to logged/saved state.
- Continuity card does not use streak or shame language.

## Today's Step Acceptance

Pass when:

- Each dose can be marked complete, late, missed, or adjusted.
- Adjusted dose allows a note.
- Compared-to-yesterday selection works.
- Plan status selection works.
- Optional note saves.
- Save creates or updates the check-in for today's date.
- Completion cue appears after save.
- SupportRail is visible or stacked.

## Journey Acceptance

Pass when:

- Dose editing works.
- Strategy selection changes required reduction input.
- Frequency selection works.
- Custom interval appears only for custom frequency.
- Advanced settings collapse/expand.
- Holds can be added.
- Plot My Course generates route for valid inputs.
- Invalid zero dose, invalid target, and target >= current total are blocked.

## Route Acceptance

Pass when:

- Route overview renders after plotting.
- Card view shows near-term route days.
- Summary panel renders.
- Full table renders.
- CSV export remains available.
- Print remains available.

## Guide and Resources Acceptance

Pass when:

- Guide search filters entries.
- Resource Library search filters resources.
- Resource category filter works.
- External links open in a new tab.
- Resource disclaimer is visible.
- Urgent resources are present.

## Settings Acceptance

Pass when:

- Theme changes apply.
- Theme persists after reload.
- Reflection setting toggles.
- Reflection setting persists after reload.

## Accessibility Checklist

Pass when:

- keyboard navigation reaches primary controls
- visible focus states are present
- touch targets are at least 44px where practical
- color is not the only status cue
- form inputs have labels
- support resources are reachable from daily flow
- animation is not required to understand success

## Responsive Checklist

Desktop:

- left navigation visible
- daily check-in can use support rail
- route table remains usable

Mobile:

- bottom navigation visible
- no text overlap
- Today primary action remains visible
- check-in controls stack cleanly
- route cards and table do not break layout

## Product Acceptance

Every major feature must pass:

- reduces uncertainty
- avoids guilt
- preserves user autonomy
- does not pretend medical certainty
- does not increase daily cognitive load unnecessarily
- aligns with Product Constitution
