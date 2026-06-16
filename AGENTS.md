---
Source: .ruler\10-project-overview.md
---
# Project Overview

Subfolio is a smart, forward-looking finance app. The current product focus is
tracking subscriptions and recurring expenses, then using that recurring
schedule to forecast future cash flow and show where money goes over time.

## Stack

- Vue 3 with Composition API and `<script setup>`
- JavaScript application code
- PrimeVue styled mode with an Aura-derived Subfolio preset
- PrimeIcons for UI iconography
- Tailwind CSS 4 theme tokens in `src/assets/main.css`
- Vue Router 4 for navigation and route guards
- Firebase Realtime Database and PocketBase client SDKs for user-owned storage
- Vite for local development and production builds

## Working Rules

- Follow the existing Vue, PrimeVue, Tailwind layout, and Vue Router patterns.
- Use npm for project commands.
- Keep root build and lint checks passing after code changes.
- Do not commit generated `dist/` output unless explicitly asked.
- Do not add auth provider secrets, API keys, or database credentials to source
  files.
- Treat saved database connection state as the current app entry condition.
- Treat `?config=` links as database-connection replacement links. The value is
  a base64-encoded JSON connection, applied before app route guards run.
- Keep Subfolio frontend-only unless the user explicitly asks for hosted backend
  work.

---
Source: .ruler\15-linear-workflow.md
---
# Linear Workflow

Linear is the source of truth for Subfolio issues and tasks. Each session should
map to a Linear issue whenever possible.

## Defaults

- Team: DEV
- Project: subfolio
- New work starts by co-planning the scope in chat before creating or updating
  the Linear issue.
- If the user references a Linear issue, fetch it and work under that issue.
- Reflect the real work state in Linear whenever the work state changes.

## Status Usage

- Backlog: raw ideas, not scoped yet.
- Discovery: research or requirements gathering.
- Planned: scoped work with defined outcomes, waiting to be scheduled.
- Ready to Start: approved and next in line to execute.
- In Progress: actively being implemented now.
- On Hold: waiting on non-blocking feedback or a decision; partial progress is possible.
- Blocked: hard blocker prevents progress until resolved.
- In Review: implementation done, awaiting user validation.
- Completed: user approved the result.
- Awaiting Next Update: paused until a future cycle or dependency is ready.
- Canceled: work no longer needed.

## Task Protocol

1. Co-plan tasks in chat before creating them in Linear.
2. When starting a task, move it to In Progress.
3. If a question is needed to continue, move it to On Hold.
4. If a hard blocker exists, move it to Blocked.
5. When work is done, move it to In Review.
6. After user confirmation, move it to Completed.

If Linear tools are unavailable, continue useful local work when safe and report
that Linear could not be updated.

---
Source: .ruler\20-commands-and-verification.md
---
# Commands And Verification

Use these npm scripts for local work:

```bash
npm run dev              # Start the Vite app
npm run check            # Run the production build check
npm run lint             # Run ESLint
npm run verify           # Run all required checks in project order
npm run build            # Build the frontend app
npm run ruler            # Apply Ruler-generated agent files
npm run ruler:revert     # Revert Ruler-generated agent file changes
npm run ruler:revert:dry # Preview Ruler revert changes
```

Use `npm run verify` as the main validation command for meaningful changes.
When iterating, run the most targeted root command first, then run the broader
root command before finishing.

There is no production deployment workflow documented yet. Keep deployment
assumptions out of code and docs until that decision is made.

## Generated Files

- Treat `.ruler/` as the editable source of truth for agent instructions.
- Treat root `AGENTS.md` and other agent-specific instruction outputs as generated files.
- Regenerate agent outputs with `npm run ruler` after editing `.ruler` sources.
- If generated outputs are noisy, inspect the git diff before committing.

---
Source: .ruler\25-testing-strategy.md
---
# Testing Strategy

Automated test coverage is still early in this repo. For each feature, fix, or
refactor, add or update the smallest useful set of checks that protects the
behavior being changed.

## Expectations For New Work

- Prefer adding at least one regression test for every issue when there is
  observable behavior to protect.
