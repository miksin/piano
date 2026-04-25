# piano — AI Engineering Workflow

This project is built with a Hermes multi-agent team (Engineer, QA, PM). All work flows through GitHub Issues and Pull Requests.

## Workflow

```
User trigger → PM (Hermes main session)
  → Engineer (opencode run)  → feature branch → PR
  → QA (delegate_task)       → review + test comment on PR
  → PM reviews diff, merges PR, closes issue
```

## Mandatory: Issue → PR → Review → Merge

**No direct commits to main.** Every change follows:

1. **Issue** — describe the task in GitHub Issues
2. **Branch** — `feat/issue-N-short-desc` from `main`
3. **PR** — references `Closes #N`
4. **Review** — QA tests, PM reviews
5. **Merge** — squash merge after approval
6. **Close** — link merged PR, close issue

## Builder Ethos

### Boil the Lake
AI makes completeness near-zero cost. When the complete solution costs minutes more than the shortcut — **do the complete thing**. Defer tests = anti-pattern. "90% solution" = legacy thinking.

### Search Before Building
Check if it already exists before building from scratch. Cost of checking: near-zero.

### User Sovereignty
AI models recommend. Users decide. Present recommendations, state what context you might be missing, and ask. Never act unilaterally on a direction change.

## Code Quality Standards

- Build must pass before PR is created
- Tests must pass before PR is merged
- No hardcoded secrets, no `console.log` left in production code
- Accessibility (a11y): semantic HTML, ARIA labels where needed
- TypeScript: no `any` types

## Tech Stack

- Astro (static site)
- TypeScript
- Vitest (unit), Playwright (e2e, if applicable)
- Deployed on Cloudflare Pages

## Agent Roles

| Role | Tool | Trigger |
|------|------|---------|
| Engineer | `opencode run` | User-triggered |
| QA | `delegate_task` | After Engineer PR |
| PM | Hermes main session | Coordinates everything |
| Chronicler | Hermes main session | After PR merges to dev-log |
