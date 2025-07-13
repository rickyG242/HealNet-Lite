
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface Organization {
  id: string;
  email: string;
  organization_name: string;
  contact_person: string;
  phone: string;
  location: string;
  organization_type: 'hospital' | 'partner';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  organization?: Organization;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  location: string;
  organizationType: 'hospital' | 'partner';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization data for authenticated user
  const fetchUserOrganization = async (userId: string): Promise<Organization | null> => {
    try {
      const { data: userAuth } = await supabase
        .from('user_auth')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (!userAuth) return null;

      const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userAuth.organization_id)
        .single();

      return organization as Organization;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const organization = await fetchUserOrganization(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            organization
          });
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const organization = await fetchUserOrganization(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          organization
        });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Validation
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (userData.password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long' };
      }

      const redirectUrl = `${window.location.origin}/`;

      // Sign up user with Supabase Auth and organization metadata
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            organization_name: userData.organizationName,
            contact_person: userData.contactPerson,
            phone: userData.phone,
            location: userData.location,
            organization_type: userData.organizationType
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
