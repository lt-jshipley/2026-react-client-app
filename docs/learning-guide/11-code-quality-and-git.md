# Code Quality and Git

ESLint catches bugs and enforces patterns. Prettier formats code consistently. Husky runs checks automatically on every commit so nothing slips through.

## ESLint

ESLint uses the flat config format in `eslint.config.js`. It runs TypeScript-aware rules that can catch type errors beyond what `tsc` alone finds.

### Key Configuration

```javascript
// eslint.config.js
export default defineConfig([
  // Files ESLint ignores
  {
    ignores: [
      'dist',
      'node_modules',
      '*.gen.ts', // TanStack Router generated files
      'src/routeTree.gen.ts',
      'src/components/ui/**', // shadcn auto-generated components
      'e2e/', // Playwright tests
    ],
  },

  // TypeScript files get strict, type-checked rules
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    // ...
  },
])
```

### Important Rules

| Rule                      | What It Does                                                       |
| ------------------------- | ------------------------------------------------------------------ |
| `consistent-type-imports` | Forces `import type { X }` for type-only imports                   |
| `no-unused-vars`          | Errors on unused variables (prefix with `_` to allow)              |
| `no-misused-promises`     | Catches forgotten `await` on promises                              |
| `no-console`              | Warns on `console.log` (allows `console.warn` and `console.error`) |
| `react-hooks/*`           | Enforces rules of hooks and dependency arrays                      |
| `jsx-a11y/*`              | Catches accessibility issues in JSX                                |

### Escaping Rules

If you need to suppress a rule for a valid reason, use an inline comment:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unusedButNeeded = someValue
```

Unused variables can also be prefixed with `_` (the config allows `argsIgnorePattern: '^_'`).

### Test File Relaxations

Test files (`**/*.test.{ts,tsx}`) have relaxed rules:

```javascript
{
  files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**/*'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
},
```

## Prettier

Prettier handles all formatting decisions — no debates about semicolons or quote style.

```javascript
// prettier.config.js
export default {
  semi: false, // No semicolons
  singleQuote: true, // Single quotes
  tabWidth: 2, // 2-space indentation
  trailingComma: 'es5', // Trailing commas in objects/arrays
  printWidth: 80, // Line width
  plugins: ['prettier-plugin-tailwindcss'], // Sorts Tailwind classes
}
```

The `prettier-plugin-tailwindcss` plugin automatically sorts Tailwind utility classes in a consistent order. You don't need to think about class ordering — just write them and Prettier reorders on save.

### Running Prettier

```bash
pnpm format        # Format all files
pnpm format:check  # Check if all files are formatted (CI use)
```

## Git Hooks via Husky

Husky runs scripts on git events. We use two hooks:

### Pre-Commit Hook

`.husky/pre-commit` runs `lint-staged`, which only checks files you're about to commit:

```
pnpm lint-staged
```

`lint-staged` is configured in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

For TypeScript files: ESLint auto-fixes what it can, then Prettier formats. For JSON, Markdown, and CSS: just Prettier.

### Commit Message Hook

`.husky/commit-msg` validates your commit message follows the conventional commits format:

```
pnpm dlx commitlint --edit
```

## Conventional Commits

Every commit message must follow this format:

```
type(scope): description

type: description       ← scope is optional
```

### Allowed Types

| Type       | When to Use                                         | Example                                       |
| ---------- | --------------------------------------------------- | --------------------------------------------- |
| `feat`     | New feature                                         | `feat(auth): add remember me checkbox`        |
| `fix`      | Bug fix                                             | `fix(forms): prevent double submit on login`  |
| `docs`     | Documentation                                       | `docs: add routing section to learning guide` |
| `style`    | Code formatting (not CSS)                           | `style: fix indentation in authStore`         |
| `refactor` | Code change that doesn't fix a bug or add a feature | `refactor(api): extract request helper`       |
| `perf`     | Performance improvement                             | `perf: lazy load admin route`                 |
| `test`     | Adding or fixing tests                              | `test(forms): add validation error tests`     |
| `chore`    | Build, dependencies, tooling                        | `chore: update TanStack Query to v5.91`       |
| `ci`       | CI/CD changes                                       | `ci: add coverage report upload`              |
| `revert`   | Revert a previous commit                            | `revert: undo auth flow change`               |

### Rules

From `commitlint.config.js`:

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'revert',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'], // lowercase description
    'subject-max-length': [2, 'always', 72], // max 72 characters
  },
}
```

- Description must be **lowercase** (not `"Add feature"` but `"add feature"`)
- Description must be **72 characters or fewer**
- Type must be one of the allowed values above

### Examples

```bash
# Good
git commit -m "feat(i18n): add spanish translations"
git commit -m "fix: prevent crash on empty user list"
git commit -m "test(forms): add accessibility checks to LoginForm"

# Bad — will be rejected
git commit -m "Added new feature"         # No type prefix
git commit -m "feat: Add New Feature"     # Uppercase description
git commit -m "update stuff"              # No type, vague description
```

## The Workflow

When you commit code, this happens automatically:

```
1. You run: git commit -m "feat: add user search"
2. Pre-commit hook runs:
   a. lint-staged runs ESLint --fix on staged .ts/.tsx files
   b. lint-staged runs Prettier --write on all staged files
   c. If ESLint finds unfixable errors → commit is blocked
3. Commit-msg hook runs:
   a. commitlint checks the message format
   b. If the message doesn't match conventional commits → commit is blocked
4. If both hooks pass → commit succeeds
```

If a hook blocks your commit, fix the issue and try again. ESLint errors will be printed to the terminal showing you exactly what to fix.

### Useful Commands

```bash
pnpm lint          # Check all files for lint errors
pnpm lint:fix      # Auto-fix what ESLint can
pnpm format        # Format all files with Prettier
pnpm type-check    # Run TypeScript compiler checks
```
