# Compass Documentation Index

Last updated: 2026-07-07

This index lists every documentation file in `docs/`, its purpose, owner, status, dependencies, and intended consumers.

## Status Definitions

- **Draft**: Useful but incomplete or not yet reconciled with the full product direction.
- **Needs Review**: Ready for review, but not yet approved as authoritative.
- **Complete**: Approved and internally consistent enough to guide implementation.

## Documentation Map

| File | Purpose | Owner | Status | Last Updated | Depends On | Used By |
|---|---|---|---|---|---|---|
| `docs/01_PRODUCT_CONSTITUTION.md` | Defines Compass's highest-level product authority: vision, mission, philosophy, trust, communication, privacy, accessibility, support, never-do rules, North Star, and feature evaluation principles. | Founding Product Team | Needs Review | 2026-07-07 | None | Product, design, engineering, accessibility, documentation, future contributors |
| `docs/02_PRODUCT_REQUIREMENTS.md` | Defines users, goals, non-goals, daily workflow, planning workflow, primary use cases, failure scenarios, success metrics, and roadmap. | Product Manager | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md` | Product, UX, engineering, QA, roadmap planning |
| `docs/03_INFORMATION_ARCHITECTURE.md` | Defines the product navigation model and each screen's purpose, primary action, secondary actions, displayed information, and navigation relationships. | UX Architect | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | UX, UI design, frontend engineering, QA |
| `docs/04_DESIGN_SYSTEM.md` | Defines typography, spacing, grid, cards, buttons, inputs, navigation, icons, animations, themes, color, responsive behavior, accessibility rules, hierarchy, and motion guidelines. | Human Interface Designer | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `03_INFORMATION_ARCHITECTURE.md` | UI design, frontend engineering, accessibility review |
| `docs/05_TECHNICAL_ARCHITECTURE.md` | Defines target folder structure, component hierarchy, data models, storage, route engine boundaries, check-ins, continuity, resources, themes, animation architecture, and future sync/account/provider/caregiver modes. | Technical Lead | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md` | Engineering, QA, future architecture planning |
| `docs/COMPASS_PRODUCT_SPEC.md` | Captures the initial implementation spec for the current Compass 1.0 architecture: Living Mode, Planning Mode, Today's Step, continuity rules, support/resources, IA, component plan, data models, and safe implementation order. | Product + Engineering | Draft | 2026-07-07 | Product discussion and current implementation state | Engineering reference, migration context, implementation history |
| `docs/DOCUMENTATION_INDEX.md` | Lists all documentation files and audits whether the documentation is sufficient to rebuild Compass from scratch. | Documentation Lead | Needs Review | 2026-07-07 | All documentation files | All contributors |

## Authority Order

When documents conflict, use this order:

1. `01_PRODUCT_CONSTITUTION.md`
2. `02_PRODUCT_REQUIREMENTS.md`
3. `03_INFORMATION_ARCHITECTURE.md`
4. `04_DESIGN_SYSTEM.md`
5. `05_TECHNICAL_ARCHITECTURE.md`
6. `COMPASS_PRODUCT_SPEC.md`
7. `DOCUMENTATION_INDEX.md`

`COMPASS_PRODUCT_SPEC.md` is useful implementation history, but it is not the highest authority. Future work should reconcile it into the numbered source-of-truth documents or retire it after review.

## 10/10 Documentation Test

A new engineer should be able to answer these questions from the current documentation:

| Question | Answered By | Current Coverage |
|---|---|---|
| What is Compass? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | Strong |
| Who is it for? | `02_PRODUCT_REQUIREMENTS.md` | Strong |
| What problem does it solve? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | Strong |
| What does "Continuity" mean? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `05_TECHNICAL_ARCHITECTURE.md` | Strong |
| What is Living Mode? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `COMPASS_PRODUCT_SPEC.md` | Strong |
| What is Planning Mode? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md` | Strong |
| How should the app communicate? | `01_PRODUCT_CONSTITUTION.md` | Strong |
| What should it never do? | `01_PRODUCT_CONSTITUTION.md` | Strong |
| How is the taper engine structured? | `05_TECHNICAL_ARCHITECTURE.md` | Partial |
| How should a new feature be evaluated? | `01_PRODUCT_CONSTITUTION.md` | Strong |
| How should the UI feel? | `01_PRODUCT_CONSTITUTION.md`, `04_DESIGN_SYSTEM.md` | Strong |
| How should accessibility be handled? | `01_PRODUCT_CONSTITUTION.md`, `04_DESIGN_SYSTEM.md` | Strong |
| How should support resources be handled? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md`, `05_TECHNICAL_ARCHITECTURE.md` | Strong |
| How are calculations explained? | `01_PRODUCT_CONSTITUTION.md`, `05_TECHNICAL_ARCHITECTURE.md` | Partial |
| What is the roadmap? | `02_PRODUCT_REQUIREMENTS.md` | Moderate |

