
-- Create organizations table to store hospital and partner registrations
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('hospital', 'partner')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_auth table to link Supabase auth users with organizations
CREATE TABLE public.user_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations table
CREATE POLICY "Users can view their own organization" 
  ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own organization" 
  ON public.organizations 
  FOR UPDATE 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.user_auth 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for user_auth table
CREATE POLICY "Users can view their own auth records" 
  ON public.user_auth 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert organization data
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
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create organization when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

-- Create indexes for better performance
CREATE INDEX idx_organizations_email ON public.organizations(email);
CREATE INDEX idx_user_auth_user_id ON public.user_auth(user_id);
CREATE INDEX idx_user_auth_organization_id ON public.user_auth(organization_id);
