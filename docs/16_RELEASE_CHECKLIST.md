# Release Checklist

Last updated: 2026-07-07

This checklist defines milestone readiness for Compass.

## v0.9 Product Foundation

Required:

- stable taper engine
- Living Mode vs Planning Mode architecture
- Product Constitution
- Product Requirements
- Information Architecture
- Design System
- Technical Architecture
- Documentation Index
- Route Engine Specification
- Calculation Explainability Specification
- Component Contracts
- Interaction Flows
- Decision Log
- Copy and Microcopy Guide
- QA and Acceptance Criteria
- Data Persistence and Versioning
- Resource Review Policy
- Privacy and Security Philosophy
- Wireframes
- Glossary

Verification:

```bash
npm run build
```

and route engine sanity checks.

## v1.0 Local Product

Required:

- Today surface replaces Dashboard label
- Journey Story card exists
- Beginning, Current Position, Destination, Estimated Completion are visible
- Today shows weekday, date, and route day
- check-in flow is complete
- support is accessible from daily flow
- route table, CSV, and print work
- local data export/delete decision made
- core docs reviewed
- accessibility smoke test complete

## v1.1 Product Refinement

Candidate scope:

- theme engagement visual
- route change audit trail
- better calculation explanations
- route comparison
- support hierarchy refinements
- resource review workflow

## Pre-Release Product Review

Before any release:

- review against Product Constitution
- confirm no shame language
- confirm no unsupported medical recommendations
- confirm daily workflow remains under one minute
- confirm support is reachable
- confirm route engine behavior is documented

## Git Milestone Procedure

Recommended:

```bash
git status
npm run build
git tag v0.9.0
git push origin main --tags
```

Only push after documentation and verification are intentionally reviewed.
