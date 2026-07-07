# Compass Design System

This document defines the visual and interaction standards for Compass. It derives from `docs/01_PRODUCT_CONSTITUTION.md`.

## Typography

Compass should use a restrained typography scale.

Recommended roles:

- Page title: 28-36px desktop, 24-30px mobile.
- Section heading: 20-24px.
- Card heading: 16-20px.
- Body: 15-16px.
- Supporting text: 13-14px.
- Labels: 11-12px, high weight, uppercase only when useful.

Avoid oversized hero typography on product surfaces. Today is an operating surface, not a landing page.

## Spacing System

Use an 8px spacing grid.

Recommended tokens:

- 4px: tiny inline gap
- 8px: compact gap
- 12px: control grouping
- 16px: card internal rhythm
- 24px: section spacing
- 32px: major layout spacing
- 48px: rare large separation

Daily surfaces should be compact and scannable.

## Grid

Desktop should be the primary planning layout.

Desktop:

- persistent left navigation
- main content area
- 12-column content grid where useful
- support rail for daily check-in

Tablet:

- reduced columns
- support rail may become stacked

Mobile:

- Today-first
- bottom navigation acceptable
- planning controls stacked
- support access reachable without hunting

## Cards

Cards should frame individual tools, repeated items, or focused panels. Do not nest cards inside cards.

Card standards:

- radius: 8px maximum unless a system pattern requires otherwise
- subtle border
- restrained shadow
- clear heading
- one primary purpose per card

Cards should not be decorative page sections.

## Buttons

Each screen should have one clear primary action.

Primary buttons:

- Today: Continue Journey / Log Today
- Journey: Plot My Course
- Today's Step: Save Check-in

Secondary buttons are for navigation or supporting actions. Avoid using button labels that sound motivational when a plain command is clearer.

## Inputs

Inputs must be predictable and forgiving.

Rules:

- label every input
- preserve typed values when possible
- show validation near the problem
- avoid hidden required fields
- collapse advanced options by default in Planning Mode
- use segmented controls for small fixed choices
- use checkboxes/toggles for binary settings

## Navigation

Primary navigation should reflect product concepts:

- Today
- Journey
- Route
- Guide
- Insights
- Settings

Navigation should be stable across desktop and mobile. The user should always know whether they are living today, planning the journey, or reviewing the route.

## Icons

Icons should clarify controls, not decorate the product.

Use icons for:

- navigation markers
- save/export/print
- support/resource categories
- dose status where accessible labels are present

Do not invent symbolic systems that require explanation.

## Animations

Motion should be quiet, optional, and purposeful.

Allowed:

- small confirmation cue after saving
- route progression visualization
- theme evolution based on engagement
- focus/hover transitions

Avoid:

- confetti
- pressure-driven streak animations
- constant movement
- motion that implies medical improvement

Respect reduced-motion preferences.

## Themes

Themes should express tone without changing product meaning.

Theme examples:

- Forest
- Ocean
- Night
- Alpine
- Paper
- Light
- Dark

Theme-based engagement visuals should evolve with continued check-ins, not perfect adherence or dose reduction.

## Color Palette

Color should support hierarchy, status, and calm orientation.

Requirements:

- sufficient contrast
- status meaning not conveyed by color alone
- avoid overwhelming single-hue interfaces
- avoid alarmist red except for true warnings or urgent support
- use muted surfaces for dense planning areas

## Desktop Behavior

Desktop should be dense, calm, and work-focused.

Expected behavior:

- left navigation
- Today visible at a glance
- planning form contained in Journey
- route table remains usable
- support rail available during check-in

## Tablet Behavior

Tablet should preserve hierarchy while reducing density.

Expected behavior:

- navigation may collapse or become top/bottom
- two-column layouts become one or two columns based on width
- support rail stacks after primary content

## Mobile Behavior

Mobile should prioritize daily use.

Expected behavior:

- Today first
- one clear primary action
- large touch targets
- route summary before full table
- planning possible but secondary
- support reachable from daily flow

## Accessibility Rules

Compass must support users with brain fog, fatigue, anxiety, withdrawal, poor concentration, low vision, and motor difficulty.

Rules:

- clear focus states
- keyboard access
- minimum 44px touch targets
- readable line lengths
- no color-only meaning
- no animation-only feedback
- plain language
- predictable layout
- support and urgent help easy to find

## Visual Hierarchy

Hierarchy should answer:

1. What day is it?
2. What route day is this?
3. What is today's scheduled step?
4. Where am I in the journey?
5. What happens next?
6. What can I do if today is difficult?

If a visual element does not support those questions, it should be secondary or removed.

## Motion Guidelines

Motion must earn its place.

Use motion for:

- saved-state confirmation
- route orientation
- gentle theme progression

Do not use motion for:

- urgency
- fake celebration
- retention pressure
- medical reassurance
