-- Add date_from and date_to columns to routes table
ALTER TABLE routes
ADD COLUMN date_from TIMESTAMP WITH TIME ZONE,
ADD COLUMN date_to TIMESTAMP WITH TIME ZONE;

-- Add days column to destinations table
ALTER TABLE destinations
ADD COLUMN days INTEGER;

-- Migrate existing data: calculate days from start_date and end_date
UPDATE destinations
SET days = 
  CASE 
    WHEN end_date IS NOT NULL AND start_date IS NOT NULL 
    THEN EXTRACT(DAY FROM (end_date - start_date)) + 1
    ELSE 1
  END;

-- Add a comment to explain the migration
COMMENT ON COLUMN destinations.days IS 'Number of days staying at this destination';
COMMENT ON COLUMN routes.date_from IS 'Start date of the route';
COMMENT ON COLUMN routes.date_to IS 'End date of the route';

-- Create an index on the days column for better performance
CREATE INDEX idx_destinations_days ON destinations(days);

-- Create indexes on the date columns for better performance
CREATE INDEX idx_routes_date_from ON routes(date_from);
CREATE INDEX idx_routes_date_to ON routes(date_to);

