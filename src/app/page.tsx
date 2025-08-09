import { redirect } from 'next/navigation';

/**
 * Page racine de l'application
 * Redirige automatiquement vers login
 * Le middleware se chargera de rediriger vers dashboard si l'utilisateur est connecté
 */
export default function HomePage() {
  // Redirection immédiate vers login
  // Si l'utilisateur est connecté, le middleware le redirigera vers dashboard
  redirect('/login');
  
  // Ce code ne sera jamais exécuté grâce à redirect()
  return null;
}