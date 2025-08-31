-- This migration updates the schema for the POC branch to:
-- 1. Remove start_date and end_date from destinations table
-- 2. Make days column required for destinations
-- 3. Add date_from and date_to to trips table

-- First, ensure days column exists and has values
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS days INTEGER;

-- Update any NULL days values based on start_date and end_date
UPDATE destinations
SET days = EXTRACT(DAY FROM (end_date - start_date)) + 1
WHERE days IS NULL AND start_date IS NOT NULL AND end_date IS NOT NULL;

-- Set a default value for any remaining NULL days
UPDATE destinations
SET days = 1
WHERE days IS NULL;

-- Make days column NOT NULL
ALTER TABLE destinations
ALTER COLUMN days SET NOT NULL;

-- Add date_from and date_to to trips table if they don't exist
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS date_from TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_to TIMESTAMP WITH TIME ZONE;

-- Update trips date_from and date_to based on existing start_date and end_date
UPDATE trips
SET date_from = start_date,
    date_to = end_date
WHERE date_from IS NULL AND date_to IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_days ON destinations(days);
CREATE INDEX IF NOT EXISTS idx_trips_date_range ON trips(date_from, date_to);

-- Add comments for clarity
COMMENT ON COLUMN destinations.days IS 'Number of days staying at this destination';
COMMENT ON COLUMN trips.date_from IS 'Start date of the trip';
COMMENT ON COLUMN trips.date_to IS 'End date of the trip';

