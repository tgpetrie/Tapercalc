# Compass Product Constitution

This document is the highest product authority in the Compass repository. Product requirements, interface decisions, technical architecture, feature proposals, and pull requests must align with it.

## Vision

Compass is a navigation system for people living through long-term medication tapering.

It exists to reduce uncertainty, preserve orientation, and support informed conversations with clinicians and trusted support people. Compass should feel like a calm daily workspace, not a spreadsheet, landing page, symptom tracker, or engagement product.

## Mission

Compass helps users understand:

- Where am I?
- What does today ask of me?
- What happens next?

Compass never replaces medical care. It supports thoughtful planning, honest tracking, and shared decision making.

## Product Philosophy

Compass exists to earn trust, not attention.

Every interaction must have a clear purpose. No notification, animation, metric, or feature should exist only to increase engagement. If it does not help the user navigate their journey, it does not belong.

Compass is built around orientation, not motivation. It should show the user their beginning, current position, destination, estimated completion, today's step, and next meaningful change.

## Continuity Over Compliance

Compass rewards engagement, not perfection.

Continuity is preserved when users honestly log:

- planned doses
- missed doses
- holds or rest points
- adjustments
- symptoms or difficulty
- questions
- support needs
- clinician or support-person conversations

Compass must never use "failed", "off track", "perfect streak", "broken streak", or language that makes imperfect days feel like punishment.

Preferred concepts:

- continuity
- days logged
- journey record
- check-in rhythm
- last check-in
- rest point honored

Compass does not celebrate perfect tapering. Compass celebrates staying engaged with the journey.

## Living Mode vs Planning Mode

Compass has two primary modes.

**Living Mode** is daily use. It must be calm, simple, and fast enough to complete in under one minute. It shows today's doses, allows honest logging, allows notes, gives support access, and preserves continuity.

**Planning Mode** is route work. It contains strategy, frequency, segments, rest points, daily doses, target, start date, save/load, advanced options, and Plot My Course. Planning Mode can be more detailed, but must remain predictable and explainable.

Daily surfaces must not become planning surfaces. Planning surfaces must not hide risk, uncertainty, or assumptions.

## Emotional Design

Compass should feel steady, plainspoken, and useful. It should not be falsely cheerful, dramatic, clinical, or patronizing.

The emotional anchor is progress through engagement. Theme-based visual cues may evolve over time, but only to reflect continued engagement, not perfect adherence or dose reduction.

Examples:

- Forest: sapling to mature forest.
- Ocean: route line across water.
- Night: constellations revealed.
- Alpine: trail markers accumulated.

Visual rewards must be subtle, optional, accessible, and non-manipulative.

## Communication Charter

Compass must always:

- tell the truth
- acknowledge uncertainty
- separate facts from interpretations
- avoid false hope
- avoid unnecessary fear
- avoid toxic positivity
- avoid guilt
- speak plainly
- respect autonomy
- support shared decision making

Unacceptable language:

- "You've got this."
- "You'll be fine."
- "Everything gets better."
- "Perfect streak."
- "You failed."
- "Get back on track."

Preferred language:

- "Today's check-in has been recorded."
- "Your route has been updated."
- "Estimated completion."
- "This pattern may be useful to discuss with your clinician."
- "A rest point can be part of staying engaged."

## Trust Principles

Compass must make important behavior legible.

Every calculation should answer:

- How was this calculated?
- What strategy was used?
- What assumptions exist?
- What changed since the previous route?

Every plan change should be explainable and eventually auditable. Users should always understand whether they are viewing a planned route, a logged day, or an adjusted record.

## Privacy Principles

Medication tapering data is sensitive health-adjacent information. Compass must treat it with restraint.

Principles:

- Store only what is necessary.
- Prefer local-first storage until cloud sync is intentionally designed.
- Make export and deletion clear.
- Do not sell user health data.
- Do not use health data for advertising.
- Do not hide essential safety features behind payment.
- Do not create dark patterns around account creation or data retention.

## Accessibility Philosophy

Compass must pass the Bad Day Test:

What is the least this person needs to do today to remain engaged?

That answer must never require navigating a complex interface.

Design for users experiencing:

- brain fog
- fatigue
- anxiety
- withdrawal
- poor concentration
- low vision
- motor difficulty
- urgency or distress

Accessibility requirements:

- clear hierarchy
- large touch targets
- predictable navigation
- minimal decisions on daily surfaces
- plain language
- visible focus states
- color-independent meaning
- reduced-motion support
- readable type sizes

## Resource Philosophy

Resources must be free or clearly marked, reputable, evidence-informed, and public. Compass should start with trusted organizations and avoid overcrowding the product with unverified content.

Resource categories:

- Urgent / Crisis Support
- Medication / Taper Education
- Finding Professional Support
- Daily Coping Tools
- Support Communities
- Printable Tools

Resources do not replace medical care, emergency services, or clinician guidance.

## Support Philosophy

Support must be integrated into daily workflows, not hidden in settings or footer links.

Daily screens should include access to:

- common questions
- reassurance without false certainty
- appointment preparation
- urgent help
- trusted education

Compass should normalize difficulty without prescribing next medical steps. Medication-specific decisions should point users toward clinicians, pharmacists, or trusted support people.

## What Compass Will Never Do

Compass will never:

- replace a clinician
- recommend medication changes
- diagnose medical conditions
- promise outcomes
- shame users
- hide uncertainty
- encourage unsafe tapering
- compare users against one another
- sell user health data
- lock essential safety features behind payment
- use manipulative notifications
- use dark patterns
- pressure users to open the app for its own sake

## North Star

A user can open Compass on a difficult day and immediately understand:

- where they started
- where they are
- where they are going
- what today asks of them
- what happens next
- how to stay engaged even if today is imperfect

## Product Test

Before every major feature, ask:

- Does this reduce uncertainty?
- Does this preserve orientation?
- Does this respect the user's autonomy?
- Does this separate planning from daily living?
- Does this avoid guilt?
- Does this explain assumptions?
- Does this remain usable on a bad day?
- Does this earn trust rather than attention?

Reject features that increase cognitive load, create guilt, pretend certainty, add unnecessary complexity, or conflict with this constitution.

## Design Principles

1. Today first.
2. Story before controls.
3. Continuity over compliance.
4. Plain language over encouragement theater.
5. Explain calculations and assumptions.
6. Keep planning powerful but contained.
7. Make support visible without making distress the center of the product.
8. Favor local-first privacy.
9. Reward engagement, not perfection.
10. Earn trust, not attention.
