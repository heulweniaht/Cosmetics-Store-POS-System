import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';

// Tạm thời define User interface ở đây
interface User {
  id: string; username: string;
  email?: string;
  roles: string[];
}


export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Helper function để parse roles từ backend format
  const parseRoles = (backendRoles: any[]): string[] => {
    if (!Array.isArray(backendRoles)) return [];
    
    return backendRoles.map(role => {
      // Nếu role là object có property name
      if (typeof role === 'object' && role.name) {
        return role.name; // Extract "ADMIN", "USER", etc.
      }
      // Nếu role đã là string
      if (typeof role === 'string') {
        return role;
      }
      return String(role);
    });
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Kiểm tra token trực tiếp
      const introspectResponse = await axiosClient.post('/identity/auth/introspect', { token });
      if (introspectResponse.data.result?.valid) {
        // Lấy thông tin user
        const userResponse = await axiosClient.get('/identity/users/my-info');
        const userInfo = userResponse.data.result;
        

        
        // Parse roles từ object format thành string array
        const parsedRoles = parseRoles(userInfo.roles);
        
        setUser({
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          roles: parsedRoles  // Sử dụng parsed roles
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axiosClient.post('/identity/auth/token', { username, password });
      const authResult = response.data.result;
      
      // Lưu token
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('refreshToken', authResult.refreshToken);
      
      // Lấy thông tin user
      const userResponse = await axiosClient.get('/identity/users/my-info');
      const userInfo = userResponse.data.result;
      
      // Parse roles từ object format thành string array
      const parsedRoles = parseRoles(userInfo.roles);
      
      setUser({
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        roles: parsedRoles  // Sử dụng parsed roles
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await axiosClient.post('/identity/users', userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axiosClient.post('/identity/auth/logout', { token });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };
  const isAdmin = (): boolean => {
    const hasAdminRole = user?.roles?.includes('ADMIN') || false;
    
    return hasAdminRole;
  };

  const isUser = (): boolean => {
    const hasUserRole = user?.roles?.includes('USER') || false;
    
    return hasUserRole;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      isAdmin,
      isUser
    }}>
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