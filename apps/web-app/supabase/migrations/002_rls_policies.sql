-- Row Level Security (RLS) policies for Friend Zone Travel Planner
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their own friends" ON friends
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own friends" ON friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friends" ON friends
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friends" ON friends
    FOR DELETE USING (auth.uid() = user_id);

-- Trips policies
CREATE POLICY "Users can view their own trips" ON trips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON trips
    FOR DELETE USING (auth.uid() = user_id);

-- Routes policies (users can access routes for their own trips)
CREATE POLICY "Users can view routes for their own trips" ON routes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = routes.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert routes for their own trips" ON routes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = routes.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update routes for their own trips" ON routes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = routes.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete routes for their own trips" ON routes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = routes.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- Destinations policies (users can access destinations for routes in their own trips)
CREATE POLICY "Users can view destinations for their own routes" ON destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routes 
            JOIN trips ON trips.id = routes.trip_id
            WHERE routes.id = destinations.route_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert destinations for their own routes" ON destinations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routes 
            JOIN trips ON trips.id = routes.trip_id
            WHERE routes.id = destinations.route_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update destinations for their own routes" ON destinations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM routes 
            JOIN trips ON trips.id = routes.trip_id
            WHERE routes.id = destinations.route_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete destinations for their own routes" ON destinations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM routes 
            JOIN trips ON trips.id = routes.trip_id
            WHERE routes.id = destinations.route_id 
            AND trips.user_id = auth.uid()
        )
    );

