-- Create donors table to store donor information
CREATE TABLE public.donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for donors table
CREATE POLICY "Users can view their own donor profile" 
  ON public.donors 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own donor profile" 
  ON public.donors 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Update the user_auth table to support donor accounts
ALTER TABLE public.user_auth 
  ADD COLUMN donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE;

-- Update the handle_new_user_registration function to support donor registration
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_donor BOOLEAN;
  new_donor_id UUID;
BEGIN
  -- Check if this is a donor registration
  is_donor := (NEW.raw_user_meta_data ->> 'account_type') = 'donor';
  
  IF is_donor THEN
    -- Insert donor data
    INSERT INTO public.donors (
      user_id,
      first_name,
      last_name,
      phone,
      location
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'location'
    ) RETURNING id INTO new_donor_id;
    
    -- Link user to donor account
    INSERT INTO public.user_auth (user_id, donor_id)
    VALUES (NEW.id, new_donor_id);
  ELSE
    -- Existing organization registration logic
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
    );
    
    -- Link user to organization
    INSERT INTO public.user_auth (user_id, organization_id)
    VALUES (
      NEW.id,
      (SELECT id FROM public.organizations WHERE email = NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create index for better performance
CREATE INDEX idx_donors_user_id ON public.donors(user_id);
