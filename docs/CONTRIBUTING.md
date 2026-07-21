# Contributing Guide

---

## Development Setup

```bash
git clone https://github.com/pman369/stateos-mvp.git
cd stateos
npm install
npm run dev
```

App runs at `http://localhost:3000`. Works in offline mode (no env vars needed).

---

## Code Conventions

### Language & Framework

- **TypeScript** with strict mode enabled
- **React 19** with App Router (Next.js 16)
- **Tailwind CSS v4** for styling — utility-first, no CSS modules
- **Zustand** for ephemeral state only (onboarding, session timer, diagnostic flow)
- **No Server Components** — all pages use `"use client"`

### File Organization

```
src/
├── app/                    # Route pages (one directory per route)
│   ├── api/                # API route handlers
│   ├── layout.tsx          # Root layout (fonts, providers)
│   └── globals.css         # Tailwind theme + animations
├── components/
│   ├── layout/             # Navbar (sidebar + mobile tabs)
│   ├── ui/                 # Core feature widgets
│   ├── shared/             # Reusable across features
│   ├── profile/            # Profile-specific components
│   ├── settings/           # Settings-specific components
│   └── utils/              # db.ts, audio.ts (data + audio utilities)
└── store/
    └── stateStore.ts       # Zustand store (ephemeral state)
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | PascalCase for components, camelCase for utilities | `ProtocolPlayer.tsx`, `db.ts` |
| Components | PascalCase, descriptive | `RecoveryWindowTimer`, `ScienceTierLabel` |
| Interfaces | PascalCase, noun | `StateAudit`, `DriftEvent` |
| Functions | camelCase, verb-first | `getAudits()`, `createDriftEvent()` |
| Routes | lowercase, kebab-case | `/audit/new`, `/identity/anchors` |
| Database columns | snake_case | `recovery_window_seconds` |
| Protocol slugs | kebab-case | `33-second-reset` |

### Component Patterns

- All pages are **client components** (`"use client"` directive)
- Data fetching happens **client-side** through `db.ts`
- Components import from `@/*` path alias (maps to `./src/*`)
- No inline styles — Tailwind utilities only
- Use `ScienceTierLabel` to label any scientific claim
- Use `TierBadge` for recovery tier display

### Dual-Mode Contract

When adding new data operations to `db.ts`:
1. Add TypeScript interface for the data type
2. Implement cloud path (Supabase query)
3. Implement local path (localStorage get/set)
4. Both paths must return the same TypeScript type
5. Add the new localStorage key to the `stateos_db_` prefix pattern

---

## Linting

```bash
npm run lint
```

ESLint 9 flat config with:
- `eslint-config-next/core-web-vitals` — Next.js core web vitals rules
- `eslint-config-next/typescript` — TypeScript-specific rules
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

---

## Testing

No test framework is currently configured. When tests are added:

- Unit tests: `*.test.ts` / `*.test.tsx` co-located with source
- Integration tests: test `db.ts` methods in both cloud and local modes
- E2E tests: test critical flows (audit → drift → protocol → recovery)

---

## Commit Convention

Keep commit messages concise and descriptive. No strict convention enforced, but recommended format:

```
<type>: <description>

Types: feat, fix, docs, refactor, style, test, chore
```

---

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make changes following the conventions above
4. Run `npm run lint` — fix any errors
5. Open a PR with a clear description of the change

---

## Content Guidelines

### Protocol Copy

- Keep instructions **somatic** (body-focused, sensory)
- Avoid prescriptive language ("you should" → "notice if...")
- Use gentle inquiry, not commands
- Keep instructions concise (one or two sentences per step)

### Science Tiering

- New protocols default to `working_model` unless claims are peer-reviewed
- Never present metaphorical language as established science
- Use `ScienceTierLabel` component for any scientific claim
- See `docs/PROTOCOLS.md` for the full tiering policy

### Tone

- Calm, direct, non-clinical
- No hype language ("transform your life!")
- No medical claims
- Acknowledge uncertainty where it exists
