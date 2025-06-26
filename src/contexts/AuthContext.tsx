
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  organizationName: string;
  contactPerson: string;
  phone: string;
  location: string;
  organizationType: 'hospital' | 'partner';
  verified: boolean;
  registrationDate: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

// Simple hash function for password security (in production, use proper bcrypt)
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('kidscanser_user');
    const sessionToken = localStorage.getItem('kidscanser_session');
    
    if (savedUser && sessionToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('kidscanser_user');
        localStorage.removeItem('kidscanser_session');
      }
    }
    setIsLoading(false);
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

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('kidscanser_users') || '[]');
      const emailExists = existingUsers.some((u: any) => u.email === userData.email);
      
      if (emailExists) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        organizationName: userData.organizationName,
        contactPerson: userData.contactPerson,
        phone: userData.phone,
        location: userData.location,
        organizationType: userData.organizationType,
        verified: false, // In production, would require email verification
        registrationDate: new Date(),
      };

      // Store user credentials securely
      const hashedPassword = simpleHash(userData.password);
      const userCredentials = {
        email: userData.email,
        passwordHash: hashedPassword,
        userId: newUser.id,
      };

      // Save to localStorage (simulating database)
      existingUsers.push(newUser);
      const existingCredentials = JSON.parse(localStorage.getItem('kidscanser_credentials') || '[]');
      existingCredentials.push(userCredentials);
      
      localStorage.setItem('kidscanser_users', JSON.stringify(existingUsers));
      localStorage.setItem('kidscanser_credentials', JSON.stringify(existingCredentials));

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
      const credentials = JSON.parse(localStorage.getItem('kidscanser_credentials') || '[]');
      const users = JSON.parse(localStorage.getItem('kidscanser_users') || '[]');
      
      const hashedPassword = simpleHash(password);
      const userCredential = credentials.find((c: any) => 
        c.email === email && c.passwordHash === hashedPassword
      );

      if (!userCredential) {
        return { success: false, error: 'Invalid email or password' };
      }

      const userData = users.find((u: any) => u.id === userCredential.userId);
      
      if (!userData) {
        return { success: false, error: 'User account not found' };
      }

      // Create session
      const sessionToken = Date.now().toString();
      localStorage.setItem('kidscanser_session', sessionToken);
      localStorage.setItem('kidscanser_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kidscanser_user');
    localStorage.removeItem('kidscanser_session');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
