# Subfolio AI collaboration guide

## Purpose
This file is the working agreement for how AI assistants should operate in this repo. It
documents context, workflow, and Linear status usage so future sessions stay consistent.

## Project summary
Subfolio is a smart, forward-looking finance app to track subscriptions, predict expenses and
income, and give long-term clarity on where money goes. Current focus is building the app
experience (tracker UI + API) before production-grade authentication.

## Architecture references
- See `docs/architecture.md` for the current technical plan and API notes.
- Keep references to `/docs` up to date as decisions change.

## Linear usage rules
Linear is the source of truth for issues and tasks. Each session should map to a Linear
issue whenever possible.

- Use Linear MCP tools to read/create/update issues and project context.
- Always set the issue project to `subfolio` under the DEV team when creating issues.
- Co-plan tasks in chat, then create or update the corresponding Linear issue.
- If the user references a Linear issue, fetch it and work under that issue.
- Always update Linear status when the work state changes.

## Linear workflow (DEV team)
Use all statuses deliberately and keep them accurate.

- Backlog: raw ideas, not scoped yet.
- Discovery: research/requirements gathering; unknowns being explored.
- Planned: scoped work with defined outcomes; waiting to be scheduled.
- Ready to Start: approved and next in line to execute.
- In Progress: actively being implemented now.
- On Hold: waiting on non-blocking feedback/decision; partial progress is possible.
- Blocked: hard blocker prevents progress; cannot proceed until resolved.
- In Review: implementation done, awaiting user validation.
- Completed: user approved the result.
- Awaiting Next Update: paused until a future cycle or dependent work is ready.
- Canceled: work no longer needed.

## Task execution protocol
1. Co-plan tasks in chat before creating them in Linear.
2. When starting a task: move it to In Progress.
3. If a question is needed to continue: move to On Hold.
4. If a hard blocker exists: move to Blocked.
5. When work is done: move to In Review.
6. After user confirmation: move to Completed.

## Communication rules
- Ask questions when decisions are needed to proceed.
- Keep updates concise and actionable.
- Reflect the real work state in Linear at all times.
