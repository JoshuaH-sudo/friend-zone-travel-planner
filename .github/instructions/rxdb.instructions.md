---
applyTo: "lib/rxdb-*.ts,lib/DatabaseProvider.tsx,lib/SettingsProvider.tsx,components/hooks/useTripData.ts,app/trip/[tripId]/**/*.tsx,app/settings/**/*.tsx"
description: "Use when changing RxDB schemas, collections, providers, queries, inserts, or RxDB error handling in this app."
---

# RxDB Guidance For This Project

This app's RxDB surface is centered in these files:

- `lib/rxdb-database.ts`: database creation, plugins, storage, collection registration, and ID generation.
- `lib/rxdb-schema.ts`: document types, collection types, and JSON schemas.
- `lib/DatabaseProvider.tsx`: app-wide database initialization and access.
- `lib/seedDatabase.ts`: initial dataset shape and insert examples.
- `components/hooks/useTripData.ts` and route components under `app/trip/[tripId]/`: read and write flows that depend on collection shapes.

When changing RxDB-related code in this repository:

1. Keep document types, JSON schemas, and collection registrations in sync.
2. Preserve the current collection names unless you are intentionally planning a migration.
3. Preserve the `id` primary key pattern and the numeric `createdAt` and `updatedAt` fields used across trip data.
4. When adding schema fields, update all affected inserts and reads, especially seed data and UI hooks.
5. Prefer making changes through the existing database/provider layer instead of introducing parallel RxDB setup paths.
6. Keep the current browser compatibility behavior in `lib/rxdb-database.ts`, including the development-only hash fallback.

When debugging RxDB problems:

- Inspect structured error metadata such as `cause`, `fix`, and `docs` when present.
- Check the installed package file `node_modules/rxdb/ERROR-MESSAGES.md` for error code details.
- Use the RxDB LLM-oriented docs entry point at `https://rxdb.info/llms.txt` when API usage is unclear.
- Prefer nearby examples from RxDB typings or this repository before introducing new patterns.

Validation expectations:

- After RxDB changes, run the narrowest available validation first.
- For this project, `npm run lint` is the default repo-level validation when no more targeted check exists.