-- Create accommodations table
CREATE TABLE IF NOT EXISTS public.accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD')),
    href TEXT,
    type TEXT NOT NULL CHECK (type IN ('hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other')),
    friend_id UUID REFERENCES public.friends(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transports table
CREATE TABLE IF NOT EXISTS public.transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD')),
    href TEXT,
    type TEXT NOT NULL CHECK (type IN ('airplane', 'bus', 'car', 'train', 'ferry', 'other')),
    departure_at TIMESTAMP WITH TIME ZONE,
    arrival_at TIMESTAMP WITH TIME ZONE,
    duration DECIMAL(10, 2), -- in hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS accommodations_destination_id_idx ON public.accommodations(destination_id);
CREATE INDEX IF NOT EXISTS accommodations_friend_id_idx ON public.accommodations(friend_id);
CREATE INDEX IF NOT EXISTS transports_destination_id_idx ON public.transports(destination_id);

-- Add RLS policies for accommodations
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accommodations" ON public.accommodations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own accommodations" ON public.accommodations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own accommodations" ON public.accommodations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own accommodations" ON public.accommodations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

-- Add RLS policies for transports
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transports" ON public.transports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own transports" ON public.transports
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own transports" ON public.transports
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own transports" ON public.transports
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.destinations d
            JOIN public.routes r ON d.route_id = r.id
            JOIN public.trips t ON r.trip_id = t.id
            WHERE d.id = destination_id AND t.user_id = auth.uid()
        )
    );

-- Add triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accommodations_updated_at
BEFORE UPDATE ON public.accommodations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transports_updated_at
BEFORE UPDATE ON public.transports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

