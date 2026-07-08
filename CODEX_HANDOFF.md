# COMPASS / Tapercalc Handoff

## Current state

The app has been redesigned into a new COMPASS interface under `src/compass/`.

The old UI remains in the repo but is unmounted and recoverable:
- `src/App.jsx`
- `src/components/`

The new app is mounted through `main.jsx`.

## Product direction

COMPASS is a taper-route app, not just a medication calculator.

The core metaphor:
- Today is the daily ritual.
- Path is the visual route.
- Plan is the map room.
- Library is the record.
- The route is never a judgment.

No confetti. No badges. No streaks. No perfection language. No compliance/adherence rewards. No speed rewards.

Milestones should witness continuity, not performance.

## Recent corrections and priorities

### Today
- “Marked.” should be the primary confirmation.
- “See you tomorrow.” should be secondary.
- Notes should feel like field notes, not literary quotes.
- Replace “Need steadying?” with “Need support?”

### Weather
Weather means metaphorical day/mental weather, not real-world forecast weather.

Use:
- “Today’s weather”
- “How the day felt”

Options:
- clear
- unsettled
- foggy
- stormy

Weather is optional and should never imply failure.

### Notes / Journal
Daily notes should be:
- optional
- editable
- attached to a daymark
- visible later in Library / Journal shelf
- not required to mark the day

### Plan
Plan is not Settings. Plan is the map room.

Plan should answer:
1. What route am I currently on?
2. What happens next?
3. What changes am I drafting?
4. What other route shapes could I compare?
5. What will happen if I commit this?

Desired Plan structure:
- Current Route
- Draft Changes
- Route Options
- Review
- Commit

Past days must be preserved. Draft changes should only redraw the future.

### Taper model
The app should understand:
- starting dose
- current dose
- target dose
- medication name
- dose schedule
- linear reductions
- percentage reductions
- hyperbolic/gentle curve reductions
- microtaper-style distribution
- holds
- planned rest points
- unplanned pauses
- recalculate from today
- preserving history
- storm days / notes
- optional updose/correction events

Plain-language meanings:
- A hold is part of the route, not failure.
- A rest point is a planned stabilizing pause.
- Linear means the same mg amount each cut.
- Percentage means the same percentage of current dose each cut.
- Hyperbolic/gentle means steps get smaller as dose gets lower.
- Microtaper means spreading reductions into smaller frequent changes.

### Route Helper / AI
The AI Route Helper should be draft-only.

Flow:
1. User describes the route in plain language.
2. AI returns 2–4 draft route shapes.
3. User inspects one.
4. User loads one into Draft Changes.
5. User must Review before Commit.

It must never directly change the active route.

Required language:
- draft route
- route shape
- one possible structure
- review with your prescriber or care team
- not medical advice
- hold is part of the route
- past days are preserved
- changes only affect the road ahead

Forbidden language:
- recommended
- safe for you
- medically appropriate
- you should
- failure
- relapse
- noncompliant
- streak

### Supply Plan future feature
Future feature: Medication Setup / Supply Plan.

This should connect the route to real-world medication forms:
- tablet strengths
- liquid concentration, mg/mL
- bottle size
- current inventory
- pharmacy phone
- refill reminders
- copyable refill/prescriber messages

Important distinction:
- Route = what dose changes over time
- Supply = what medication forms/refills support that route

Required warnings:
- Verify tablet strength and liquid concentration from the prescription label.
- This is supply math, not medical advice.
- Confirm dosing and refill plans with prescriber or pharmacist.

## Visual direction

Light mode:
- warm paper, not white glare
- readable ink
- soft warm borders
- muted green-gray/blue-gray accent
- no generic browser controls

Suggested palette:
- background: #f3efe6
- primary ink: #3f3a33
- secondary ink: #7a7167

Dark mode:
- dim warm ink
- not black glass

Inputs, dropdowns, pills, sliders, and buttons should match COMPASS typography and paper/ink style.

## What to check next

1. Verify Today marked state hierarchy.
2. Verify Today’s weather is clearly metaphorical.
3. Verify notes are editable and saved.
4. Verify Library has journal/day records.
5. Verify Plan clearly shows Current Route.
6. Verify Draft Changes do not instantly alter active route.
7. Verify Route Options are not ranked/recommended.
8. Verify Review/Commit language preserves history.
9. Verify bottom nav does not overlap content.
10. Verify build passes.

## Fallback point

Fallback tag:
- before-codex-handoff

Fallback branch:
- backup-before-codex-handoff
