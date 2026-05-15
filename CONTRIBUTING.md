# Contributing to SimulaCert

Thank you for considering contributing to SimulaCert! Contributions are welcome (bug fixes, improvements, docs, accessibility, i18n, etc.).

## Before you start

### Prerequisites

- Node.js (LTS recommended)
- npm (see the version pinned in `package.json` under `packageManager`)

### Local setup

```bash
npm install
npm run start
```

The dev server uses `proxy.conf.json`.

## How to contribute

### 1) Create a branch

```bash
git checkout -b feature/short-description
```

Suggested prefixes: `fix/`, `feature/`, `docs/`, `chore/`.

### 2) Make your changes

Keep changes focused and avoid unrelated formatting.

### 3) Test

```bash
npm test
```

Optional:

```bash
npm run build
```

### 4) Commit

Use clear messages (imperative mood):

```bash
git add .
git commit -m "fix: handle edge case in X"
```

### 5) Open a Pull Request

In your PR description, include:

- What changed and why
- Screenshots (if UI changes)
- How to test locally

## Reporting issues

If you found a bug or have a feature request, please open an issue and include:

- Steps to reproduce
- Expected vs. actual behavior
- Screenshots/logs (when applicable)
- Environment (browser, OS, Node version)

## Important note about licensing

This repository uses a **proprietary license** (see [LICENSE](./LICENSE)). By submitting a contribution (issue, PR, patch, or code snippet), you agree that:

- You have the right to submit the work; and
- You grant the project owner the right to use, modify, and distribute your contribution as part of SimulaCert under the project's licensing terms.

If you are unsure whether you can contribute a specific change, please open an issue first.
