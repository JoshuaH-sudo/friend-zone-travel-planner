# Friends Table Schema Migration Instructions

## Overview
This document provides instructions for updating the Supabase friends table schema to support detailed address fields required for the friend creation page feature.

## Current Schema
```sql
create table public.friends (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  location text not null,
  latitude double precision not null,
  longitude double precision not null,
  user_id uuid not null,
  destination_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint friends_pkey primary key (id),
  constraint fk_friends_destination foreign KEY (destination_id) references destinations (id) on delete set null,
  constraint friends_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
```

## Required Schema Updates

### Step 1: Add New Address Fields
Execute the following SQL commands in your Supabase SQL editor:

```sql
-- Add new address fields to the friends table
ALTER TABLE public.friends 
ADD COLUMN street text,
ADD COLUMN city text,
ADD COLUMN state_province text,
ADD COLUMN country text,
ADD COLUMN postal_code text;
```

### Step 2: Update Existing Records (Optional)
If you have existing friends records, you may want to populate the new address fields. The current `location` field can be used as a fallback:

```sql
-- Update existing records to use location as a fallback address
UPDATE public.friends 
SET 
  street = location,
  country = 'Unknown'
WHERE street IS NULL;
```

### Step 3: Create Indexes for Performance (Recommended)
Add indexes on commonly queried address fields:

```sql
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_friends_country ON public.friends USING btree (country);
CREATE INDEX IF NOT EXISTS idx_friends_city ON public.friends USING btree (city);
```

## Updated Schema
After migration, your friends table will have the following structure:

```sql
create table public.friends (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  location text not null, -- Kept for backward compatibility
  latitude double precision not null,
  longitude double precision not null,
  street text,
  city text,
  state_province text,
  country text,
  postal_code text,
  user_id uuid not null,
  destination_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint friends_pkey primary key (id),
  constraint fk_friends_destination foreign KEY (destination_id) references destinations (id) on delete set null,
  constraint friends_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
```

## Migration Notes

1. **Backward Compatibility**: The existing `location` field is preserved to maintain backward compatibility with existing code.

2. **Gradual Migration**: New friends will use the structured address fields, while existing friends can continue to work with the location field until manually updated.

3. **Data Validation**: The application will handle validation of address fields and ensure proper geocoding.

4. **Future Considerations**: Consider adding constraints or validation rules based on your specific requirements (e.g., required country field).

## Verification
After running the migration, verify the changes:

```sql
-- Check the updated table structure
\d public.friends;

-- Verify existing data is intact
SELECT id, name, location, street, city, country FROM public.friends LIMIT 5;
```

## Rollback (If Needed)
If you need to rollback the changes:

```sql
-- Remove the new columns (WARNING: This will delete data)
ALTER TABLE public.friends 
DROP COLUMN street,
DROP COLUMN city,
DROP COLUMN state_province,
DROP COLUMN country,
DROP COLUMN postal_code;

-- Drop the indexes
DROP INDEX IF EXISTS idx_friends_country;
DROP INDEX IF EXISTS idx_friends_city;
```

**Note**: Always backup your database before running migration scripts in production.