- Use unit tests for isolated application logic, data normalization, recurrence
  calculations, formatting helpers, currency conversion, and request/response
  mapping when a test harness is introduced.
- Use end-to-end tests for user-facing browser workflows, route behavior,
  rendering states, modal flows, expense CRUD, settings persistence, and
  forecast workflows when a browser test harness is introduced.
- Use both unit and end-to-end tests when an issue changes business logic and the
  user workflow that exposes it.
- Keep tests focused on durable behavior, not incidental implementation
  details. Tests should make it harder to accidentally remove or break an
  expected capability in future work.

## Test Commands

- `npm run check` runs the production build check.
- `npm run lint` runs ESLint.
- `npm run verify` runs the required root validation sequence.

Run the most relevant targeted command while iterating, then run the broader
validation set before finishing meaningful changes. Do not claim behavior was
browser-verified unless you actually opened and exercised the app.

## End-To-End Test Design

- Put future Playwright tests under `tests/e2e/`.
- Keep feature-oriented tests readable with `Feature:` and `Scenario:` naming.
- Use shared helpers under `tests/e2e/support/` for repeated setup such as
  database connection state, seeded expenses, settings state, and provider
  fixtures.
- Create a fresh dataset for expense workflow tests unless the test specifically
  needs to verify persistence across an existing dataset.
- Prefer testing full browser workflows over manually mutating application state
  from tests.

## Stable UI Selectors

Use `data-test-id` attributes for UI elements that end-to-end tests need to
click, fill, inspect, or wait on. Avoid fragile selectors based on CSS classes,
DOM depth, or translated copy when the element is part of a durable workflow.

- Add `data-test-id` to buttons, fields, menus, modals, cards, tabs, toggles,
  and repeated list items that tests manipulate or assert against.
- Use predictable names such as `expense-save`, `expense-row`,
  `settings-currency`, or `recurrence-filter`.
- For repeated items, combine a stable `data-test-id` with a data attribute that
  identifies the item, such as `data-expense-id` or `data-category-name`.
- Keep `data-test-id` attributes user-invisible and behavior-neutral.

---
Source: .ruler\30-architecture.md
---
# Architecture

## Data Flow

```text
User input
  -> Vue composables (useExpenses, useSettings, useDatabaseConnection)
  -> selected provider adapter
  -> user-owned Firebase Realtime Database or PocketBase collection
  -> reactive Vue UI
```

- Expense data should flow through provider adapters when a connection exists.
- Settings currently persist to `localStorage` under `subfolio-settings`.
- Database connection state persists to `localStorage` under
  `subfolio-database-connection`.
- Any route may include a `config` query parameter. It is a base64-encoded JSON
  database connection, applied before app route guards run, then removed from
  the URL with a replace navigation.
- Keep persistence details behind composables or adapter modules so storage can
  move later without rewriting view components.

## Routing

Routes are defined in `src/router/index.js`:

- `/` shows the public landing page.
- `/features` explains the application feature set.
- `/about` explains the project and product rationale.
- `/byodb` explains the bring-your-own-database model.
- `/pricing` shows current tiers.
- `/open-source` explains source availability, user-owned data, BYODB, and contribution through GitHub.
- `/changelog` renders `CHANGELOG.md`.
- `/privacy`, `/terms`, `/refund-policy`, and `/license` are footer-only legal pages.
- `/connect` shows the database connection page.
- `/login` redirects to `/connect`.
- `/app` shows the connected dashboard.
- `/app/expenses` shows the recurring expense tracker.
- `/app/categories` shows expenses grouped by category.
- `/app/recurrences` shows recurring payment schedules.
- `/app/settings` shows local user preferences.

App routes redirect to `/connect` when no database connection is saved.
Public "Open App" calls to action should route to `/app`; the app route guard
handles database setup by redirecting to `/connect` when needed.

`?config=` links replace the saved database connection on whatever route they
are opened from. Accepted payloads include native Subfolio connection objects
and raw Firebase config objects using either `databaseURL` or Refinimo-style
`databaseUrl`.

## Database Adapters

Provider adapters live in `src/services/database/expenseConnections.js`.

- Firebase uses the browser SDK against a user-supplied Realtime Database path.
- PocketBase uses the browser SDK against a user-supplied URL and collection.
- Adapters expose realtime `subscribe`, `create`, `update`, and `delete`
  operations.
