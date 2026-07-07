# Route Engine Specification

Last updated: 2026-07-07

This document specifies the current taper route engine behavior. It is descriptive of the current local engine and must be updated before any route calculation changes.

## Engine Boundary

The route engine lives in `src/utils/taperEngine.js`.

It owns:

- dose total calculation
- interval calculation
- reduction calculation
- cut distribution
- hold/rest-point rows
- route generation
- formatting
- CSV generation
- validation warnings
- sanity checks

It must not own:

- product language
- UI state
- localStorage
- check-ins
- continuity scoring
- support/resources
- medical recommendations

## Inputs

`generateSchedule(params)` accepts:

- `doses`: initial daily dose array
- `targetDose`: target total daily dose in mg
- `strategy`: `linear`, `hyperbolic`, `originalPct`, `fixedDaily`, or future `custom`
- `frequency`: `daily`, `weekly`, `biweekly`, `fourWeeks`, `monthly`, or `custom`
- `customInterval`: number of days when frequency is custom
- `reductionAmount`: mg reduction for amount-based strategies
- `reductionPercent`: percent reduction for percent-based strategies
- `cutStrategy`: `alternate`, `firstFirst`, `lastFirst`, `splitEvenly`, or `custom`
- `customOrder`: dose index priority array
- `holds`: rest-point periods
- `startDate`: optional ISO date string
- `maxDays`: safety cap, default `1095`

## Dose Total Formula

For each dose:

```text
dose mg = tabletMg + (liquidMl * mgPerMl)
```

Total daily dose:

```text
sum(all dose mg)
```

Invalid or blank numeric fields are treated as `0`.

## Frequency Rules

Frequency maps to interval days:

| Frequency | Days |
|---|---:|
| `daily` | 1 |
| `weekly` | 7 |
| `biweekly` | 14 |
| `fourWeeks` | 28 |
| `monthly` | 30 |
| `custom` | `max(1, parsed customInterval or 1)` |

Unknown frequency defaults to 7 days.

## Reduction Strategies

### Linear

Fixed mg reduction per interval.

```text
interval reduction = reductionAmount
```

### Hyperbolic

Percent of current total dose per interval.

```text
interval reduction = currentTotal * (reductionPercent / 100)
```

Each cut generally becomes smaller as current dose decreases.

### Original Percent

Percent of original starting dose per interval.

```text
interval reduction = originalTotal * (reductionPercent / 100)
```

Each cut remains the same size unless limited by available dose or target behavior.

### Fixed Daily

Fixed mg reduction every day.

```text
daily reduction = reductionAmount
```

The strategy reduces daily regardless of the selected frequency. Frequency still advances the internal step number.

### Custom

Reserved for future expansion. Current behavior returns `0` reduction.

## Cut Distribution

The engine clones doses before applying reductions.

Reduction removes liquid before tablet within each dose:

1. Convert available liquid to mg.
2. Remove as much reduction as possible from liquid.
3. Convert removed liquid mg back to mL.
4. Remove remaining reduction from tablet mg.

### `splitEvenly`

```text
perDose = reductionMg / numberOfDoses
```

Each dose receives that cut amount. If a dose has less available than its share, the unused remainder is not redistributed by the current engine.

### `firstFirst`

Cut from dose index `0`, then `1`, then onward.

### `lastFirst`

Cut from the last dose, then backward.

### `custom`

Use `customOrder` only when its length equals the number of doses. Otherwise fall back to natural order.

### `alternate`

Current behavior uses natural order. The label is product-facing; the current algorithm does not rotate across intervals.

## Hold / Rest-Point Rules

`getHoldForDay(day, holds)` returns the first hold where:

```text
day >= startDay && day < startDay + lengthDays
```

During a hold:

- doses are cloned from the previous schedule row when available
- otherwise current doses are cloned
- status is `hold`
- note is the hold reason or `Hold period ({lengthDays} days)`
- no reduction is applied

## Schedule Generation

For each day from `1` to `maxDays`:

1. Check whether the day is inside a hold.
2. If hold, clone previous/current doses and mark `hold`.
3. If not hold and strategy is `fixedDaily`, apply daily reduction when above target.
4. If not hold and strategy is stepwise, apply interval reduction only when `dayInInterval === 0`.
5. Advance interval counters.
6. If current total is at or below target, set status `target`.
7. Generate date and weekday when start date is valid.
8. Push schedule row.
9. After target is reached on a non-hold day, append final target rows and stop.

## Target Stop Behavior

The engine uses `EPSILON = 1e-6`.

Target reached when:

```text
currentTotal <= parsedTarget + EPSILON
```

When reached:

- `currentTotal` is set to parsed target
- status becomes `target`
- note becomes `Target dose reached`
- engine appends final target rows
- final rows count is `min(intervalDays, 7)`
- route generation stops

Current implementation does not proportionally trim a final cut to avoid going below target in the dose objects. The displayed `totalDailyDose` for appended target rows is set to target.

## Date Generation

If `startDate` is a valid date:

- day 1 date equals `startDate`
- day N date is `startDate + N - 1 days`
- weekday uses `toLocaleDateString('en-US', { weekday: 'short' })`

If invalid or blank, date and weekday are blank strings.

## Output Row Shape

Each schedule row:

```js
{
  day,
  date,
  weekday,
  step,
  doses,
  totalDailyDose,
  dailyReduction,
  status,
  note
}
```

## Validation Warnings

`validateInputs(inputs)` warns when:

- no dose has tablet mg or liquid mL greater than 0
- liquid mL is set but mg/mL is invalid or non-positive
- target dose is greater than or equal to current total
- a hold starts before Day 1
- holds overlap

Warnings do not directly prevent route generation. The app-level submit handler prevents several invalid route states.

## CSV Export

CSV columns:

- Day
- Date
- Weekday
- Step
- for each dose: Tablet mg, Liquid mL, Liquid mg
- Total Daily mg
- Daily Reduction mg
- Status
- Notes

Cells are quoted and internal quotes are escaped.

## Sanity Checks

The engine currently verifies:

- linear fixed amount generates a route
- hyperbolic cuts shrink
- original-percent cuts stay fixed
- fixed daily reduces on consecutive days
- holds create hold rows
- multiple daily doses total correctly
- calendar dates generate from start date
- target dose stop behavior reaches target

## Known Engine Gaps

- `alternate` does not currently rotate reductions between doses.
- Final cuts can overshoot target in dose-level values before target display rows are appended.
- `custom` strategy is disabled/reserved.
- Engine warnings are not a full validation schema.
- No persisted route audit trail exists yet.
