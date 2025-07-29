-- Add individual address fields to friends table as optional fields
-- The main address will be stored in the location field

ALTER TABLE friends 
ADD COLUMN street TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state_province TEXT,
ADD COLUMN country TEXT,
ADD COLUMN postal_code TEXT;

-- Update existing records to have placeholder values
UPDATE friends 
SET 
    street = 'N/A',
    city = 'N/A', 
    country = 'N/A'
WHERE street IS NULL OR city IS NULL OR country IS NULL;
