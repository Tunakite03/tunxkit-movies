# Contributing to tunxkit-movies

Thank you for your interest in contributing! This guide will get you set up and explain our workflows.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Project Structure](#project-structure)

---

## Prerequisites

| Tool    | Version |
| ------- | ------- |
| Node.js | ≥ 20    |
| pnpm    | ≥ 9     |
| Git     | ≥ 2.40  |

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/<owner>/tunxkit-movies.git
cd tunxkit-movies

# 2. Install dependencies
pnpm install

# 3. Copy environment file and fill in values
cp .env.example .env.local

# 4. Set up the database
pnpm db:generate
pnpm db:migrate

# 5. Start the development server
pnpm dev
```

### Required environment variables

| Variable          | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`    | Turso / libSQL connection URL                                          |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (≥ 32 chars)                                |
| `NEXTAUTH_URL`    | Full URL of the app (e.g. `http://localhost:3000`)                     |
| `TMDB_API_KEY`    | API key from [themoviedb.org](https://www.themoviedb.org/settings/api) |

> **Never commit `.env.local` or any file containing secrets.**

---

## Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) + [commitlint](https://commitlint.js.org) to enforce quality before every commit.

Install the dev dependencies once:

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional prettier
pnpm exec husky init
```

Husky will automatically run `pnpm lint-staged` on staged files and validate your commit message format before each commit.

---

## Development Workflow

```
main          ← production branch (protected)
  └── develop ← integration branch
        └── feat/your-feature
        └── fix/issue-123
        └── chore/update-deps
```

1. Branch off `develop` (or `main` for hotfixes).
2. Make a focused, minimal change.
3. Open a PR against `develop` (or `main` for hotfixes).
4. Wait for CI to pass and at least one approval.

---

## Commit Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**.

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Allowed types

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation only                               |
| `style`    | Formatting, missing semicolons — no logic change |
| `refactor` | Code change that's neither fix nor feature       |
| `perf`     | Performance improvement                          |
| `test`     | Adding or updating tests                         |
| `build`    | Build system or dependency changes               |
| `ci`       | CI/CD configuration changes                      |
| `chore`    | Other maintenance tasks                          |
| `revert`   | Reverts a previous commit                        |

### Examples

```bash
feat(movies): add watch-provider filter to movie listing
fix(auth): handle expired session token gracefully
docs(contributing): add pre-commit setup instructions
chore(deps): upgrade next to 16.1.6
```

Rules enforced by commitlint:

- Subject must be **lower-case** and **≤ 100 characters**.
- No trailing period in the subject line.

---

## Pull Request Process

1. Ensure all CI checks pass (lint, typecheck, build).
2. Fill in the PR template completely.
3. Link the relevant issue (`Closes #<number>`).
4. Request review from a maintainer.
5. Address review feedback — each comment should be resolved or followed up.
6. A maintainer will merge once approved.

---

## Code Standards

### TypeScript

- `strict: true` must be respected at all times.
- Use `unknown` + type guards instead of `any`.
- Prefer `interface` for object shapes; `type` for unions/utilities.
- Use `import type` for type-only imports.

### React

- Functional components and hooks only.
- Keep components presentational; data fetching belongs in hooks or services.
- Avoid prop drilling > 2 levels — use context or composition.

### UI

- Follow the [UI Style Guide](.github/instructions/05-ui-style.instructions.md).
- Use semantic Tailwind tokens only — never hardcode hex/rgb.
- All new UI must work in both light and dark mode.

### Functions

- Max 40 lines per function. Extract helpers aggressively.
- Max 3 parameters — use an options object for more.
- Name functions as verbs: `createUser`, `fetchMovies`, `validateInput`.

### Security

- Never log secrets, tokens, or PII.
- Validate all external inputs at system boundaries.
- Parameterized queries only — no string-concatenated SQL.

---

## Project Structure

```
src/
├── actions/       # Server Actions (mutations)
├── app/           # Next.js App Router pages & layouts
├── components/    # Shared React components
├── config/        # App-level configuration
├── constants/     # App-wide constants
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and third-party wrappers
├── services/      # TMDB API service layer
├── store/         # Zustand stores + context providers
└── types/         # Global TypeScript types and declarations
```

---

## Questions?

Open a [GitHub Discussion](../../discussions) or create an issue using the **Feature Request** template.
