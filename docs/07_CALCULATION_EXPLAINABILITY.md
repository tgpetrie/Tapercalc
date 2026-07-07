# Calculation Explainability Specification

Last updated: 2026-07-07

Compass must make route calculations understandable without pretending to provide medical advice.

## Explainability Goal

Every route should answer:

- What strategy was used?
- How often reductions occur?
- How large each reduction is?
- Which dose receives the cut?
- What holds/rest points exist?
- What assumptions affect dates and completion?
- What changed compared with the previous route?

## Required Explanation Surfaces

### Journey

Before Plot My Course:

- show selected strategy description
- show selected frequency
- show current total dose
- show target dose
- show validation warnings

After Plot My Course:

- show route length
- show first reduction
- show next rest point
- show estimated completion when start date is present
- show assumptions summary

### Route

Route should include a Calculation Summary:

```text
Strategy: Hyperbolic
Reduction: 10% of current dose
Frequency: Weekly
Cut distribution: First dose first
Starting dose: 30 mg
Target dose: 2.5 mg
Start date: 2026-07-07
Estimated completion: 2028-06-14
```

### Route Row

Each meaningful reduction row should explain:

```text
Day 8
Reduced by 2.84 mg because weekly hyperbolic reduction was applied to current total.
```

Hold rows should explain:

```text
Rest point: no reduction applied for 7 days.
Reason: user-entered reason.
```

## Strategy Explanation Rules

### Linear

Plain language:

```text
This route reduces by the same mg amount at each interval.
```

Formula:

```text
cut = reductionAmount
```

### Hyperbolic

Plain language:

```text
This route calculates each cut from the current dose, so cuts usually get smaller over time.
```

Formula:

```text
cut = currentTotal * reductionPercent / 100
```

### Original Percent

Plain language:

```text
This route calculates each cut from the starting dose, so cuts usually stay the same size.
```

Formula:

```text
cut = originalTotal * reductionPercent / 100
```

### Fixed Daily

Plain language:

```text
This route reduces by the same mg amount every day.
```

Formula:

```text
cut = reductionAmount each day
```

## Assumptions to Display

Compass should show:

- calculations use entered dose values
- blank numeric fields are treated as zero
- monthly frequency means 30 days
- every 4 weeks means 28 days
- custom interval minimum is 1 day
- start date controls displayed dates only
- route is a planning tool, not a medical recommendation
- final target behavior may include target rows after target is reached

## Uncertainty Language

Use:

- "Estimated completion"
- "Based on the current route"
- "Assumes no route changes"
- "This pattern may be useful to discuss with your clinician"

Avoid:

- "You will finish on"
- "Safe schedule"
- "Recommended taper"
- "Guaranteed"

## Route Change Explanation

Future route changes should create a comparison:

```text
Changed on: 2026-07-07
Previous estimated completion: 2028-05-10
New estimated completion: 2028-06-14
Reason: rest point added
Changed fields:
- Added hold from Day 120 for 14 days
- Strategy unchanged
- Target unchanged
```

## Minimum Explainability Acceptance Criteria

A user should be able to inspect a plotted route and answer:

- why the first cut happened
- why the next cut amount is that size
- why a hold row exists
- why the completion date is only an estimate
- what inputs would change the route
