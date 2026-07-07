# Compass Product Requirements

This document defines what Compass must do and what it intentionally does not do. It derives from `docs/01_PRODUCT_CONSTITUTION.md`.

## Users

### Primary User

A person living through long-term medication tapering who needs orientation, planning support, and a daily way to stay engaged.

They may experience anxiety, fatigue, withdrawal symptoms, poor concentration, or uncertainty. They may be working with a clinician, trying to prepare for clinical conversations, or trying to keep a coherent record.

### Secondary Users

- A clinician reviewing a route, check-in history, or exported report.
- A trusted support person helping the user prepare questions or interpret patterns.
- A future caregiver or provider-mode user with explicit user permission.

## Goals

Compass must help users:

- understand their current taper journey
- see today's step quickly
- honestly log what happened
- preserve continuity without perfection
- plan routes with clear assumptions
- view upcoming reductions and rest points
- prepare for clinician conversations
- access trusted resources and urgent support

## Non-Goals

Compass does not:

- provide medical advice
- recommend medication changes
- diagnose conditions
- promise outcomes
- replace clinicians, pharmacists, or emergency services
- optimize for social comparison
- gamify adherence with pressure or shame
- become a general wellness app
- become a broad symptom tracker before the taper journey is coherent

## Daily Workflow

Daily use happens in Living Mode and should take under one minute.

Required daily flow:

1. Open Today.
2. See date, route day, current dose, and today's scheduled doses.
3. Select Continue Journey or Log Today.
4. Mark each dose as complete, late, missed, or adjusted.
5. Optionally mark whether today feels better, same, or more difficult.
6. Optionally add a short note.
7. Mark plan status if needed: followed, adjusted, rest point, missed and logged, support needed, or follow-up planned.
8. Save check-in.
9. See a subtle confirmation that the record was saved.

Continuity is preserved when the user logs honestly, including missed doses or holds.

## Planning Workflow

Planning happens in Journey.

Required planning flow:

1. Enter or edit current daily doses.
2. Set target dose.
3. Select strategy and frequency.
4. Add start date.
5. Add rest points or holds.
6. Adjust advanced options if needed.
7. Select Plot My Course.
8. Review route summary and assumptions.
9. Save, print, export, or discuss externally.

Advanced options must be collapsed or visually secondary by default.

## Primary Use Cases

### See Today

The user opens Compass and immediately sees:

- Today
- weekday and date
- route day
- scheduled daily dose
- current position
- next change
- continuity status

### Log an Imperfect Day

The user misses, delays, or adjusts a dose. Compass allows them to log it without penalty. The app confirms that the record was saved and may suggest discussing patterns with a clinician when appropriate.

### Plan a Route

The user enters taper details and plots a route. Compass shows assumptions, planned reductions, rest points, and route output while keeping the taper engine explainable.

### Review What Happens Next

The user wants to know the next reduction, next rest point, or estimated completion. Compass should answer this without forcing them into the full planning form.

### Prepare for a Clinician Conversation

The user needs to bring route details or questions to an appointment. Compass should support printable/exportable summaries and question preparation.

## Failure Scenarios

Compass must handle:

- no route plotted
- incomplete dose data
- invalid target dose
- missed check-ins
- missed doses
- extended holds
- adjusted route after logging begins
- localStorage unavailable
- print/export needs
- user distress or urgent help needs
- uncertainty in completion estimates

Failure handling must be plain, non-shaming, and actionable.

## Success Metrics

Product success should be measured by trust and usefulness, not raw attention.

Potential metrics:

- users can identify today's required action within 5 seconds
- daily check-in completion time under one minute
- route assumptions visible before export
- percentage of check-ins that include honest non-perfect states
- users can find urgent support within one interaction from Today
- reduced confusion between Today, Journey, and Route
- successful print/export for clinician discussion

Avoid metrics that reward unnecessary app opens or pressure.

## Future Roadmap

### Version 1.0

- local-first route planning
- Today / Journey / Route / Guide / Insights / Settings architecture
- daily check-ins
- continuity model
- starter resources
- table, CSV, and print preservation

### Version 1.1

- rename Dashboard to Today
- add Journey Story card
- show beginning, current position, destination, and estimated completion
- show weekday, date, and route day
- improve support hierarchy
- add first evolving theme cue for engagement
- clarify Route vs Calendar

### Version 1.2

- route change audit trail
- check-in history
- provider discussion export
- appointment question worksheet
- stronger resource filtering

### Future

- optional cloud sync
- accounts
- provider mode
- caregiver mode
- import/export formats
- privacy controls
- deeper insights from check-in history
