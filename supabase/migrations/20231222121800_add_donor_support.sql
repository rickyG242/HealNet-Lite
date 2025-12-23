-- Add donor_id column to user_auth (nullable at first, we'll make it required after data migration if needed)
ALTER TABLE public.user_auth 
ADD COLUMN donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE;

-- Create donors table
CREATE TABLE public.donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for donors table
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Create policies for donors table
CREATE POLICY "Users can view their own donor profile" 
  ON public.donors 
  FOR SELECT 
  USING (
    id IN (
      SELECT donor_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own donor profile" 
  ON public.donors 
  FOR UPDATE 
  USING (
    id IN (
      SELECT donor_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

-- Update the handle_new_user_registration function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_donor_id UUID;
  new_org_id UUID;
  account_type TEXT;
BEGIN
  -- Get account type from metadata
  account_type := NEW.raw_user_meta_data ->> 'account_type';
  
  IF account_type = 'donor' THEN
    -- Insert donor data
    INSERT INTO public.donors (
      email,
      first_name,
      last_name,
      phone,
      location
    ) VALUES (
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'location'
    ) RETURNING id INTO new_donor_id;
    
    -- Link user to donor
    INSERT INTO public.user_auth (user_id, donor_id)
    VALUES (NEW.id, new_donor_id);
    
  ELSE
    -- Insert organization data (existing logic)
    INSERT INTO public.organizations (
      email,
      organization_name,
      contact_person,
      phone,
      location,
      organization_type
    ) VALUES (
      NEW.email,
      NEW.raw_user_meta_data ->> 'organization_name',
      NEW.raw_user_meta_data ->> 'contact_person',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'location',
      NEW.raw_user_meta_data ->> 'organization_type'
    ) RETURNING id INTO new_org_id;
    
    -- Link user to organization
    INSERT INTO public.user_auth (user_id, organization_id)
    VALUES (NEW.id, new_org_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create index for better performance
CREATE INDEX idx_donors_email ON public.donors(email);

-- Add constraint to ensure user is linked to either donor or organization
ALTER TABLE public.user_auth 
ADD CONSTRAINT check_user_link 
CHECK (
  (organization_id IS NOT NULL AND donor_id IS NULL) OR 
  (organization_id IS NULL AND donor_id IS NOT NULL)
);
