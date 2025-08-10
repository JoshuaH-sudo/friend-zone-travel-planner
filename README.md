# Friend Zone Travel Planner

A website to make it easier to plan trips with your friends overseas.

## Features

- **Route Planning**: Create and manage travel routes with multiple destinations
- **Friend Integration**: Connect with friends and see who's available at each destination
- **Real-time Pricing**: Get accommodation and flight prices powered by SerpAPI
  - 🏨 **Accommodation Tab**: View hotel options with prices, ratings, and booking links
  - ✈️ **Transport Tab**: Compare flight options between destinations with prices and booking links
- **Interactive Maps**: Visualize your route with Google Maps integration
- **Date Management**: Plan your trip with flexible date ranges

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: Supabase
- **Maps**: Google Maps API
- **Pricing Data**: SerpAPI (Google Hotels & Google Flights)
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation

## Environment Setup

1. Copy the environment variables:
   ```bash
   cp apps/web-app/.env.example apps/web-app/.env.local
   ```

2. Configure the required API keys:
   - **SERPAPI_API_KEY**: Get your API key from [SerpAPI](https://serpapi.com/) for accommodation and flight pricing
   - **GOOGLE_MAPS_API_KEY**: Google Maps API key for geocoding and maps
   - **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**: Public Google Maps API key for client-side maps
   - **ARCJET_KEY**: Security and rate limiting from [Arcjet](https://arcjet.com/)
   - **Supabase keys**: Database connection from your Supabase project

### Utilities

This project includes:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
