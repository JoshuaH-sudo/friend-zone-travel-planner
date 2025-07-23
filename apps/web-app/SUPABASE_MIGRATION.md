# Supabase Migration Guide

This document outlines the migration from NextAuth.js/Auth.js and Prisma to Supabase for the Friend Zone Travel Planner application.

## What Changed

### Authentication
- **Before**: NextAuth.js v5 beta with credentials provider and Prisma adapter
- **After**: Supabase Auth with email/password and Google OAuth

### Database
- **Before**: Prisma ORM with PostgreSQL
- **After**: Supabase PostgreSQL with direct SQL queries

### Key Files Modified
- `lib/auth.ts` - Replaced NextAuth config with Supabase auth utilities
- `lib/db.ts` - Replaced Prisma client with Supabase client
- `lib/actions/auth-actions.ts` - Updated to use Supabase Auth methods
- `middleware.ts` - Updated to use Supabase auth middleware
- `components/login-form.tsx` & `components/signup-form.tsx` - Updated for Supabase auth
- All database query files - Converted from Prisma to Supabase syntax

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and update the following values:

```bash
# Get these from your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Run Database Migrations
Execute the SQL files in the Supabase SQL Editor:

1. Run `supabase/migrations/001_initial_schema.sql`
2. Run `supabase/migrations/002_rls_policies.sql`

### 4. Configure Google OAuth (Optional)
1. In your Supabase project, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add your site URL to the redirect URLs

### 5. Update Site URL
In Supabase project settings > Authentication > URL Configuration:
- Site URL: `http://localhost:3000` (development) or your production URL
- Redirect URLs: Add `http://localhost:3000/auth/callback`

## Database Schema Changes

### Tables Created
- `friends` - User's friends with location data
- `trips` - User's travel trips
- `routes` - Routes within trips
- `destinations` - Destinations within routes

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data.

### Authentication
User authentication is handled by Supabase Auth automatically. The `auth.users` table is managed by Supabase.

## Key Differences

### Authentication Flow
- **Before**: Server-side session management with NextAuth
- **After**: Client-side auth state with server-side verification

### Database Queries
- **Before**: Prisma ORM with type-safe queries
- **After**: Direct SQL queries through Supabase client

### Middleware
- **Before**: NextAuth middleware with session checking
- **After**: Supabase middleware with cookie-based auth

## Migration Notes

### Data Migration
If you have existing data in a Prisma database, you'll need to:
1. Export data from your existing database
2. Transform the data to match the new schema
3. Import into Supabase

### User Accounts
Existing user accounts will need to be recreated in Supabase Auth. Consider:
1. Sending migration emails to existing users
2. Providing a smooth transition process
3. Handling password resets for existing users

### Environment Variables
The following environment variables are no longer needed:
- `DATABASE_URL` (unless needed for migration)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Testing

After setup, test the following flows:
1. User registration with email/password
2. User login with email/password
3. Google OAuth login (if configured)
4. Protected route access
5. Database operations (CRUD for trips, routes, destinations, friends)
6. User logout

## Troubleshooting

### Common Issues
1. **Auth callback errors**: Check redirect URLs in Supabase settings
2. **Database permission errors**: Verify RLS policies are correctly applied
3. **Environment variable errors**: Ensure all required variables are set
4. **Google OAuth issues**: Verify Google OAuth configuration in both Google Console and Supabase

### Debugging
- Check browser network tab for auth-related requests
- Monitor Supabase logs in the dashboard
- Use Supabase's built-in auth debugging tools

