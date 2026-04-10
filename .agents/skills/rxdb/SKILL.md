---
name: rxdb
description: "Improve, debug, or extend RxDB usage in this project. Use when changing schemas, collections, seed data, providers, hooks, trip persistence flows, or when diagnosing RxDB errors."
user-invocable: false
---

# RxDB

Use this skill when work touches the local database layer for the trip planner.

## Current Project Context

- Database setup lives in `lib/rxdb-database.ts`.
- Schemas and collection typings live in `lib/rxdb-schema.ts`.
- App-level database access is exposed through `lib/DatabaseProvider.tsx`.
- Seed examples live in `lib/seedDatabase.ts`.
- Query and persistence consumers are in hooks and route components, especially `components/hooks/useTripData.ts` and `app/trip/[tripId]/`.

## Rules

1. Keep TypeScript document types, RxDB schemas, and collection registrations aligned.
2. Do not rename collections or primary keys unless the task explicitly includes migration work.
3. Preserve the app's current timestamp model: `createdAt` and `updatedAt` are numeric epoch values.
4. When adding required fields, update all inserts, seed paths, and readers in the same change.
5. Reuse the existing provider/database abstraction instead of creating duplicate database initialization logic.
6. Keep the current plugin setup and development-only hash fallback unless the task specifically changes environment support.

## Debugging

- Inspect RxDB errors for `cause`, `fix`, and `docs` before guessing.
- Check `node_modules/rxdb/ERROR-MESSAGES.md` for error-code-specific details.
- Use `https://rxdb.info/llms.txt` as the preferred documentation entry point when you need API guidance quickly.
- Prefer existing examples in this repo and RxDB typings with `@example` annotations before inventing new usage patterns.

## Validation

- Run the narrowest behavior check available after changes.
- Use `npm run lint` when there is no smaller focused validation for the touched RxDB surface.