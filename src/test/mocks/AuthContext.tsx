import React, { createContext, useContext, ReactNode } from 'react';

interface MockAuthContextType {
  user: { id: string } | null;
  profile: { role: string } | null;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider = ({ 
  children, 
  user = null,
  profile = null,
}: { 
  children: ReactNode;
  user?: { id: string } | null;
  profile?: { role: string } | null;
}) => {
  return (
    <MockAuthContext.Provider value={{ user, profile, signOut: () => {} }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    return { user: null, profile: null, signOut: () => {} };
  }
  return context;
};
