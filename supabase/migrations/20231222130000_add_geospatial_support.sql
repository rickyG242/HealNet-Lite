-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geospatial columns to donations
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS geog GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS geocode_quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Add geospatial columns to needs
ALTER TABLE public.needs 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS geog GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS geocode_quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_donations_geog ON public.donations USING GIST(geog);
CREATE INDEX IF NOT EXISTS idx_needs_geog ON public.needs USING GIST(geog);

-- Function to find needs within a radius (in meters)
CREATE OR REPLACE FUNCTION public.find_needs_within_radius(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  item TEXT,
  category TEXT,
  urgency TEXT,
  quantity INTEGER,
  location TEXT,
  formatted_address TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
AS $$
  SELECT 
    n.id,
    n.organization_id,
    n.item,
    n.category,
    n.urgency,
    n.quantity,
    n.location,
    n.formatted_address,
    ST_Distance(
      n.geog,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) AS distance_meters
  FROM 
    public.needs n
  WHERE 
    n.status = 'active'
    AND n.geog IS NOT NULL
    AND ST_DWithin(
      n.geog,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY 
    distance_meters ASC;
$$;

-- Function to update geospatial data for a donation
CREATE OR REPLACE FUNCTION public.update_donation_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update geospatial data for a need
CREATE OR REPLACE FUNCTION public.update_need_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update geography columns
DROP TRIGGER IF EXISTS trg_donation_geography ON public.donations;
CREATE TRIGGER trg_donation_geography
BEFORE INSERT OR UPDATE OF lat, lng ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_donation_geography();

DROP TRIGGER IF EXISTS trg_need_geography ON public.needs;
CREATE TRIGGER trg_need_geography
BEFORE INSERT OR UPDATE OF lat, lng ON public.needs
FOR EACH ROW
EXECUTE FUNCTION public.update_need_geography();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.find_needs_within_radius TO anon, authenticated;
