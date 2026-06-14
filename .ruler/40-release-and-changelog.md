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
