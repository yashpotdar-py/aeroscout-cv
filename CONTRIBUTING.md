# Contributing to AeroScout-CV

Thank you for your interest in contributing to AeroScout-CV! This document outlines the process for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We are all here to build something meaningful.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aeroscout-cv.git
   cd aeroscout-cv
   git lfs pull  # required for demo video assets
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/yashpotdar-py/aeroscout-cv.git
   ```
4. **Set up development environment** — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full instructions.

---

## Development Workflow

```
upstream/main → your fork → feature branch → PR → review → merge
```

Always work off a **feature branch**, never directly on `main`.

```bash
# Sync with upstream before starting new work
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feat/your-feature-name
```

---

## Branch Strategy

| Branch pattern | Purpose |
|---|---|
| `feat/description` | New features |
| `fix/description` | Bug fixes |
| `docs/description` | Documentation only |
| `refactor/description` | Code restructuring without behavior change |
| `chore/description` | Build, deps, CI changes |

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Examples:**
```
feat(backend): add inference throttle per-client WebSocket
fix(frontend): prevent map re-render loop on GPS unchanged
docs(api): document flood_centroids payload field
chore(docker): pin node base image to 20-alpine3.19
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

---

## Pull Request Process

1. Ensure your branch is up to date with `upstream/main`
2. Make sure the CI passes (lint, type check, build)
3. Fill out the **Pull Request Template** completely
4. Request a review from [@yashpotdar-py](https://github.com/yashpotdar-py)
5. Address review feedback promptly
6. Once approved, your PR will be squash-merged

---

## Code Style

### Python (Backend)

- Style: [PEP 8](https://pep8.org/) + [ruff](https://docs.astral.sh/ruff/) for linting
- Type hints: Required on all public functions
- Docstrings: Required on all public classes and functions
- Max line length: 100

```bash
# Lint check
cd backend
ruff check .

# Format
ruff format .
```

### TypeScript / React (Frontend)

- Linter: [ESLint](https://eslint.org/) with the project's existing config
- Components: Functional components with TypeScript prop types
- Hooks: Custom hooks in `src/hooks/`, one responsibility per hook

```bash
cd frontend
npm run lint
npm run build  # ensures TypeScript compiles cleanly
```

---

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Your OS and environment details
- Steps to reproduce
- Expected vs. actual behavior
- Relevant logs

---

## Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and describe:
- The problem you're solving
- Your proposed solution
- Alternatives you considered
