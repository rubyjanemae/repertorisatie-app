# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server at http://localhost:3000
- `npm run build` — production build (also the type-check gate; there is no separate `tsc` script)
- `npm run start` — serve the production build
- `npm run lint` — ESLint via `eslint-config-next`

No test framework is installed.

## Language

All UI copy, code comments, variable names, and commit messages are in **Dutch**. Match that register when editing existing files and when writing new user-facing strings. Code identifiers are often Dutch too (e.g. `casus`, `rubriek`, `middel`, `deel`). Don't translate them to English.

## Architecture

This is a single-page Next.js 16 App Router app (`src/app/page.tsx`) for homeopathic repertorisation. Everything is client-side: there are no API routes, no server components beyond the root layout, and no database of the user's own data — state lives in `localStorage` via [src/hooks/useLocalStorage.ts](src/hooks/useLocalStorage.ts).

### Data model ([src/lib/types.ts](src/lib/types.ts))

`Case` → `Rubric[]` → `Remedy[]`. A remedy has a `grade: 1 | 2 | 3 | 4` that drives scoring and display weight. The flagship computation is [tallyRemedies](src/lib/tallyRemedies.ts) which sums grades across rubrics to rank candidate remedies.

A separate `DifferentialDiagnosis` model (DD) hangs off each case in its own localStorage bucket (`repertorisatie-dd`, keyed by case id) — DD is a free-text comparison grid, not derived from the rubric tally.

### Grade parsing convention ([src/lib/parseRemedies.ts](src/lib/parseRemedies.ts))

Remedy strings use casing as a grading shorthand — this is load-bearing, don't "clean it up":

- `acon` (lowercase) → grade 1
- `Acon` (capitalized) → grade 2
- `ACON` (uppercase) → grade 3
- `ACON (4)` (explicit) → grade 4

Separators: commas, periods, or whitespace. `remedyToString` (same file) is the inverse — use it when round-tripping through the parser (e.g. in `mergeRemedyStrings`).

### Repertory lookup ([src/lib/repertoryLookup.ts](src/lib/repertoryLookup.ts))

The 74k-rubric OOREP repertory (GPL v3) is shipped as static JSON in [public/repertory/](public/repertory/), one file per chapter (`mind.json`, `head.json`, …). Chapters are lazy-loaded and in-memory cached. Two indirection tables in the same file translate sidebar chapter names to OOREP file names and path prefixes (e.g. "Generals" → `generalities.json`, prefix `Generalities, …`); add new chapter mappings there, not in the sidebar component.

### Community features ([src/lib/supabase.ts](src/lib/supabase.ts), [src/lib/sharedRubrics.ts](src/lib/sharedRubrics.ts))

Supabase (table: `shared_rubrics`) is **optional**. `getSupabase()` returns `null` when env vars are missing or still contain the placeholder `jouw-project` / `jouw-anon-key`; all callers must handle null and degrade gracefully. Every new rubric added to a case is auto-shared fire-and-forget (see `handleAddRubric` in [page.tsx](src/app/page.tsx)); failures are swallowed on purpose.

Required env (in `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Case sharing via URL ([src/lib/shareCase.ts](src/lib/shareCase.ts))

Cases serialize to a compact JSON (short keys `v/n/rs/r/g`), base64url-encoded into `?deel=…`. On load, [page.tsx](src/app/page.tsx) checks for that param and offers an import banner. Version is pinned to `v: 1` — bump and handle migration if the compact shape changes. URLs over 8000 chars fall back to clipboard JSON.

### SSR / hydration

[page.tsx](src/app/page.tsx) gates all localStorage-dependent UI behind a `mounted` flag and renders a stub header during SSR to avoid hydration mismatches. Preserve that pattern when adding new localStorage reads at the top level.

### Styling

Tailwind v4 with a custom palette defined as CSS variables in [src/app/globals.css](src/app/globals.css) (`@theme inline`). Named tokens (e.g. `bg-parchment`, `text-forest`, `text-grade-3`, `card-materia`, `btn-primary`) come from there — prefer them over ad-hoc hex values. Fonts: DM Serif Display (`font-display`), Inter (`font-body`), JetBrains Mono.

### Path alias

`@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).

---

# Behavioral Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
