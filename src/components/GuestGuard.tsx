// components/GuestGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Composant qui protège les pages réservées aux invités (non connectés)
 * Si l'utilisateur est connecté, il est redirigé vers redirectTo (par défaut /dashboard)
 */
export default function GuestGuard({ 
  children, 
  redirectTo = '/dashboard',
  loadingComponent 
}: GuestGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.checkAuth();
      
      if (response.success) {
        // L'utilisateur est connecté, rediriger
        router.replace(redirectTo);
      } else {
        // L'utilisateur n'est pas connecté, peut accéder à la page
        setIsGuest(true);
        setIsChecking(false);
      }
    } catch (error) {
      // En cas d'erreur, considérer l'utilisateur comme non connecté
      setIsGuest(true);
      setIsChecking(false);
    }
  };

  // Afficher le loader pendant la vérification
  if (isChecking) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-crm-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est un invité (non connecté), afficher le contenu
  if (isGuest) {
    return <>{children}</>;
  }

  // Ne rien afficher pendant la redirection
  return null;
}

// =====================================
// HOC (Higher Order Component) alternatif
// =====================================

/**
 * HOC pour protéger les pages réservées aux invités
 * Usage: export default withGuestGuard(LoginPage);
 */
export function withGuestGuard<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/dashboard'
) {
  return function GuardedComponent(props: P) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await authService.checkAuth();
          
          if (response.success) {
            router.replace(redirectTo);
          } else {
            setIsGuest(true);
            setIsChecking(false);
          }
        } catch {
          setIsGuest(true);
          setIsChecking(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
        </div>
      );
    }

    if (!isGuest) {
      return null;
    }

    return <Component {...props} />;
  };
}