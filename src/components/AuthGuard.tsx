// components/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

/**
 * Composant de protection des routes côté client
 * Vérifie l'authentification et redirige si nécessaire
 */
export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/login',
  allowedRoles = []
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-vérifier quand la route change

  const checkAuth = async () => {
    try {
      const response = await authService.checkAuth();
      
      if (requireAuth) {
        // Page protégée - nécessite une authentification
        if (!response.success) {
          // Pas connecté - rediriger vers login
          const loginUrl = new URL(redirectTo, window.location.origin);
          
          // Sauvegarder la page actuelle pour redirection après connexion
          if (pathname !== '/' && pathname !== '/login') {
            loginUrl.searchParams.set('redirect', pathname);
          }
          
          router.replace(loginUrl.toString());
          return;
        }
        
        // Vérifier les rôles si spécifiés
        if (allowedRoles.length > 0 && response.user) {
          const hasRole = allowedRoles.includes(response.user.role);
          if (!hasRole) {
            // Pas le bon rôle - rediriger vers dashboard ou page d'erreur
            router.replace('/dashboard');
            return;
          }
        }
        
        // Autorisé
        setIsAuthorized(true);
      } else {
        // Page publique - accessible sans authentification
        if (response.success) {
          // Déjà connecté - rediriger vers dashboard
          router.replace('/dashboard');
          return;
        }
        
        // Non connecté - autoriser l'accès
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      
      if (requireAuth) {
        // En cas d'erreur sur une page protégée, rediriger vers login
        router.replace(redirectTo);
      } else {
        // En cas d'erreur sur une page publique, autoriser l'accès
        setIsAuthorized(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-crm-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // Si non autorisé, ne rien afficher (la redirection est en cours)
  if (!isAuthorized) {
    return null;
  }

  // Autorisé - afficher le contenu
  return <>{children}</>;
}

// =====================================
// Hook personnalisé pour vérifier l'auth
// =====================================
import { useAuth } from '@/hooks/useAuth';

export function useAuthGuard(requireAuth: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      // Nécessite auth mais pas connecté
      const loginUrl = new URL('/login', window.location.origin);
      if (pathname !== '/') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      router.replace(loginUrl.toString());
    } else if (!requireAuth && isAuthenticated) {
      // Page publique mais déjà connecté
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, requireAuth, pathname, router]);

  return { isAuthenticated, loading, user };
}