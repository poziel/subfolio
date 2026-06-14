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
