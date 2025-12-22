import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables
const ENV = import.meta.env;

// Validate environment variables
const validateEnv = () => {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !ENV[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please set them in your Vercel project settings or .env file.';
    
    // Show error in console
    console.error(errorMessage);
    
    // Show error in UI if in browser
    if (typeof window !== 'undefined') {
      const errorElement = document.createElement('div');
      errorElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff4444;
        color: white;
        padding: 1rem;
        font-family: sans-serif;
        z-index: 9999;
      `;
      errorElement.textContent = `Configuration Error: ${errorMessage}`;
      document.body.prepend(errorElement);
    }
    
    return false;
  }
  
  return true;
};

// Initialize Supabase client
export const initializeSupabase = () => {
  const isEnvValid = validateEnv();
  
  if (!isEnvValid) {
    return null;
  }
  
  try {
    return createClient<Database>(
      ENV.VITE_SUPABASE_URL,
      ENV.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// Create and export the Supabase client instance
export const supabase = initializeSupabase();