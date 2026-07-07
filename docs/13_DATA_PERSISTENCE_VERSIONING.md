# Data Persistence and Versioning

Last updated: 2026-07-07

Compass is currently local-first and uses localStorage.

## Storage Keys

Current keys:

| Key | Purpose |
|---|---|
| `taper-calculator-plans` | Saved planning inputs |
| `compass-daily-checkins` | Daily check-in records |
| `compass-theme` | Selected theme |
| `compass-reflections` | Reflection preference |

## Saved Plan Shape

```js
{
  id,
  name,
  data,
  savedAt
}
```

`data` contains planning inputs.

Save behavior:

- creates a new plan when name is new
- overwrites existing plan with same name
- preserves existing id on overwrite
- updates `savedAt`

## Check-in Shape

```js
{
  id,
  date,
  routeDay,
  doseLogs,
  comparedToYesterday,
  planStatus,
  note,
  completedAt
}
```

Save behavior:

- one record per date by default
- existing date is overwritten
- new date is appended
- records are sorted by date

## Safe Defaults

Storage readers must:

- catch parsing errors
- return empty arrays or safe defaults
- avoid crashing when localStorage is unavailable

## Versioning Need

Current records do not include schema versions. Before cloud sync or migration work, add:

```js
schemaVersion: 1
```

to saved plans and check-ins.

## Migration Policy

Future migrations should:

1. Read old data defensively.
2. Preserve original data until migration succeeds.
3. Add missing fields with safe defaults.
4. Write migrated data with schema version.
5. Avoid deleting user records silently.

## Export / Import

Future export should include:

- app version
- schema version
- exportedAt
- saved plans
- check-ins
- user preferences

Future import should:

- preview what will be imported
- avoid overwriting without confirmation
- validate schema
- preserve local backup when possible

## Delete / Reset

Future data controls should allow:

- delete one saved plan
- delete one check-in
- clear all check-ins
- clear all local Compass data
- export before delete

Deletion copy must be plain and non-manipulative.

## Privacy Rule

Do not add cloud persistence, accounts, analytics, or external sync until privacy/security documentation and user consent flows exist.
