# Friend Zone Travel Planner — Cypress Project Context

This document describes the Cypress testing setup for the Friend Zone Travel Planner app.
Read this before authoring or modifying any Cypress test in this project.

## Project Overview

- **Framework**: Next.js 16 (App Router), React 19
- **Database**: RxDB 17 with Dexie (IndexedDB) storage
- **State**: All data is stored client-side via RxDB; no backend API
- **i18n**: `next-intl` (English `messages/en.json`, German `messages/de.json`)
- **Cypress version**: 15.x
- **Test types in use**: Component (CT) and E2E

## Directory Layout

```
cypress/
  component/          # Component (CT) test specs (*.cy.tsx)
  e2e/                # End-to-end test specs (*.cy.ts)
  fixtures/
    test-data.json    # Predefined seed data for tests
  support/
    commands.ts       # Custom Cypress commands
    component.ts      # Component test support (imports cy.mount)
    e2e.ts            # E2E test support
    test-db.ts        # Test database helpers & predefined data constants
    TestWrapper.tsx   # React wrapper for component tests (providers/mocks)
cypress.config.ts     # Cypress configuration
cypress/tsconfig.json # TypeScript config for the cypress/ directory
```

## Testing Types

| Type | When to use |
|------|-------------|
| **Component** | Testing isolated UI component behaviour (render, user interactions, props) |
| **E2E** | Full user journeys through the real app (`baseUrl: http://localhost:3000`) |

## Component Test Setup

All component tests must be wrapped with `TestWrapper` from `cypress/support/TestWrapper.tsx`.
`TestWrapper` provides:
- `NextIntlClientProvider` (English messages)
- Mock `SettingsContext` (use `settingsOverrides` prop to customise)
- Mock `DatabaseContext` (use `mockDatabase` prop or `createMockDatabase()`)

**Example:**
```tsx
import { TestWrapper, createMockDatabase } from "../support/TestWrapper";

cy.mount(
  <TestWrapper mockDatabase={createMockDatabase()}>
    <MyComponent {...props} />
  </TestWrapper>,
);
```

### Intercepting Exchange Rates

Components that show currency costs use `useExchangeRates` which calls the Frankfurter API.
Always intercept this in component tests that involve money display:

```ts
cy.intercept("GET", "https://api.frankfurter.dev/**", {
  body: { rates: { EUR: 0.93, GBP: 0.79 } },
}).as("exchangeRates");
```

## E2E Test Setup

E2E tests run against the live app at `http://localhost:3000`.
Start the dev server before running E2E tests: `npm run dev`.

### Resetting State Between Tests

Because the app stores data in IndexedDB, use `cy.clearAppStorage()` in `beforeEach`
to reset the database between tests:

```ts
beforeEach(() => {
  cy.clearAppStorage();
  cy.visit("/");
});
```

### Getting Test Fixtures

Use `cy.getTestData()` to retrieve the predefined fixture data from `cypress/fixtures/test-data.json`:

```ts
cy.getTestData().then((data) => {
  // data.trips, data.stops, data.accommodations, etc.
});
```

## Selector Strategy

Always prefer `data-cy` attributes for selectors. The following elements have `data-cy` attributes:

### Home page (`app/page.tsx`)
| `data-cy` | Element |
|-----------|---------|
| `plan-trip-button` | "Plan a trip" button |
| `create-trip-dialog` | The create trip dialog |
| `trip-name-input` | Trip name input in dialog |
| `trip-start-location-input` | Start location input |
| `trip-start-date-input` | Start date input |
| `first-stop-input` | First stop input |
| `create-trip-submit` | "Create and open" button |
| `search-input` | Search trips input |
| `filter-tabs` | Filter tabs (All / Upcoming / Ongoing / Past) |
| `trips-grid` | The grid of trip cards |
| `trip-card` | Individual trip card (also has `data-trip-id`) |
| `empty-state` | Empty state card (when no trips) |
| `empty-plan-trip-button` | Plan a trip button in empty state |

### TripNameEditor (`app/trip/[tripId]/components/trip-header/TripNameEditor.tsx`)
| `data-cy` | Element |
|-----------|---------|
| `trip-name-display` | Trip name heading (view mode) |
| `trip-name-edit` | Edit button |
| `trip-name-input` | Name input (edit mode) |
| `trip-name-save` | Save button (edit mode) |
| `trip-name-cancel` | Cancel button (edit mode) |
| `trip-export` | Export calendar button |

### StopCard (`app/trip/[tripId]/components/stop/StopCard.tsx`)
| `data-cy` | Element |
|-----------|---------|
| `stop-card` | The card container |
| `stop-name` | Stop title (view mode) |
| `edit-stop-button` | Edit stop name button |
| `delete-stop-button` | Delete stop button |
| `stop-name-input` | Name input (edit mode) |
| `stop-name-save` | Save button (edit mode) |
| `stop-name-cancel` | Cancel button (edit mode) |
| `add-accommodation-button` | "Add stay" button |
| `add-transport-button` | "Add journey" button |

## When to Add Tests

Add or update Cypress tests when:
- Adding a new component that has user-interactive behaviour
- Adding new form fields, buttons, or interactive UI elements to existing components
- Fixing a bug (add a regression test)
- Changing the text content that `data-cy` selectors rely on

When adding new interactive elements, **always add a `data-cy` attribute** to make
them testable. Follow the naming convention: `kebab-case-description` (e.g. `add-stop-button`).

## Test Data Constants

`cypress/support/test-db.ts` exports predefined IDs and data:
- `TEST_TRIP_ID` / `TEST_TRIP_ID_2`
- `TEST_STOP_ID` / `TEST_STOP_ID_2`
- `TEST_ACCOMMODATION_ID`, `TEST_TRANSPORT_ID`, `TEST_EXPENSE_ID`
- `TEST_TRIPS`, `TEST_STOPS`, etc. — full document arrays
- `seedData(db)` — seeds all data into an RxDB database instance
- `clearAllData(db)` — removes all documents from a database instance