## Rebuild Audit

If the entire source code were deleted, Compass could not yet be rebuilt solely from the documentation.

The documentation is strong enough to rebuild the product philosophy, screen model, broad workflows, visual tone, data model direction, and technical boundaries. It is not yet specific enough to recreate all behavior, algorithms, edge cases, component contracts, or acceptance criteria without inspecting the current code.

## Missing Knowledge

To reach 10/10 rebuild-grade documentation, Compass still needs these documents or sections:

1. **Route Engine Specification**
   - Exact taper strategies.
   - Exact formulas.
   - Rounding behavior.
   - Stop conditions.
   - Frequency rules.
   - Hold/rest-point behavior.
   - Multi-dose reduction distribution.
   - Calendar date generation.
   - Sanity-check cases and expected outputs.

2. **Calculation Explanation Specification**
   - How every route explains "how this was calculated."
   - Which assumptions are shown.
   - How strategy differences are translated into plain language.
   - How uncertainty is represented.
   - How calculation changes are compared between route versions.

3. **Component Contract Specification**
   - Props and responsibilities for each major component.
   - State ownership.
   - Event names and expected payloads.
   - Empty, loading, error, and saved states.
   - Which components are product-level vs reusable UI primitives.

4. **Interaction Flow Specifications**
   - Exact step-by-step behavior for Today, Today's Step, Journey, Route, Guide, Resources, Insights, and Settings.
   - Button outcomes.
   - Modal/drawer behavior.
   - Save/close/cancel behavior.
   - Mobile-specific interaction rules.

5. **Content and Microcopy Guide**
   - Approved labels.
   - Error messages.
   - Empty states.
   - Confirmation messages.
   - Support language.
   - Banned phrases beyond the examples in the constitution.

6. **Acceptance Criteria and QA Matrix**
   - Definition of done per screen.
   - Manual QA scripts.
   - Accessibility checks.
   - Responsive checks.
   - Print/CSV checks.
   - Regression checks for the taper engine.

7. **Data Persistence Specification**
   - Exact localStorage keys.
   - Versioning strategy.
   - Migration behavior.
   - Corrupt-data recovery.
   - Export/import format.
   - Delete/reset behavior.

8. **Resource Review Policy**
   - Criteria for adding resources.
   - Source review cadence.
   - Last-reviewed process.
   - Regionalization rules.
   - Crisis-resource prominence rules.

9. **Privacy and Security Specification**
   - Threat model.
   - Sensitive data inventory.
   - Local-only risk handling.
   - Future cloud-sync requirements.
   - Account deletion/export requirements.

10. **Versioned Roadmap and Release Criteria**
    - Version 1.0 completion criteria.
    - Version 1.1 scope.
    - Explicit non-goals per release.
    - Migration strategy from current implementation to target IA.

11. **Visual Reference / Wireframe Pack**
    - Today desktop wireframe.
    - Today mobile wireframe.
    - Journey planning wireframe.
    - Route table/card wireframe.
    - Support/resource wireframe.
    - Engagement visual examples.

12. **Glossary**
    - Compass-specific meanings for route, journey, rest point, hold, continuity, current position, destination, check-in, adjustment, support needed, route day, and estimated completion.

## Documentation Verdict

Current documentation quality: **7/10**.

It is strong enough to align a product team. It is not yet strong enough to recreate the software from zero without product and engineering interpretation.

The biggest missing piece is the exact route engine specification. The second biggest missing piece is interaction-level acceptance criteria.
