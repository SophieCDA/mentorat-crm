// app/not-found.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth.service';

export default function NotFound() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté pour adapter le lien
    authService.checkAuth().then(response => {
      setIsAuthenticated(response.success);
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background decorative elements */}
      <div 
        className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-20 blur-[60px]"
        style={{ backgroundColor: '#F22E77' }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-[60px]"
        style={{ backgroundColor: '#42B4B7' }}
      />
      
      <div className="relative z-10 text-center px-6">
        {/* 404 Error */}
        <div className="mb-8">
          <h1 
            className="text-9xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #F22E77 0%, #7978E2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-crm-pink to-crm-purple mx-auto rounded-full"></div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            className="px-6 py-3 bg-gradient-to-r from-crm-pink to-crm-purple text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            {isAuthenticated ? 'Retour au tableau de bord' : 'Se connecter'}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-crm-turquoise hover:text-crm-turquoise transition-all"
          >
            Page précédente
          </button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500">
          Besoin d'aide ? {' '}
          <a 
            href="mailto:support@votreentreprise.com" 
            className="text-crm-purple hover:text-crm-pink transition-colors"
          >
            Contactez le support
          </a>
        </p>
      </div>
    </div>
  );
}