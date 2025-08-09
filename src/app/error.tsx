// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur dans un service de monitoring (Sentry, etc.)
    console.error('Application error:', error);
  }, [error]);

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
      
      <div className="relative z-10 text-center px-6 max-w-md">
        {/* Error Icon */}
        <div className="mb-6">
          <div 
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F22E77 0%, #7978E2 100%)'
            }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Oups ! Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-8">
          {error.message || "Une erreur inattendue s'est produite. Nous travaillons à la résoudre."}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-crm-pink to-crm-purple text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Réessayer
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-crm-turquoise hover:text-crm-turquoise transition-all"
          >
            Retour à l'accueil
          </button>
        </div>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-500 font-mono">
              Error ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}