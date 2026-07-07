# Privacy and Security Philosophy

Last updated: 2026-07-07

Compass handles sensitive health-adjacent information. Privacy and security must be part of product design, not an afterthought.

## Current Posture

Compass is local-first.

Current data is stored in the user's browser localStorage:

- saved plans
- check-ins
- theme preference
- reflection preference

No cloud sync, accounts, or server storage are currently required.

## Sensitive Data Inventory

Potentially sensitive:

- medication names
- dose amounts
- taper strategy
- route dates
- check-ins
- missed doses
- notes
- support-needed markers
- future provider/caregiver sharing

## Privacy Principles

- collect the minimum required data
- prefer local-first storage
- explain what is stored
- allow export before destructive deletion
- do not sell health data
- do not use health data for advertising
- do not lock urgent support behind accounts or payment

## Security Principles

- validate imported data before use
- avoid executing user-provided content
- treat notes as sensitive text
- avoid unnecessary third-party scripts
- avoid sending route/check-in data externally without explicit user action

## Future Cloud Sync Requirements

Before cloud sync:

- define account model
- define encryption approach
- define sync conflict behavior
- define export/delete flows
- define retention policy
- define provider/caregiver permissions
- document threat model
- create privacy copy users can understand

## Provider and Caregiver Sharing

Future sharing must be:

- user initiated
- revocable
- scoped
- auditable
- clear about what is shared

## Analytics

Analytics must not capture medication names, dose values, notes, or route details.

If analytics are added, they must be documented and privacy-reviewed first.

## Threat Model Needed Before 1.0 Public Release

Create a dedicated threat model covering:

- local device access
- browser storage limitations
- exported files
- accidental sharing
- future cloud sync
- provider/caregiver access
- third-party resource links
