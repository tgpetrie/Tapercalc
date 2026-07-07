# Interaction Flows

Last updated: 2026-07-07

This document defines expected user flows for Compass.

## Flow: Open App With No Route

1. User opens Compass.
2. Today/Dashboard shows no route plotted state.
3. Current Position uses entered/default dose inputs.
4. User can open Journey.
5. Journey shows planning form.
6. User enters valid doses and target.
7. User selects Plot My Course.
8. App generates schedule.
9. App navigates to Route/Calendar.

Acceptance:

- User is not forced through marketing.
- Empty route state explains the next practical step.
- Plot My Course appears in Journey, not Today.

## Flow: Plot My Course

1. User enters dose details.
2. User selects strategy.
3. User selects frequency.
4. User optionally expands advanced settings.
5. User optionally adds holds/rest points.
6. User optionally sets start date.
7. User selects Plot My Course.
8. App validates required route conditions.
9. App calls route engine.
10. App stores schedule in memory.
11. App navigates to Route/Calendar.

Validation blocks:

- total current dose is zero
- target is invalid
- target is greater than or equal to current dose

Warnings may still be shown before submission.

## Flow: Today to Check-in

1. User opens Today.
2. User sees today's scheduled total and dose rows.
3. User selects Continue Journey.
4. Today's Step opens.
5. User marks each dose complete, late, missed, or adjusted.
6. User optionally selects how today compares to yesterday.
7. User selects plan status.
8. User optionally adds a note.
9. User selects Finish Check-in / Save Check-in.
10. App saves the check-in.
11. Completion cue appears.
12. Today reflects logged state.

Acceptance:

- Missed or adjusted doses can be saved.
- Logging preserves continuity.
- User is not shamed.

## Flow: Missed Dose Logged

1. User opens Today's Step.
2. User marks a dose as missed.
3. User may add a note.
4. User chooses "Dose missed and logged" or another relevant status.
5. User saves.
6. Continuity remains preserved because the user logged honestly.

Copy must not say:

- failed
- broke streak
- off track

## Flow: Rest Point / Hold

Planning:

1. User opens Journey.
2. User expands Advanced Settings.
3. User adds hold/rest point with start day, length, and optional reason.
4. User plots route.
5. Route shows hold rows.

Daily:

1. User logs plan status as rest point taken.
2. Continuity remains preserved.

## Flow: Support Access

1. User opens Today's Step.
2. SupportRail is visible on desktop or stacked on smaller screens.
3. User opens a support prompt.
4. User may open Resource Library item.
5. Urgent resources must be reachable without navigating deep settings.

Support copy must normalize difficulty without giving medical instructions.

## Flow: Save and Load Plan

Save:

1. User enters plan name.
2. User saves plan.
3. App stores current inputs.
4. If a plan with the same name exists, it is overwritten.

Load:

1. User selects saved plan.
2. App loads inputs.
3. Existing in-memory schedule is cleared.
4. User must plot route again.

## Flow: Route Review

1. User plots route.
2. App shows route overview.
3. App shows route cards for near-term days.
4. App shows summary.
5. App shows full table.
6. User can export CSV or print.

Acceptance:

- Card view must not replace full table.
- CSV and print remain available.

## Flow: Guide and Resources

Guide:

1. User opens Guide.
2. User searches or browses concepts.
3. User reads plain-language explanation.

Resources:

1. User sees disclaimer.
2. User searches or filters.
3. User opens external resource or planned internal worksheet entry.

## Flow: Settings

1. User opens Settings.
2. User changes theme.
3. App persists theme preference.
4. User toggles reflections.
5. App persists reflection preference.

Future settings:

- data export
- data deletion
- accessibility preferences
- account/sync controls

## Mobile Behavior

Mobile should prioritize:

1. Today.
2. Continue Journey / Log Today.
3. Support.
4. Route summary.
5. Planning only when intentionally opened.

Planning interactions may stack vertically. Support rail may become a stacked panel or future drawer.
