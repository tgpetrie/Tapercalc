# Compass Technical Architecture

This document defines the technical direction for Compass. It derives from `docs/01_PRODUCT_CONSTITUTION.md`.

## Folder Structure

Current high-level structure:

```text
src/
  App.jsx
  InputPanel.jsx
  ScheduleTable.jsx
  SummaryPanel.jsx
  components/
  data/
  styles/
  utils/
docs/
```

Target structure:

```text
src/
  components/
    daily/
    journey/
    route/
    resources/
    shared/
  data/
    resources.js
  styles/
    design-system.css
  utils/
    taperEngine.js
    storage.js
docs/
```

The taper engine should remain isolated from UI and storage concerns.

## Component Hierarchy

Top-level app responsibilities:

- workspace navigation
- current inputs
- calculated schedule
- daily check-in state
- theme preference
- route between major product surfaces

Primary product components:

- Today / Dashboard surface
- TodayPanel
- TodayStep
- DoseCheckItem
- CurrentPositionCard
- ContinuityCard
- NextChangeCard
- Journey planning form
- CalendarRouteView / future RouteView
- ResourceLibrary
- SupportRail
- GuidePanel
- SettingsPage

Future refactor should group components by product domain rather than one flat components folder.

## Data Models

### Daily Check-in

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

### Continuity

```js
{
  daysLogged,
  lastCheckInDate,
  currentRhythm,
  checkInsByDate
}
```

### Resource

```js
{
  id,
  title,
  category,
  description,
  url,
  sourceName,
  cost,
  type,
  tags,
  region,
  lastReviewed
}
```

## Storage

Current storage is localStorage-based.

Stored domains:

- saved taper plans
- daily check-ins
- theme preference
- reflection preference

Storage helpers should be defensive:

- return safe defaults when localStorage is unavailable
- validate parsed JSON shape where feasible
- avoid crashing the app on corrupt data
- keep sensitive data local unless sync is explicitly enabled

## Route Engine

`src/utils/taperEngine.js` is the calculation boundary.

Rules:

- do not mix UI language into engine logic
- do not modify calculation behavior during IA or visual work
- add tests/sanity checks when changing engine behavior
- expose assumptions and strategy metadata to UI
- keep route output stable for table, CSV, and print

## Check-ins

Check-ins are user records, not compliance scores.

Technical requirements:

- save one check-in per date by default
- allow overwrite/edit for the current date
- preserve status for each dose
- store optional note
- support future history and audit views
- avoid deriving shame-oriented metrics

## Continuity

Continuity should be computed from check-ins.

Current minimal model:

- total days logged
- last check-in date
- check-ins by date
- current rhythm

Future model may include:

- active route segment
- consecutive engagement windows
- missed-but-logged days
- rest-point periods
- clinician follow-up markers

Continuity must not become a punitive streak.

## Resources

Resources live in `src/data/resources.js` for the local app.

Requirements:

- reputable source
- public URL where possible
- category
- tags
- source name
- region
- last reviewed date
- clear disclaimer

Future resource work should support remote updates only after trust and review workflows are defined.

## Themes

Themes are product tone, not decoration.

Current themes are CSS-variable based. Future theme evolution should be driven by engagement milestones while preserving accessibility.

Theme architecture should support:

- static color tokens
- optional engagement visual state
- reduced motion
- non-color status cues

## Animation Architecture

Animations must be isolated and optional.

Allowed animation domains:

- save confirmation
- route orientation
- theme progression

Implementation requirements:

- respect reduced-motion
- avoid blocking UI
- avoid implying medical improvement
- avoid attention-harvesting loops

## Future Cloud Sync

Cloud sync must be opt-in and privacy-first.

Requirements before implementation:

- account model
- encryption/privacy review
- export/delete controls
- sync conflict strategy
- local-first behavior
- clear explanation of what is synced

## Future Accounts

Accounts should exist only when they provide clear user value, such as multi-device sync or clinician sharing.

Accounts must not be required for essential local planning, urgent resources, or safety information.

## Future Provider Mode

Provider mode may support:

- route review
- patient-generated reports
- question preparation
- assumption review
- export annotations

Provider mode must not allow clinicians to change a user-owned plan without clear user consent in future synced systems.

## Future Caregiver Mode

Caregiver mode may support:

- user-approved read access
- appointment preparation
- support notes
- emergency resource access

Caregiver mode must be consent-driven and privacy-preserving.

## Implementation Rule

Do not implement large features until documentation reflects intended behavior.

Documentation drives implementation, not memory. Every major pull request should reference the Product Constitution and explain how the change supports the mission.
