# Compass Information Architecture

This document defines the product structure for Compass. It derives from `docs/01_PRODUCT_CONSTITUTION.md`.

## Primary Navigation

Compass should be organized around current-user needs:

1. Today
2. Journey
3. Route
4. Guide
5. Insights
6. Settings

The current implementation may still use Dashboard or Calendar labels. The target architecture should move toward Today and Route.

## Today

### Purpose

Today is the daily home surface. It answers what matters now.

### Primary Action

Continue Journey / Log Today.

### Secondary Actions

- View Route
- Open Guide
- Access Support

### Displayed Information

- weekday and date
- route day
- today's scheduled total
- today's scheduled doses
- current position
- beginning dose
- destination dose
- estimated completion when available
- next reduction
- next rest point
- continuity status

### Navigation Relationships

Today links to Today's Step, Route, Guide, and Support. Today should not expose Plot My Course as a primary or quick action.

## Today's Step

### Purpose

Today's Step is the focused daily check-in. It records what happened today and preserves continuity.

### Primary Action

Save Check-in.

### Secondary Actions

- Close
- Add note
- Open support/resource panel

### Displayed Information

- today's scheduled dose total
- individual doses
- status options for each dose
- compared-to-yesterday prompt
- plan status
- optional note
- support prompts

### Navigation Relationships

Today's Step is opened from Today. It should return the user to Today after saving or closing.

## Journey

### Purpose

Journey is Planning Mode. It is where the route is created or changed.

### Primary Action

Plot My Course.

### Secondary Actions

- Guided Setup
- Save Plan
- Load Plan
- Advanced Options
- Add Rest Point
- Review Engine Status

### Displayed Information

- daily doses
- target
- strategy
- frequency
- reduction settings
- start date
- holds/rest points
- advanced cut distribution
- validation warnings
- calculation preview

### Navigation Relationships

Journey sends plotted output to Route. Journey may link to Guide for definitions and to Resources for planning support.

## Route

### Purpose

Route shows the calculated path through time.

### Primary Action

Review route.

### Secondary Actions

- Print
- Export CSV
- View table
- View card route
- Return to Journey for edits

### Displayed Information

- route summary
- next route days
- reductions
- rest points
- daily totals
- dose breakdown
- table output
- printable/exportable view

### Navigation Relationships

Route receives output from Journey and provides context back to Today. It must preserve table, CSV, and print behavior.

## Guide

### Purpose

Guide explains product and taper-planning concepts in plain language.

### Primary Action

Search or browse explanations.

### Secondary Actions

- Open related resources
- Return to Journey or Today

### Displayed Information

- glossary terms
- short explanations
- strategy descriptions
- support-oriented definitions

### Navigation Relationships

Guide supports Journey decisions and Today questions. It should not become a medical advice database.

## Resources

### Purpose

Resources provide trusted support, education, and preparation materials.

### Primary Action

Open a relevant trusted resource.

### Secondary Actions

- Search
- Filter by category
- Open worksheet

### Displayed Information

- resource title
- category
- source
- cost
- region
- description
- link or internal worksheet status

### Navigation Relationships

Resources appear inside Guide and as a compact support rail from daily surfaces.

## Insights

### Purpose

Insights is future-ready analysis. It should remain modest until enough user-owned data exists.

### Primary Action

Review patterns.

### Secondary Actions

- Export report
- Review route history

### Displayed Information

- route length
- final position
- rest points
- future dose graph
- future symptom trends
- future provider report

### Navigation Relationships

Insights should draw from check-ins, route changes, and exported summaries. It should not distract from Today.

## Settings

### Purpose

Settings controls product preferences and future privacy/account behavior.

### Primary Action

Adjust preferences.

### Secondary Actions

- Change theme
- Toggle reflections
- Manage future privacy/export/account settings

### Displayed Information

- theme choices
- daily reflection preference
- future accessibility settings
- future data controls

### Navigation Relationships

Settings should not contain support or urgent resources that daily users may need quickly.
