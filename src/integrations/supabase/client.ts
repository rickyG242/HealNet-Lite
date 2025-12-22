import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables with fallback to hardcoded values for backward compatibility
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vjxotswckbnwykkyguyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validate that we have the required credentials
if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    "Missing VITE_SUPABASE_ANON_KEY environment variable. " +
    "Please add it to your .env file. " +
    "Get it from: Supabase Dashboard → Project Settings → API → anon public key"
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);