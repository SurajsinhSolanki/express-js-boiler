# Contributing to Express TypeScript Boilerplate

First off, **thank you for considering contributing to this project!** Your time and effort help make this project better for everyone. 🎉

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Running Tests](#running-tests)
- [Questions or Support](#questions-or-support)

---

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md) that all contributors are expected to follow. Please read it to understand what actions will and won’t be tolerated.

### Core Values

- Use **welcoming and inclusive language**
- **Respect** differing viewpoints and experiences
- Accept constructive criticism **gracefully**
- Focus on what’s best for the **community**
- **Show empathy** towards others

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/express-boilerplate.git
   ```
3. **Create a new branch:**  
   Name it according to the [Branch Naming Conventions](#branch-naming-conventions).
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies and set up environment:**
   ```bash
   npm install
   cp .env.example .env
   ```

---

## Development Process

1. Create your feature branch from `main`.
2. Make changes, keeping commits small and focused.
3. Write or update **unit/integration tests**.
4. **Update documentation** if necessary (README, code comments).
5. Push to your fork and [submit a pull request](#pull-request-process).

### Tips

- Sync frequently with `main` to reduce merge conflicts.
- Ask questions early—don’t hesitate to create a draft PR!

---

## Branch Naming Conventions

Please use descriptive branch names following these patterns:

- **Feature:** `feature/<short-description>`
- **Bug fix:** `fix/<issue-description>`
- **Documentation:** `docs/<docs-changes>`
- **Performance:** `perf/<optimizations>`

Examples:

- `feature/auth-refresh-token`
- `fix/typo-in-readme`
- `docs/api-endpoints`
- `perf/db-query-optimization`

---

## Pull Request Process

1. **Describe your changes** clearly in the PR; link related issues if any.
2. **Update relevant documentation** (e.g., README, inline docs).
3. **Add or update tests** for new or changed functionality.
4. **Ensure the test suite passes locally** before submitting.
5. **Update `CHANGELOG.md`** if relevant (new features/fixes).
6. At least **one maintainer** must review and approve your PR.

### Pull Request Title Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) for PR titles:

```
type(scope): short description
```

Examples:

- `feat(auth): implement JWT refresh tokens`
- `fix(database): handle connection pool timeout`
- `docs(readme): document Docker setup`

---

## Coding Standards

### TypeScript

- Use strict mode and avoid `any` types whenever possible.
- Prefer **interfaces** over type aliases where appropriate.
- Document complex components and public APIs with **JSDoc comments**.
- Use meaningful, descriptive variable and function names.

### Code Style

- **2-space indentation** (auto-enforced via Prettier/ESLint if setup)
- **Single quotes** for strings
- **Trailing commas** in objects and arrays
- Functions should be **small, pure, and focused**
- Prefer **async/await** over raw promises

> **Tip:** Run `npm run lint` to catch style violations early!
> **Tip:** Run `npm run format` to formate code!

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clarity and easily automatable releases.

### Commit Message Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

#### Common Types

- `feat` – New feature
- `fix` – Bug fix
- `docs` – Documentation only changes
- `style` – Formatting, missing semi-colons, etc; no code change
- `ref` – Code change that neither fixes a bug nor adds a feature
- `perf` – Performance improvements
- `test` – Adding or fixing tests
- `chore` – Maintenance tasks

---

## Running Tests

### Run and Validate Before PR

- Run all unit and integration tests:
  ```bash
  npm test
  ```
- For E2E tests:
  ```bash
  npm run test:e2e
  ```
- To check test coverage:
  ```bash
  npm run test:coverage
  ```

> **Pro-tip:** Add tests for any new or improved code!

---

## Questions or Support

- For **bugs**, [open an issue](https://github.com/<USERNAME>/<REPO>/issues).
- For general **questions or help**, use [GitHub discussions](https://github.com/<USERNAME>/<REPO>/discussions).
- Tag a maintainer if your issue is urgent.

---

Thank you for contributing! 🚀

---
