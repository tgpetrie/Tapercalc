# Decision Log

This document records significant product and architecture decisions so future contributors understand not only what Compass does, but why.

## 2026-07-07

### Decision

Compass rewards continuity, not compliance.

### Reason

Medication tapering can involve holds, adjustments, missed doses, changing pace, difficult symptoms, and clinician conversations. Rewarding perfect adherence could create shame and discourage honest tracking.

### Impact

- No punitive streaks.
- No "failed" or "off track" language.
- Continuity is preserved by honest logging.
- Rest points are first-class events.
- Missed doses can be logged without penalty.

## 2026-07-07

### Decision

Compass is a navigation system, not a taper calculator.

### Reason

The calculator is necessary, but it is not the product. The product value is orientation: where the user started, where they are, what today asks of them, what happens next, and how to stay engaged.

### Impact

- Today/Living Mode becomes the primary daily surface.
- Journey/Planning Mode contains the calculator.
- Route output must be explainable.
- UI should avoid landing-page patterns.

## 2026-07-07

### Decision

Living Mode and Planning Mode are separate.

### Reason

Daily use and route planning have different cognitive loads. Daily use must work during fatigue, brain fog, anxiety, or withdrawal. Planning can be more detailed because it happens less often and requires more attention.

### Impact

- Today is compact and action-oriented.
- Journey contains strategy, frequency, target, doses, holds, and Plot My Course.
- Advanced planning options are collapsed by default.
- Daily surfaces should not become planning forms.

## 2026-07-07

### Decision

Compass exists to earn trust, not attention.

### Reason

Health-adjacent software should not use engagement hacks, manipulative notifications, or dark patterns. Users should open Compass because it helps them navigate, not because the product pressures them.

### Impact

- No engagement-for-engagement's-sake metrics.
- No manipulative notifications.
- No pressure to preserve streaks.
- Every interaction needs a clear user-serving purpose.

## 2026-07-07

### Decision

Keep the taper engine isolated.

### Reason

The route engine is the highest-risk technical area. Product IA, visual design, and daily check-ins should not accidentally change calculation behavior.

### Impact

- `taperEngine.js` remains the calculation boundary.
- UI components consume route output but do not alter formulas.
- Engine changes require updated specs and sanity checks.

## 2026-07-07

### Decision

Documentation drives implementation.

### Reason

Compass is intended to become a long-term product. Memory and prompts are too fragile to serve as the product foundation.

### Impact

- Product Constitution is the highest authority.
- Major features require documentation before implementation.
- Future pull requests should explain alignment with the Constitution.
