-- Add individual address fields to friends table
-- This allows for more granular address management while keeping the existing location field

ALTER TABLE friends 
ADD COLUMN street TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state_province TEXT,
ADD COLUMN country TEXT,
ADD COLUMN postal_code TEXT;

-- Update existing records to have required fields based on location
-- Note: This is a basic update - you may want to manually review existing data
UPDATE friends 
SET 
    street = 'Unknown',
    city = 'Unknown', 
    country = 'Unknown'
WHERE street IS NULL OR city IS NULL OR country IS NULL;

-- Add constraints for required fields
ALTER TABLE friends 
ALTER COLUMN street SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN country SET NOT NULL;
