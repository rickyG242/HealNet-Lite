export interface Donor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  preferences?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  organization?: any; // Replace with Organization type if you have it
  donor?: Donor;
  accountType: 'organization' | 'donor';
}
