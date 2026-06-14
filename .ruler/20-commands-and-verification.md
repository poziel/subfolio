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
