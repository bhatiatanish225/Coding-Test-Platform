import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    // Clear previous state
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUsername(null);

    // Admin credentials
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setUsername(username);
      console.log('Admin login successful'); // Debug log
      return true;
    } 
    // User credentials
    else if (username === 'anjum_test' && password === 'Test@123') {
      setIsAuthenticated(true);
      setIsAdmin(false);
      setUsername(username);
      console.log('User login successful'); // Debug log
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};