-- Enable PostGIS extension for geographical data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create issues table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('pothole', 'garbage', 'streetlight', 'graffiti', 'other')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create spatial index for efficient location queries
CREATE INDEX idx_issues_location ON issues USING GIST (location);

-- Create index on created_at for time-based queries
CREATE INDEX idx_issues_created_at ON issues (created_at DESC);

-- Create index on status for filtering
CREATE INDEX idx_issues_status ON issues (status);

-- Create index on category for filtering
CREATE INDEX idx_issues_category ON issues (category);

-- Create categories lookup table
CREATE TABLE categories (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (key, label, description) VALUES
    ('pothole', 'Pothole', 'Road surface damage and potholes'),
    ('garbage', 'Garbage/Litter', 'Trash, litter, and waste management issues'),
    ('streetlight', 'Broken Street Light', 'Non-functioning or damaged street lighting'),
    ('graffiti', 'Graffiti', 'Unauthorized markings and graffiti'),
    ('other', 'Other', 'Other civic issues not covered by specific categories');

-- Row Level Security (RLS) policies
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read issues (public visibility)
CREATE POLICY "Issues are viewable by everyone" ON issues
    FOR SELECT USING (true);

-- Allow authenticated users to insert issues
CREATE POLICY "Authenticated users can insert issues" ON issues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own issues
CREATE POLICY "Users can update own issues" ON issues
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own issues
CREATE POLICY "Users can delete own issues" ON issues
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for issue photos
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', true);

-- Storage policies for issue photos
CREATE POLICY "Issue photos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'issue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own issue photos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'issue-photos' AND auth.uid() = owner);

CREATE POLICY "Users can delete own issue photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'issue-photos' AND auth.uid() = owner);

-- Function to get nearby issues within a radius (in meters)
CREATE OR REPLACE FUNCTION get_nearby_issues(
    center_lat FLOAT,
    center_lng FLOAT,
    radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
    id UUID,
    photo_url TEXT,
    category TEXT,
    notes TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    latitude FLOAT,
    longitude FLOAT,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.photo_url,
        i.category,
        i.notes,
        i.status,
        i.created_at,
        ST_Y(i.location::geometry) as latitude,
        ST_X(i.location::geometry) as longitude,
        ST_Distance(i.location, ST_Point(center_lng, center_lat)::geography) as distance_meters
    FROM issues i
    WHERE ST_DWithin(i.location, ST_Point(center_lng, center_lat)::geography, radius_meters)
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;