# COMPASS Product Spec

## Core Philosophy

COMPASS is a current-user medication taper planning workspace. It is not a landing page, spreadsheet, or medical advice product. Its daily purpose is to orient the user around three questions:

- Where am I?
- What do I do today?
- What happens next?

The core behavioral principle is **continuity over compliance**. COMPASS rewards honest engagement, not perfect adherence. A day can preserve continuity when the user logs what happened, even if the plan was adjusted, a rest point was taken, a dose was missed, symptoms were difficult, or support was needed.

The app must avoid guilt language. Do not use "failed", "off track", "perfect day", "broken streak", or traditional streak mechanics. Use "Continuity", "Days logged", "Check-in rhythm", "Last check-in", and "Journey record".

## Living Mode vs Planning Mode

COMPASS has two modes:

- **Living Mode**: daily use, under one minute. The user sees today's doses, confirms what happened, adds a short note if needed, and can access support/resources.
- **Planning Mode**: less frequent and more complex. The user edits strategy, frequency, dose schedule, holds/rest points, segments, target, start date, save/load, export, and route generation.

Dashboard serves Living Mode. Journey serves Planning Mode.

## Dashboard Purpose

The Dashboard opens to a Journey Overview for a current user. It should never feel like a landing page or marketing surface.

Above the fold it should show:

- Today
- Continue Journey as the single primary action
- Current Position
- Continuity / Last Check-in
- Next Change
- Upcoming Rest Point

Plot My Course belongs inside Journey, not as the Dashboard's primary action.

## Today's Step Workflow

Today's Step is opened from Dashboard through Continue Journey. It is a focused daily check-in, not a planner.

It allows the user to:

- View today's dose schedule.
- Mark each dose as complete, late, missed, or adjusted.
- Mark whether today feels better, same, or more difficult compared to yesterday.
- Add a short optional daily note.
- Choose today's plan status:
  - plan followed
  - plan adjusted
  - rest point taken
  - dose missed and logged
  - support needed
  - clinician/support follow-up planned
- Finish check-in.

Completion saves a daily check-in, preserves continuity if something was honestly logged, and shows a quiet theme-based completion cue with plain language such as "Check-in saved" or "Today's doses logged."

## Continuity Rules

A check-in counts when the user logs what happened honestly. Continuity is preserved by:

- Taking planned doses.
- Taking or extending a rest point.
- Logging symptoms.
- Missing a dose and logging it.
- Adjusting the plan thoughtfully.
- Marking support needed.
- Planning clinician/support follow-up.

If the user disappears, avoid guilt. Show neutral status such as "Last check-in: 4 days ago."

## Support / Resources Model

Every daily screen should provide easy support access.

Today's Step should include a "Need Direction?" support panel:

- Desktop: persistent right rail.
- Mobile: expandable drawer or bottom sheet.

Support should normalize difficulty without giving medical advice. Medication-change decisions should point to clinician or trusted support discussion.

Resource categories:

1. Urgent / Crisis Support
2. Medication / Taper Education
3. Finding Professional Support
4. Daily Coping Tools
5. Support Communities
6. Printable Tools

Resources are educational and supportive. They do not replace medical care or emergency services.

## Information Architecture

- **Dashboard**: Journey Overview, Today summary, Current Position, Continuity, Next Change, primary Continue Journey action.
- **Today's Step**: focused daily check-in flow.
- **Journey**: planning workspace for taper strategy, frequency, dose schedule, rest points, segments, target, start date, save/load, and Plot My Course.
- **Calendar / Route**: calendar/day-card schedule and existing route table with CSV/print.
- **Guide**: searchable glossary and short practical explanations.
- **Resources**: searchable public support/resource library, accessible from Guide and support panels.
- **Insights**: future-ready compact cards for trends, provider reports, symptom notes, and route patterns.
- **Settings**: themes, accessibility, units, reflections, print/export, future encouragement style.

## Component Plan

Create:

- `TodayStep.jsx`
- `DoseCheckItem.jsx`
- `SupportRail.jsx`
- `ResourceLibrary.jsx`
- `ResourceCard.jsx`
- `ContinuityCard.jsx`
- `CurrentPositionCard.jsx`
- `NextChangeCard.jsx`
- `TodayPanel.jsx`
- `CalendarRouteView.jsx`
- `ThemeCompletionCue.jsx`

Refactor:

- `App.jsx` should orchestrate workspace state and daily check-in state.
- Dashboard sections should become focused components.
- Resource and check-in constants should live outside screen components.

Do not modify taper calculation logic.

## Data Models

Daily check-in:

```js
{
  id,
  date,
  routeDay,
  doseLogs: [
    {
      doseId,
      label,
      scheduledAmount,
      status: "complete" | "late" | "missed" | "adjusted",
      note
    }
  ],
  comparedToYesterday: "better" | "same" | "more_difficult" | null,
  planStatus: "followed" | "adjusted" | "rest_point" | "missed_logged" | "support_needed" | "followup_planned",
  note,
  completedAt
}
```

Continuity:

```js
{
  daysLogged,
  lastCheckInDate,
  currentRhythm,
  checkInsByDate
}
```

Resource entry:

```js
{
  id,
  title,
  category,
  description,
  url,
  sourceName,
  cost: "free" | "paid" | "mixed",
  type: "hotline" | "guide" | "worksheet" | "organization" | "community" | "article" | "tool",
  tags,
  region,
  lastReviewed
}
```

## Safe Implementation Order

1. Add check-in, continuity, and resource data/storage helpers.
2. Build Today's Step flow.
3. Replace Dashboard with compact Journey Overview.
4. Move Plot My Course into Journey only.
5. Add SupportRail and starter Resource Library.
6. Add Calendar/Route card view without breaking table, CSV, or print.
7. Add subtle completion cue.
8. Run sanity checks.
9. Run `npm run build` and fix all errors.

