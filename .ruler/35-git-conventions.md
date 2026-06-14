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
