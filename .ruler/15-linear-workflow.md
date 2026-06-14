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
