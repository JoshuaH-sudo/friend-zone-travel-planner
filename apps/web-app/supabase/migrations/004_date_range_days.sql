-- Update routes table to add date_from and date_to columns
ALTER TABLE routes
ADD COLUMN date_from TIMESTAMP WITH TIME ZONE,
ADD COLUMN date_to TIMESTAMP WITH TIME ZONE;

-- Update destinations table to replace start_date and end_date with days
-- First, add the new days column
ALTER TABLE destinations
ADD COLUMN days INTEGER;

-- Update the days column based on the difference between start_date and end_date
-- This converts existing data to use the new days format
UPDATE destinations
SET days = EXTRACT(DAY FROM (end_date - start_date)) + 1
WHERE start_date IS NOT NULL AND end_date IS NOT NULL;

-- Make days column NOT NULL after data migration
ALTER TABLE destinations
ALTER COLUMN days SET NOT NULL;

-- Keep the start_date and end_date columns for now to maintain backward compatibility
-- They can be removed in a future migration after all code is updated

