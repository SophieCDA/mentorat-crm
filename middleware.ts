// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessibles UNIQUEMENT sans authentification
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

// Routes API publiques
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/check-auth',
];

// Assets et fichiers statiques à ignorer
const STATIC_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/assets',
  '/images',
  '/fonts',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les fichiers statiques
  if (STATIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérifier le cookie de session
  // Adaptez le nom selon votre backend Python (session, auth_cookie, flask_session, etc.)
  const sessionCookie = 
    request.cookies.get('session')?.value || 
    request.cookies.get('auth_cookie')?.value ||
    request.cookies.get('QUART_AUTH')?.value;
  
  const isAuthenticated = !!sessionCookie;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPublicApiRoute = PUBLIC_API_ROUTES.includes(pathname);
  const isApiRoute = pathname.startsWith('/api/');

  // Logique de protection stricte
  
  // 1. Si l'utilisateur N'EST PAS connecté
  if (!isAuthenticated) {
    // Autoriser seulement les routes publiques
    if (isPublicRoute || isPublicApiRoute) {
      return NextResponse.next();
    }
    
    // Pour les routes API protégées, retourner 401
    if (isApiRoute) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Non autorisé. Veuillez vous connecter.',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }
    
    // Pour toute autre route, rediriger vers login
    const loginUrl = new URL('/login', request.url);
    
    // Sauvegarder l'URL demandée pour redirection après connexion
    if (pathname !== '/' && pathname !== '/login') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si l'utilisateur EST connecté
  if (isAuthenticated) {
    // Bloquer l'accès aux pages publiques (login, register, etc.)
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Rediriger la racine vers le dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Autoriser l'accès aux autres pages
    return NextResponse.next();
  }

  // Par défaut, continuer
  const response = NextResponse.next();
  
  // Ajouter des headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Configuration pour exclure certains chemins
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, robots.txt, etc.
     * - fichiers avec extensions (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)' 
  ],
};