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
| `docs/01_PRODUCT_CONSTITUTION.md` | Defines Compass's highest product authority: vision, mission, philosophy, trust, communication, privacy, accessibility, support, never-do rules, North Star, and feature evaluation principles. | Founding Product Team | Needs Review | 2026-07-07 | None | Product, design, engineering, accessibility, documentation, future contributors |
| `docs/02_PRODUCT_REQUIREMENTS.md` | Defines users, goals, non-goals, daily workflow, planning workflow, primary use cases, failure scenarios, success metrics, and roadmap. | Product Manager | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md` | Product, UX, engineering, QA, roadmap planning |
| `docs/03_INFORMATION_ARCHITECTURE.md` | Defines navigation and each screen's purpose, primary action, secondary actions, displayed information, and navigation relationships. | UX Architect | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | UX, UI design, frontend engineering, QA |
| `docs/04_DESIGN_SYSTEM.md` | Defines typography, spacing, grid, cards, buttons, inputs, navigation, icons, animations, themes, color, responsive behavior, accessibility rules, hierarchy, and motion guidelines. | Human Interface Designer | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `03_INFORMATION_ARCHITECTURE.md` | UI design, frontend engineering, accessibility review |
| `docs/05_TECHNICAL_ARCHITECTURE.md` | Defines target folder structure, component hierarchy, data models, storage, route engine boundaries, check-ins, continuity, resources, themes, animation architecture, and future sync/account/provider/caregiver modes. | Technical Lead | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md` | Engineering, QA, architecture planning |
| `docs/06_ROUTE_ENGINE_SPECIFICATION.md` | Specifies current taper engine behavior: inputs, formulas, frequencies, cut distribution, holds, target behavior, dates, output rows, validation, CSV, sanity checks, and known gaps. | Technical Lead | Needs Review | 2026-07-07 | `05_TECHNICAL_ARCHITECTURE.md` | Engineering, QA, calculation review |
| `docs/07_CALCULATION_EXPLAINABILITY.md` | Defines how Compass explains route calculations, assumptions, uncertainty, strategies, route rows, holds, and future route comparisons. | Product + Technical Lead | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `06_ROUTE_ENGINE_SPECIFICATION.md` | Product, UX, engineering, QA |
| `docs/08_COMPONENT_CONTRACTS.md` | Defines component props, responsibilities, state ownership, emitted events, and boundaries. | Frontend Lead | Needs Review | 2026-07-07 | `03_INFORMATION_ARCHITECTURE.md`, `05_TECHNICAL_ARCHITECTURE.md` | Frontend engineering, QA |
| `docs/09_INTERACTION_FLOWS.md` | Defines step-by-step user flows for no-route, plotting, check-in, missed dose, holds, support, save/load, route review, guide/resources, settings, and mobile behavior. | UX Architect | Needs Review | 2026-07-07 | `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md` | UX, frontend engineering, QA |
| `docs/10_DECISION_LOG.md` | Records significant product and architecture decisions with reasons and impact. | Documentation Lead | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md` | All contributors |
| `docs/11_COPY_MICROCOPY_GUIDE.md` | Defines voice, preferred terminology, banned language, confirmation copy, error copy, support copy, calculation copy, empty states, and button labels. | Content Design | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md` | Product, UX, frontend engineering, QA |
| `docs/12_QA_ACCEPTANCE_CRITERIA.md` | Defines verification commands, route engine checks, screen acceptance criteria, accessibility checks, responsive checks, and product acceptance tests. | QA Lead | Needs Review | 2026-07-07 | `02_PRODUCT_REQUIREMENTS.md`, `06_ROUTE_ENGINE_SPECIFICATION.md`, `09_INTERACTION_FLOWS.md` | QA, engineering, release review |
| `docs/13_DATA_PERSISTENCE_VERSIONING.md` | Defines current storage keys, saved plan shape, check-in shape, safe defaults, schema versioning needs, migration policy, export/import, delete/reset, and privacy rule. | Technical Lead | Needs Review | 2026-07-07 | `05_TECHNICAL_ARCHITECTURE.md` | Engineering, privacy review, QA |
| `docs/14_RESOURCE_REVIEW_POLICY.md` | Defines accepted resource sources, required fields, categories, review cadence, regionalization, crisis-resource prominence, disclaimers, and add-resource checklist. | Resource Owner | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | Product, support/resource maintainers, QA |
| `docs/15_PRIVACY_SECURITY.md` | Defines current local-first posture, sensitive data inventory, privacy principles, security principles, future cloud-sync requirements, provider/caregiver sharing, analytics limits, and threat-model needs. | Privacy + Security Lead | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md`, `13_DATA_PERSISTENCE_VERSIONING.md` | Engineering, product, privacy/security review |
| `docs/16_RELEASE_CHECKLIST.md` | Defines v0.9, v1.0, and v1.1 readiness criteria, verification expectations, product review checks, and milestone procedure. | Release Lead | Needs Review | 2026-07-07 | All source-of-truth docs | Product, engineering, QA, release management |
| `docs/17_WIREFRAMES.md` | Provides low-fidelity structural wireframes for Today, Today's Step, Journey, Route, mobile Today, and Support/Resources. | UX Architect | Needs Review | 2026-07-07 | `03_INFORMATION_ARCHITECTURE.md`, `04_DESIGN_SYSTEM.md` | UX, UI design, frontend engineering |
| `docs/18_GLOSSARY.md` | Defines Compass-specific terms including Beginning, Check-in, Continuity, Current Position, Destination, Estimated Completion, Hold, Journey, Living Mode, Planning Mode, Route, and Today's Step. | Documentation Lead | Needs Review | 2026-07-07 | `01_PRODUCT_CONSTITUTION.md` | All contributors |
| `docs/COMPASS_PRODUCT_SPEC.md` | Captures the initial implementation spec for the current Compass 1.0 architecture and safe implementation order. | Product + Engineering | Draft | 2026-07-07 | Product discussion and current implementation state | Engineering reference, migration context, implementation history |
| `docs/DOCUMENTATION_INDEX.md` | Lists all documentation files and audits whether the documentation is sufficient to rebuild Compass from scratch. | Documentation Lead | Needs Review | 2026-07-07 | All documentation files | All contributors |

## Authority Order

When documents conflict, use this order:

1. `01_PRODUCT_CONSTITUTION.md`
2. `02_PRODUCT_REQUIREMENTS.md`
3. `03_INFORMATION_ARCHITECTURE.md`
4. `04_DESIGN_SYSTEM.md`
5. `05_TECHNICAL_ARCHITECTURE.md`
6. `06_ROUTE_ENGINE_SPECIFICATION.md`
7. `07_CALCULATION_EXPLAINABILITY.md`
8. `08_COMPONENT_CONTRACTS.md`
9. `09_INTERACTION_FLOWS.md`
10. `10_DECISION_LOG.md`
11. `11_COPY_MICROCOPY_GUIDE.md`
12. `12_QA_ACCEPTANCE_CRITERIA.md`
13. `13_DATA_PERSISTENCE_VERSIONING.md`
14. `14_RESOURCE_REVIEW_POLICY.md`
15. `15_PRIVACY_SECURITY.md`
16. `16_RELEASE_CHECKLIST.md`
17. `17_WIREFRAMES.md`
18. `18_GLOSSARY.md`
19. `COMPASS_PRODUCT_SPEC.md`
20. `DOCUMENTATION_INDEX.md`

`COMPASS_PRODUCT_SPEC.md` is implementation history. Future work should reconcile anything still useful into the numbered source-of-truth documents or retire it.

## 10/10 Documentation Test

| Question | Answered By | Current Coverage |
|---|---|---|
| What is Compass? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | Strong |
| Who is it for? | `02_PRODUCT_REQUIREMENTS.md` | Strong |
| What problem does it solve? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md` | Strong |
| What does "Continuity" mean? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `05_TECHNICAL_ARCHITECTURE.md`, `18_GLOSSARY.md` | Strong |
| What is Living Mode? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `18_GLOSSARY.md` | Strong |
| What is Planning Mode? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md`, `18_GLOSSARY.md` | Strong |
| How should the app communicate? | `01_PRODUCT_CONSTITUTION.md`, `11_COPY_MICROCOPY_GUIDE.md` | Strong |
| What should it never do? | `01_PRODUCT_CONSTITUTION.md` | Strong |
| How is the taper engine structured? | `05_TECHNICAL_ARCHITECTURE.md`, `06_ROUTE_ENGINE_SPECIFICATION.md` | Strong |
| How should a new feature be evaluated? | `01_PRODUCT_CONSTITUTION.md`, `12_QA_ACCEPTANCE_CRITERIA.md` | Strong |
| How should the UI feel? | `01_PRODUCT_CONSTITUTION.md`, `04_DESIGN_SYSTEM.md`, `17_WIREFRAMES.md` | Strong |
| How should accessibility be handled? | `01_PRODUCT_CONSTITUTION.md`, `04_DESIGN_SYSTEM.md`, `12_QA_ACCEPTANCE_CRITERIA.md` | Strong |
| How should support resources be handled? | `01_PRODUCT_CONSTITUTION.md`, `02_PRODUCT_REQUIREMENTS.md`, `03_INFORMATION_ARCHITECTURE.md`, `14_RESOURCE_REVIEW_POLICY.md` | Strong |
| How are calculations explained? | `07_CALCULATION_EXPLAINABILITY.md`, `06_ROUTE_ENGINE_SPECIFICATION.md` | Strong |
| What is the roadmap? | `02_PRODUCT_REQUIREMENTS.md`, `16_RELEASE_CHECKLIST.md` | Strong |

## Rebuild Audit

If the entire source code were deleted, Compass could now be rebuilt to the intended product architecture from the documentation, but not with byte-for-byte parity.

The documentation now captures:

- product philosophy
- users and requirements
- information architecture
- design system
- technical architecture
- route engine behavior and known gaps
- calculation explainability
- component responsibilities
- interaction flows
- microcopy direction
- QA expectations
- storage and versioning rules
- resource review policy
- privacy/security principles
- release criteria
- low-fidelity wireframes
- glossary
- major decisions and rationale

## Remaining Knowledge Gaps

The remaining gaps are acceptable for a v0.9 product foundation, but should be closed before a public 1.0 release:

1. High-fidelity visual design references.
2. Automated test suite implementation details.
3. Full threat model.
4. Exact future cloud sync architecture.
5. Exact provider/caregiver permission model.
6. Final v1.0 content review and legal/medical disclaimer review.

## Documentation Verdict

Current documentation quality: **9/10 for v0.9 product foundation**.

It is strong enough to guide future product and engineering work without relying on conversation memory. It is not yet a final public-release compliance, security, or high-fidelity design package.
