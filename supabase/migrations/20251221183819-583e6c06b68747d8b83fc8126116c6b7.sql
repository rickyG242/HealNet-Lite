-- Create needs table to store organization needs/requests
CREATE TABLE public.needs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  quantity INTEGER NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  dropoff_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for needs table

-- Policy: Anyone can view open needs (for public homepage display)
CREATE POLICY "Anyone can view open needs" 
  ON public.needs 
  FOR SELECT 
  USING (status = 'open');

-- Policy: Organizations can insert needs for their own organization
CREATE POLICY "Organizations can insert their own needs" 
  ON public.needs 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Organizations can update their own needs
CREATE POLICY "Organizations can update their own needs" 
  ON public.needs 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Organizations can delete their own needs
CREATE POLICY "Organizations can delete their own needs" 
  ON public.needs 
  FOR DELETE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

-- Add policy to organizations table: Allow public to view organizations that have open needs
-- This is needed for the join query in Index.tsx that displays needs with organization info
CREATE POLICY "Anyone can view organizations with open needs" 
  ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.needs 
      WHERE status = 'open'
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_needs_status ON public.needs(status);
CREATE INDEX idx_needs_organization_id ON public.needs(organization_id);
CREATE INDEX idx_needs_created_at ON public.needs(created_at DESC);

