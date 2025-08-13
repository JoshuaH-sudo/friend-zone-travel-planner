-- Migration for accommodation and transport tables
-- This adds tables to store accommodation and transport details related to destinations

-- Accommodation table
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD')),
    href TEXT,
    type TEXT NOT NULL CHECK (type IN ('hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other')),
    friend_id UUID REFERENCES friends(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport table
CREATE TABLE transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD')),
    href TEXT,
    type TEXT NOT NULL CHECK (type IN ('airplane', 'bus', 'car', 'train', 'ferry', 'other')),
    departure_at TIMESTAMP WITH TIME ZONE,
    arrival_at TIMESTAMP WITH TIME ZONE,
    duration DECIMAL(6, 2), -- Duration in hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_accommodations_destination_id ON accommodations(destination_id);
CREATE INDEX idx_accommodations_friend_id ON accommodations(friend_id);
CREATE INDEX idx_transports_destination_id ON transports(destination_id);

-- Create triggers for updated_at
CREATE TRIGGER update_accommodations_updated_at 
BEFORE UPDATE ON accommodations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transports_updated_at 
BEFORE UPDATE ON transports 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;

-- Accommodations policies (users can access accommodations for destinations in their own routes)
CREATE POLICY "Users can view accommodations for their own destinations" ON accommodations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = accommodations.destination_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert accommodations for their own destinations" ON accommodations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = accommodations.destination_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update accommodations for their own destinations" ON accommodations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = accommodations.destination_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete accommodations for their own destinations" ON accommodations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = accommodations.destination_id
            AND trips.user_id = auth.uid()
        )
    );

-- Transports policies (users can access transports for destinations in their own routes)
CREATE POLICY "Users can view transports for their own destinations" ON transports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = transports.destination_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transports for their own destinations" ON transports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = transports.destination_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transports for their own destinations" ON transports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = transports.destination_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete transports for their own destinations" ON transports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM destinations
            JOIN routes ON routes.id = destinations.route_id
            JOIN trips ON trips.id = routes.trip_id
            WHERE destinations.id = transports.destination_id
            AND trips.user_id = auth.uid()
        )
    );

