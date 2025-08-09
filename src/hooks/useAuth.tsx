// hooks/useAuth.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState } from '@/types/auth.types';
import { authService } from '@/lib/services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, mot_de_passe: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.checkAuth();
      
      if (response.success && response.user) {
        setState({
          isAuthenticated: true,
          user: response.user,
          loading: false,
        });
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const login = async (email: string, mot_de_passe: string, rememberMe: boolean) => {
    try {
      const response = await authService.login({ email, mot_de_passe, rememberMe });
      
      if (response.success && response.user) {
        setState({
          isAuthenticated: true,
          user: response.user,
          loading: false,
        });
        
        // Redirection après connexion réussie
        router.push('/dashboard');
      } else {
        throw new Error('Échec de la connexion');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await authService.logout();
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
      // La redirection est gérée dans authService.logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await authService.refreshAuth();
      if (response.user) {
        setState({
          isAuthenticated: true,
          user: response.user,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'authentification:', error);
      await logout();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      refreshAuth,
      updateUser 
    }}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC pour protéger les pages
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}