- Adapter records should normalize to the shared expense shape before reaching
  view components.
- Additional realtime providers should implement the same adapter contract.

## Vite Notes

- The app uses Vite defaults unless `vite.config.js` says otherwise.
- PrimeVue is configured in `src/main.js` with an Aura-derived Subfolio preset.
- PrimeIcons CSS is imported from `src/main.js`.
- Tailwind theme tokens and app-level layout helpers live in `src/assets/main.css`.

---
Source: .ruler\35-git-conventions.md
---
## Git Conventions

Use the same conventions for branches, commits, and pull requests every time.
Keep names predictable, descriptions precise, and changelog content reusable.

### Branches

Format:

- Task-based branch: `<type>/<issue-id>-<task-title-in-kebab-case>`
- Non-task branch: `<type>/<short-description>`

Rules:

- Create a branch for every task or isolated piece of work.
- If the branch comes from an actual task, the task id is required in the branch name.
- For task-based branches, use the task title as the description as closely as possible, converted to lowercase kebab-case. Shorten only when necessary.
- Keep the prefix even when a task id is present.
- Use lowercase letters, numbers, and hyphens only.
- Do not use spaces, underscores, author names, uppercase letters, or extra path segments.

Branch types:

- `feat/`: new component, new capability, or visible enhancement.
- `fix/`: bug fix or regression fix.
- `refactor/`: internal restructuring without intended behavior change.
- `docs/`: documentation-only work.
- `test/`: test-only work.
- `build/`: build, packaging, or tooling changes.
- `chore/`: maintenance or repo housekeeping.
- `release/`: release preparation only.
- `hotfix/`: urgent production fix only.

Examples:

- `feat/pri-123-add-button-variants`
- `fix/pri-214-correct-modal-focus-trap`
- `docs/update-installation-guide`
- `chore/update-vitest-config`

### Commits

Format:

- `<type>(optional-scope): <description>`

Rules:

- Use lowercase types.
- Write the description in imperative mood.
- Keep the description short and specific.
- Add a scope when it makes the affected area clearer, such as `button`, `modal`, `docs`, `build`, or `tokens`.
- Use a body only when extra context is needed.
- Use `!` before the colon or a `BREAKING CHANGE:` footer for breaking changes.
- Prefer one logical change per commit.
- Do not use vague messages such as `fix stuff`, `wip`, or `update`.

Commit types:

- `feat`: new feature.
- `fix`: bug fix.
- `docs`: documentation only.
- `refactor`: code restructure without intended behavior change.
- `test`: tests added or updated.
- `build`: packaging, tooling, or dependency changes affecting build output.
- `chore`: maintenance that does not fit the other types.
- `perf`: performance improvement.
- `style`: formatting-only change with no behavior impact.

Examples:

- `feat(button): add loading state`
- `fix(modal): restore escape key handling`
- `docs(readme): clarify installation steps`
- `refactor(tokens): simplify tone mapping`
- `build(vite): align library output names`
- `feat(select)!: remove legacy option shape`

### Pull Requests

Use this exact section order:

```md
## Summary
Short description of what the pull request is about.

## Task
Reference the issue, requirement, or goal being addressed.

## Changes
- Main code or behavior changes made in the pull request.

## Validation
- Checks performed to validate the work.

## Changelog
### Added
- New features or newly introduced capabilities.

### Removed
- Deleted features, deleted APIs, or removed behaviors.

### Modified
- Behavior changes, visible updates to existing flows, or user-facing adjustments.

### Fixed
- Bug fixes, regressions, or corrected incorrect behavior.
```

Rules:

- `Summary` explains the pull request in 1 to 3 sentences.
- `Task` explains why the work exists and should mention the task id when there is one.
- PRs for this repository must target the Subfolio repository.
- Do not open PRs against an upstream repository or unrelated fork target.
- `Changes` explains what changed in the codebase with clear bullets.
- `Validation` lists the checks, tests, builds, or manual verification performed.
- `Changelog` is mandatory in every pull request.

Changelog rules:

