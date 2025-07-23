# Prisma + Supabase Integration Setup Guide

This guide explains how to set up and use Prisma alongside Supabase in the Friend Zone Travel Planner project.

## Architecture Overview

This project uses a **hybrid approach** combining the best of both worlds:

- **Supabase**: Handles authentication, real-time features, Row Level Security (RLS), and simple CRUD operations
- **Prisma**: Provides type-safe ORM, complex queries, transactions, and schema management

## Prerequisites

1. A Supabase project set up and running
2. Node.js and npm/yarn installed
3. Access to your Supabase database credentials

## Setup Instructions

### 1. Get Your Supabase Database Connection String

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. In the **Connection string** section, copy the **URI** format
5. Replace `[YOUR-PASSWORD]` with your actual database password

The connection string should look like:
```
postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update the database URLs:

```bash
cp .env.example .env.local
```

Update these variables in your `.env.local`:

```env
# Prisma Database Configuration
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?schema=public&sslmode=require
DIRECT_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?schema=public&sslmode=require
```

**Important Notes:**
- `DATABASE_URL`: Used for Prisma Client connections (can use connection pooling)
- `DIRECT_URL`: Used for migrations and introspection (direct connection, bypasses pooling)
- Both URLs should be identical for Supabase since it handles connection pooling internally

### 3. Install Dependencies

The project already includes Prisma, but ensure all dependencies are installed:

```bash
npm install
```

### 4. Generate Prisma Client

Generate the Prisma client based on your schema:

```bash
npx prisma generate
```

### 5. Introspect Your Database (Optional)

To verify your schema matches the actual database structure:

```bash
npx prisma db pull
```

This will update your `schema.prisma` file to match your current database structure.

### 6. Apply Schema Changes (If Needed)

If you need to apply the current schema to your database:

```bash
npx prisma db push
```

**⚠️ Warning**: This will modify your database structure. Make sure you have backups!

### 7. Remove NextAuth.js Tables (Clean Up)

Since we've migrated to Supabase Auth, you can remove the old NextAuth.js tables:

```sql
-- Run these commands in your Supabase SQL Editor
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
```

Or create a migration:

```bash
npx prisma migrate dev --name remove-nextauth-tables
```

## Usage Examples

### Basic Prisma Client Usage

```typescript
import { prisma } from '@/lib/prisma'

// Get all trips for a user with routes and destinations
const trips = await prisma.trip.findMany({
  where: {
    user_id: userId,
  },
  include: {
    routes: {
      include: {
        destinations: true,
      },
    },
  },
})
```

### Hybrid Approach Example

```typescript
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function createTrip(tripData: CreateTripData) {
  // Use Supabase for authentication
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('User not authenticated')
  }

  // Use Prisma for complex database operations
  return await prisma.trip.create({
    data: {
      name: tripData.name,
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      user_id: user.id,
    },
    include: {
      routes: true,
    },
  })
}
```

## When to Use Prisma vs Supabase SDK

### Use Prisma for:
- ✅ Complex queries with multiple joins
- ✅ Database transactions
- ✅ Type-safe database operations
- ✅ Aggregations and analytics
- ✅ Batch operations
- ✅ Schema migrations
- ✅ Advanced filtering and sorting

### Use Supabase SDK for:
- ✅ Authentication operations
- ✅ Real-time subscriptions
- ✅ Row Level Security (RLS) enforcement
- ✅ Simple CRUD operations
- ✅ File storage operations
- ✅ Edge functions
- ✅ Operations that need RLS policies

## Available Scripts

The following npm scripts are available for Prisma operations:

```bash
# Generate Prisma client
npm run postinstall

# Create a new migration
npm run new-migration

# Reset database (⚠️ destructive)
npm run clean-db

# Seed database
npm run seed-db
```

## Troubleshooting

### Connection Issues

1. **"Can't reach database server"**
   - Verify your `DATABASE_URL` is correct
   - Check that your Supabase project is running
   - Ensure your IP is allowed (Supabase allows all IPs by default)

2. **SSL Connection Issues**
   - Make sure your connection string includes `sslmode=require`
   - For local development, you might need `sslmode=prefer`

3. **Schema Not Found**
   - Ensure your connection string includes `?schema=public`
   - Check that the schema exists in your database

### Migration Issues

1. **Migration Conflicts**
   - Use `npx prisma migrate resolve --applied <migration-name>` to mark migrations as applied
   - Use `npx prisma migrate reset` to reset and reapply all migrations (⚠️ destructive)

2. **Schema Drift**
   - Run `npx prisma db pull` to sync your schema with the database
   - Run `npx prisma migrate diff` to see differences

### Type Issues

1. **Prisma Client Not Generated**
   - Run `npx prisma generate` after schema changes
   - Restart your TypeScript server in your IDE

2. **Type Mismatches**
   - Ensure your schema matches your database structure
   - Run `npx prisma db pull` to sync schema from database

## Best Practices

1. **Always use transactions for multi-table operations**
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Multiple operations here
   })
   ```

2. **Use Prisma for complex queries, Supabase SDK for simple ones**
   ```typescript
   // Complex query - use Prisma
   const analytics = await prisma.trip.groupBy({
     by: ['user_id'],
     _count: { id: true },
   })

   // Simple query with RLS - use Supabase
   const { data } = await supabase.from('trips').select('*')
   ```

3. **Always handle authentication through Supabase**
   ```typescript
   // Get user from Supabase Auth
   const { data: { user } } = await supabase.auth.getUser()
   
   // Use user.id in Prisma queries
   const trips = await prisma.trip.findMany({
     where: { user_id: user.id }
   })
   ```

4. **Use environment-specific configurations**
   ```typescript
   const prisma = new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query'] : [],
   })
   ```

## Security Considerations

1. **Row Level Security (RLS)**
   - RLS policies are enforced by Supabase SDK, not Prisma
   - When using Prisma, manually verify user permissions
   - Consider using Supabase SDK for operations requiring RLS

2. **Connection Security**
   - Always use SSL connections in production
   - Keep your database credentials secure
   - Use environment variables for sensitive data

3. **Query Safety**
   - Prisma provides SQL injection protection by default
   - Always validate input data before database operations
   - Use Prisma's type system to prevent runtime errors

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase + Prisma Integration Guide](https://supabase.com/partners/integrations/prisma)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)

