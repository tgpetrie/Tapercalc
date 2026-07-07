# Component Contracts

Last updated: 2026-07-07

This document defines current component responsibilities, state ownership, and expected contracts.

## App

Owns:

- `inputs`
- `schedule`
- active workspace
- wizard visibility
- Today Step visibility
- continuity state
- today's check-in
- theme
- daily reflections setting

Responsibilities:

- orchestrate workspace navigation
- validate calculate action before route generation
- call route engine
- save check-ins
- pass focused props to product components

Must not:

- implement route formulas
- store product data outside storage helpers

## InputPanel

Props:

- `inputs`
- `setInputs`
- `onCalculate`
- `onLoadPlan`

Responsibilities:

- render Planning Mode form
- update dose, taper, frequency, advanced, hold, and start-date fields
- show validation warnings
- submit Plot My Course
- host SaveLoadPanel

State:

- `showAdvanced`

## DoseEditor

Props:

- `doses`
- `doseCount`
- `onChange`

Responsibilities:

- edit daily dose entries
- support preset or custom dose counts
- add/remove/reorder doses
- compute visible current total

Emits:

```js
onChange({ doseCount, doses })
```

## HoldEditor

Props:

- `holds`
- `onChange`

Responsibilities:

- add, edit, remove hold/rest-point periods

Emits:

```js
onChange(nextHolds)
```

## SaveLoadPanel

Props:

- `inputs`
- `onLoadPlan`

Responsibilities:

- save plan to localStorage
- load plan
- delete plan
- rename plan
- duplicate plan

## TodayPanel

Props:

- `inputs`
- `schedule`
- `todayCheckIn`
- `onContinue`

Responsibilities:

- show today total
- show dose rows
- show check-in saved state
- expose Continue Journey as primary action

Does not:

- save check-ins
- calculate route

## TodayStep

Props:

- `inputs`
- `schedule`
- `existingCheckIn`
- `theme`
- `onSave`
- `onClose`

Responsibilities:

- build daily dose logs
- record dose status
- record compared-to-yesterday state
- record plan status
- record optional note
- call save callback
- show completion cue after successful save
- show SupportRail

Emits:

```js
onSave({
  date,
  routeDay,
  doseLogs,
  comparedToYesterday,
  planStatus,
  note
})
```

## DoseCheckItem

Props:

- `doseLog`
- `onChange`

Responsibilities:

- render one dose check-in row
- allow status selection: complete, late, missed, adjusted
- collect adjustment note when adjusted

Emits:

```js
onChange(nextDoseLog)
```

## ContinuityCard

Props:

- `continuity`
- `todayCheckIn`

Responsibilities:

- show days logged
- show today logged or last check-in
- avoid streak/shame language

## CurrentPositionCard

Props:

- `currentTotal`
- `targetDose`
- `schedule`
- `inputs`

Responsibilities:

- show current dose
- show strategy
- show frequency
- show starting route dose when plotted
- show destination

## NextChangeCard

Props:

- `schedule`

Responsibilities:

- show next reduction day
- show next rest point day

## CalendarRouteView

Props:

- `schedule`

Responsibilities:

- render first 14 route days as cards
- preserve table/CSV/print by not replacing ScheduleTable

## ScheduleTable

Responsibilities:

- render full route table
- support CSV export
- support print path

## SummaryPanel

Responsibilities:

- summarize plotted route

## ResourceLibrary

Props:

- `compact = false`

Responsibilities:

- search resources
- filter by category
- render ResourceCard list
- show resource disclaimer
- compact mode shows first three filtered resources and hides controls

## ResourceCard

Props:

- `resource`

Responsibilities:

- show resource title, category, source, cost, region, description
- link external URL when present
- show internal worksheet note when URL is blank

## SupportRail

Responsibilities:

- show daily support prompts
- include compact ResourceLibrary
- keep support accessible from Today's Step

## ThemeCompletionCue

Props:

- `theme`
- `visible`

Responsibilities:

- show subtle saved confirmation when visible
- avoid implying medical success

## GuidePanel

Responsibilities:

- render searchable guide content
- explain taper planning concepts in plain language

## TaperWizard

Props:

- `onApply`
- `onClose`

Responsibilities:

- collect simplified setup inputs
- generate initial planning inputs
- not calculate route directly

## Ownership Rules

- Route engine owns calculations.
- Storage helpers own persistence.
- App owns high-level product state.
- Screen components own local UI state only.
- Product cards should be display-only unless explicitly responsible for an action.