- Every meaningful change in the pull request must appear under exactly one changelog category.
- Use only these categories: `Added`, `Removed`, `Modified`, `Fixed`.
- At least one changelog category must contain an entry.
- Do not leave empty changelog categories in the final pull request description.
- Write changelog bullets from a project-history perspective, not as low-level implementation notes.
- Write changelog bullets so they can be reused in `CHANGELOG.md` with minimal editing.
- Generate PR changelog entries from the full branch history and cumulative branch diff, not only from the latest commit or latest push.
- Categorize changelog entries by the final branch outcome. A feature added early and refined later still belongs under `Added`; follow-up implementation fixes belong under `Fixed` only when they correct a real bug or regression.

---
Source: .ruler\40-release-and-changelog.md
---
# Release And Changelog Conventions

Subfolio uses a Refinimo-style GitHub release workflow under `.github/` to
publish versioned release notes and keep `CHANGELOG.md` current.

## Changelog

- Keep `CHANGELOG.md` compatible with Keep a Changelog 1.1.0.
- Use the standard intro.
- Keep an `[Unreleased]` section at the top.
- List releases in reverse chronological order.
- Use release headings in the form `## [1.2.3] - YYYY-MM-DD`.
- Group changes under the project release section names when they apply: `Added`, `Modified`, `Removed`, and `Fixed`.
- Write human-readable release notes that explain user-facing or operator-facing impact.
- Do not dump commit logs.
- Keep version links at the bottom of the file so release sections are linkable.
- The release workflow publishes GitHub Releases from merged PRs and writes the PR's `## Changelog` section into both `CHANGELOG.md` and the GitHub Release description.
- The public `/changelog` page renders `CHANGELOG.md`, so release notes should
  be written for users and operators rather than as internal commit summaries.

## Pull Request Release Rules

- PR titles should be specific enough to make sense in the GitHub PR list and release history.
- Write PR titles in imperative present tense, for example `add release drafter workflow` or `fix room share link cleanup`.
- Keep PR titles specific enough to make sense outside the code diff.
- Avoid vague titles such as `update stuff`, `misc fixes`, or only an issue number.
- Use `.github/PULL_REQUEST_TEMPLATE.md` for the required PR body structure.
- Target pull requests for this repository to the Subfolio repository.
- Do not open PRs against an upstream repository or unrelated fork target.
- Put context, testing notes, screenshots, and migration details in the PR body outside the `## Changelog` section.
- Add a `## Changelog` section to release-included PRs.
- Group changelog content under `### Added`, `### Modified`, `### Removed`, and `### Fixed` when those sections apply.
- Every release-included PR needs one semantic version label: `major`, `minor`, or `patch`.
- Use `no-release` only when the PR should skip versioning, changelog updates, tagging, and GitHub Release creation.

---
Source: .ruler\50-key-files.md
---
# Key Files

| File | Purpose |
|---|---|
| `src/router/index.js` | Routes, `?config=` application, and database-connection guards |
| `src/main.js` | PrimeVue plugin, Aura-derived theme preset, PrimeIcons import, and app mount |
| `src/App.vue` | Root layout switch between public pages and app shell |
| `src/components/AppShell.vue` | Connected app shell, sidebar, and global add-expense modal |
| `src/components/ExpenseFormModal.vue` | Add/edit form for recurring expenses |
| `src/components/ExpenseTable.vue` | PrimeVue DataTable for expense rows, actions, and pagination |
| `src/composables/useExpenses.js` | Expense state, provider calls, recurrence helpers, and local fallback data |
| `src/composables/useDatabaseConnection.js` | Saved Firebase/PocketBase connection state and encoded config-link parsing |
| `src/composables/useSettings.js` | Currency/settings state, local persistence, and conversion helpers |
| `src/composables/useAuth.js` | Compatibility wrapper around saved connection state |
| `src/services/database/expenseConnections.js` | Firebase and PocketBase expense adapters |
| `src/views/landing/` | Public landing-site pages, including overview, features, BYODB, pricing, open source, changelog, and legal pages |
| `src/views/LoginView.vue` | Bring-your-own-database connection page |
| `src/views/HomeView.vue` | Connected dashboard |
| `src/views/TrackerView.vue` | Expense tracker page |
| `src/views/CategoriesView.vue` | Category breakdown page |
| `src/views/RecurrenceOverviewView.vue` | Recurring payment overview page |
| `src/views/SettingsView.vue` | Local user preference settings and connection detail |
| `src/assets/main.css` | Tailwind import, Subfolio tokens, and app layout helpers |
| `docs/architecture.md` | Current technical plan and provider notes |

