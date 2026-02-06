# Styling and Components

Tailwind CSS v4 handles all styling through utility classes. shadcn/ui provides pre-built, accessible UI components. Together they give us a consistent design system with full light/dark mode support.

## Tailwind CSS v4

Tailwind v4 is a major change from v3. There's no `tailwind.config.ts` file — all configuration happens in CSS using the `@theme` directive.

### CSS-First Configuration

Our theme is defined in `src/index.css`:

```css
/* src/index.css */
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  /* ... more color and radius mappings */
}
```

The `@theme inline` block registers CSS variables as Tailwind utilities. This means `bg-primary` in your JSX uses the `--color-primary` variable, which in turn reads the `--primary` CSS custom property.

### How Theme Colors Work

The color system has three layers:

```
CSS custom property     →  @theme mapping              →  Tailwind class
--primary: oklch(9% 0 0)  --color-primary: var(--primary)  bg-primary
```

Light and dark values are defined in `:root` and `.dark`:

```css
@layer base {
  :root {
    --background: oklch(100% 0 0); /* white */
    --foreground: oklch(3.9% 0 0); /* near-black */
    --primary: oklch(9% 0 0); /* very dark */
    --primary-foreground: oklch(98% 0 0); /* near-white */
    /* ... */
  }

  .dark {
    --background: oklch(3.9% 0 0); /* near-black */
    --foreground: oklch(98% 0 0); /* near-white */
    --primary: oklch(98% 0 0); /* near-white */
    --primary-foreground: oklch(9% 0 0); /* very dark */
    /* ... */
  }
}
```

When the `.dark` class is on the `<html>` element, all colors swap automatically. You write `bg-primary text-primary-foreground` once and it works in both themes.

The colors use the OKLCH color space (not hex or HSL) for better perceptual uniformity — equal numeric steps produce equal visual steps.

## The `cn()` Utility

`cn()` is a small helper that combines `clsx` (conditional class names) with `tailwind-merge` (resolves Tailwind class conflicts):

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Use it when merging classes, especially with overrides:

```typescript
// Without cn(): "p-4 p-2" — which padding wins? Depends on CSS order.
// With cn(): "p-2" — tailwind-merge keeps the last one.

<div className={cn('rounded-lg border p-4', isActive && 'border-primary', className)}>
```

Every shadcn/ui component uses `cn()` to allow class overrides via a `className` prop.

## shadcn/ui

shadcn/ui is **not** an npm package you install. It's a collection of components that get copied into your project at `src/components/ui/`. You own the code and can modify it.

### Configuration

`components.json` at the project root tells the shadcn CLI where to put things:

```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Adding New Components

```bash
npx shadcn@latest add [component]

# Examples:
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add toast
```

This generates a file in `src/components/ui/` that you can modify. The generated components are excluded from ESLint in `eslint.config.js` since they're vendor code.

### Components We Use

The `src/components/ui/` directory includes: `alert-dialog`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `textarea`, `tooltip`.

## `cva()` for Component Variants

`class-variance-authority` (cva) defines component variants — a set of visual options a component can have. Here's how the Button component uses it:

```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base classes (always applied)
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

Usage:

```tsx
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><Moon /></Button>
<Button>Default variant, default size</Button>
```

## Dark Mode

Dark mode works through three pieces:

1. **CSS variables** in `src/index.css` — `.dark` class swaps all color values
2. **Zustand store** in `src/stores/uiStore.ts` — stores user's preference (`'light' | 'dark' | 'system'`)
3. **`useThemeEffect` hook** in `src/hooks/use-theme-effect.ts` — syncs the preference to the DOM

```typescript
// src/hooks/use-theme-effect.ts
export function useThemeEffect() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'light') {
      root.classList.remove('dark')
      return
    }

    if (theme === 'dark') {
      root.classList.add('dark')
      return
    }

    // theme === 'system': follow OS preference
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      root.classList.toggle('dark', mql.matches)
    }
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [theme])
}
```

The hook runs in the root route (`__root.tsx`), so it's always active. The user's theme preference persists in localStorage via the Zustand `persist` middleware.

### The Theme Toggle

```typescript
// src/components/features/theme/ThemeToggle.tsx
export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

The Sun/Moon icons use Tailwind's `dark:` variant to animate between light and dark states purely with CSS transitions.

See [Internationalization](./08-internationalization.md) for the locale picker, which follows the same pattern (Zustand store + dropdown + effect hook).
