# Learning Guide

Welcome to the project learning guide. This is a reference for developers joining the team who have basic web development experience but need to learn the specific libraries, patterns, and conventions we use.

## Prerequisites

Before diving in, you should be comfortable with:

- HTML, CSS, and JavaScript fundamentals
- React basics (components, props, state, hooks)
- TypeScript basics (types, interfaces, generics)
- Git basics (commit, branch, merge)

## Suggested Reading Order

Work through the topics in order. Each one builds on concepts from the previous:

1. **[Project Overview](./01-project-overview.md)** — How the app boots, directory structure, dev workflow
2. **[TypeScript and Vite](./02-typescript-and-vite.md)** — Strict mode, build tooling, path aliases, env vars
3. **[Routing](./03-routing.md)** — TanStack Router: file-based routes, auth guards, navigation
4. **[Data Fetching](./04-data-fetching.md)** — TanStack Query: API client, queries, mutations, caching
5. **[State Management](./05-state-management.md)** — Zustand stores, when to use what
6. **[Forms and Validation](./06-forms-and-validation.md)** — React Hook Form + Zod v4 + shadcn Form wrappers
7. **[Styling and Components](./07-styling-and-components.md)** — Tailwind CSS v4, shadcn/ui, cn(), dark mode
8. **[Internationalization](./08-internationalization.md)** — i18next: namespaces, translations, adding a language
9. **[Testing](./09-testing.md)** — Vitest, Testing Library, MSW, accessibility testing
10. **[Error Monitoring](./10-error-monitoring.md)** — Sentry: setup, error boundaries, what gets tracked
11. **[Code Quality and Git](./11-code-quality-and-git.md)** — ESLint, Prettier, Husky, conventional commits

## How to Use This Guide

Each topic file follows the same structure:

- **What and why** — a short intro explaining the library and why we chose it
- **How it works here** — the patterns and conventions specific to this project
- **Real code examples** — pulled directly from the codebase with file path references
- **Cross-references** — links to related topics where concepts overlap