---
Source: .ruler\60-ruler-workflow.md
---
# Ruler Workflow

## Source Of Truth

- Store all editable AI-agent instruction sources in `.ruler/`.
- Keep `ruler.toml` committed.
- Do not put plaintext API keys or secrets in `ruler.toml`.
- Use `${VARIABLE_NAME}` placeholders in `ruler.toml` for secret values.
- Use `npm run ruler` from the repository root to regenerate agent outputs.

## Local Env Files

Ruler MCP configuration can read secret values from the environment. If local
helper scripts are added later, they may read these files from `.ruler/`:

- `.ruler/.env`
- `.ruler/.env.local`
- `.ruler/.env.<mode>`
- `.ruler/.env.<mode>.local`

Mode is resolved from `RULER_ENV`, then `MODE`, then `NODE_ENV`.

Use `RULER_ENV_FILE=<path>` when a one-off env file should override the normal
lookup order.

Local `.ruler/.env*` files are secret-bearing files and must stay uncommitted.
Commit only `.ruler/.env.example` when documenting required variables.

---
Source: .ruler\AGENTS.md
---
# Subfolio Agent Instructions

These files are the source of truth for AI coding-agent instructions in this
repository. Do not edit generated root instruction files directly; update the
topic files in `.ruler/` and run the Ruler apply workflow instead.

---
Source: .ruler\skills\caveman\SKILL.md
---
---
name: caveman
description: >
  Ultra-compressed communication mode. Cuts token usage ~75% by dropping
  filler, articles, and pleasantries while keeping full technical accuracy.
  Use when user says "caveman mode", "talk like caveman", "use caveman",
  "less tokens", "be brief", or invokes /caveman.
---

Respond terse like smart caveman. All technical substance stay. Only fluff die.

## Persistence

ACTIVE EVERY RESPONSE once triggered. No revert after many turns. No filler drift. Still active if unsure. Off only when user says "stop caveman" or "normal mode".

## Rules

Drop: articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/of course/happy to), hedging. Fragments OK. Short synonyms (big not extensive, fix not "implement a solution for"). Abbreviate common terms (DB/auth/config/req/res/fn/impl). Strip conjunctions. Use arrows for causality (X -> Y). One word when one word enough.

Technical terms stay exact. Code blocks unchanged. Errors quoted exact.

Pattern: `[thing] [action] [reason]. [next step].`

Not: "Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..."
Yes: "Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:"

### Examples

**"Why React component re-render?"**

> Inline obj prop -> new ref -> re-render. `useMemo`.

**"Explain database connection pooling."**

> Pool = reuse DB conn. Skip handshake -> fast under load.

## Auto-Clarity Exception

Drop caveman temporarily for: security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, user asks to clarify or repeats question. Resume caveman after clear part done.

Example -- destructive op:

> **Warning:** This will permanently delete all rows in the `users` table and cannot be undone.
>
> ```sql
> DROP TABLE users;
> ```
>
> Caveman resume. Verify backup exist first.

---
Source: .ruler\skills\grill-me\SKILL.md
---
---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.

---
Source: .ruler\skills\handoff\SKILL.md
---
---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

---
Source: .ruler\skills\linear-issue-creator\SKILL.md
---
---
name: linear-issue-creator
description: >
  Transforms rough feature ideas, voice memos, or informal product thoughts into
  professional Linear issues and creates them directly via the Linear MCP integration.
  Use this skill whenever the user wants to create a Linear issue, turn a feature idea
  into a ticket, log a bug in Linear, write up a task for their team, or says anything
  like "create an issue", "add this to Linear", "make a ticket for", "log this in Linear",
  or "write up a Linear issue". Trigger even for vague or informal descriptions — the
  skill's job is to professionalize them. Always use this skill when Linear is mentioned
  alongside any kind of task, feature, bug, or improvement idea.
compatibility: "Requires Linear MCP integration to be connected"
---

# Linear Issue Creator

Turns informal feature descriptions, rough notes, or voice-memo-style thoughts into
clean, developer-friendly Subfolio Linear issues and creates them directly via
the Linear MCP.

---

## Step 1: Gather Context

Use these defaults unless the user explicitly says otherwise:

- Team: DEV
- Project: subfolio

Before writing anything, confirm only the missing decisions that matter:

1. **Priority** if the user's intent does not make it clear.
   - Urgent / High / Medium / Low

2. **Labels, cycle, due date, or assignee** only when the user asks for them or
   they are necessary for the workflow.

If the user's message is too vague to extract a coherent issue (e.g., a single word or a half-thought), ask one clarifying question to unlock enough context. Otherwise, proceed directly.

---

## Step 2: Draft the Issue

### Title

- Concise, action-oriented, sentence-case
- Format: `[Verb] [subject]` — e.g., *"Add garage status filter to order list"*
- No ticket numbers, no emojis, no jargon

### Description (use this exact structure)

\```
# Description

As a [type of user], I want [goal], so that [benefit].

[1–3 sentences of additional context or motivation.]

# Acceptance Criteria

- [Observable, testable behavior]
- [Observable, testable behavior]
- [...]

# Architecture

- [Technical approach or constraint]
- [Scalability / refactor note if relevant]
\```

### Priority & Label Suggestions

After drafting the issue, suggest:

- **Priority**: Based on user impact and urgency cues in the description
  - *Urgent*: Blocking users or production issues
  - *High*: Key feature, strong user need
  - *Medium*: Useful improvement, non-blocking
  - *Low*: Nice-to-have, polish
- **Labels**: Suggest 1–2 from common categories:
  - `feature`, `bug`, `improvement`, `tech-debt`, `UX`, `performance`, `security`

Present these as suggestions — let the user confirm or override before creating.

---

## Step 3: Confirm & Create

1. Show the full drafted issue to the user (title + description + priority/label suggestions)
2. Ask: *"Does this look good, or would you like to adjust anything?"*
3. Once confirmed, **create the issue using the Linear MCP tool** — do not just return markdown.
4. Create it under team `DEV` and project `subfolio`.
5. Pass the confirmed priority and labels when creating the issue.
6. Use the intended workflow status:
   - New scoped work: Planned or Ready to Start, based on user intent.
   - Work being implemented now: In Progress.
   - Finished implementation awaiting user validation: In Review.

---

## Step 4: Return Summary

After the issue is created, return exactly this:

\```
Issue created in Linear

**Title**: [issue title]
**URL**: [Linear issue URL]
**Priority**: [priority]
**Labels**: [labels]

Ready for the next issue.
\```

---

## Rules

- Always create the issue via Linear MCP — never only return the markdown
- Always use DEV/subfolio unless the user explicitly overrides it
- Keep the original intent intact — do not invent unrelated features
- Acceptance Criteria = observable, testable behavior only (no implementation details)
- Architecture = technical approach, constraints, scalability notes (not UX)
- Preserve important UI/UX detail from the user's description
- Keep the issue professional, readable, and developer-friendly
- Every new message after issue creation = a brand new issue request

---

## Example Input → Output

**User says:** *"we need to let users filter recurring expenses by category on the main list, right now they have to scroll through everything"*

**Drafted title:** `Add category filter to expense list`

**Description:**
\```
# Description

As a Subfolio user, I want to filter recurring expenses by category, so that I
can quickly find relevant costs without scanning the full list.

Currently, the list displays all expenses together, making it harder to focus on
subscriptions, utilities, housing, or other categories at a glance.

# Acceptance Criteria

- A category filter control is visible on the expense list view
- Selecting a category updates the list to show only matching expenses
- Clearing the filter restores the full list
- Filter state is preserved during the session

# Architecture

- Filter logic should be handled client-side if the full list is already loaded; otherwise
  add a query parameter to the existing list API endpoint
- Ensure the filter component is reusable for potential future filter types
\```

**Priority suggestion:** Medium  
**Label suggestions:** `feature`, `UX`
