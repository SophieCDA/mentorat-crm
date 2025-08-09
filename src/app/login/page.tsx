// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { withGuestGuard } from '@/components/GuestGuard';

interface LoginCredentials {
  email: string;
  mot_de_passe: string;
  rememberMe: boolean;
}

function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    mot_de_passe: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const response = await authService.checkAuth();
        if (response.success) {
          // Si l'utilisateur est connecté, rediriger vers le dashboard
          router.replace('/dashboard');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        setCheckingAuth(false);
      }
    };

    checkUserAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        // Utiliser replace au lieu de push pour éviter de garder /login dans l'historique
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-crm-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #7978E2 0%, #42B4B7 50%, #F22E77 100%)'
        }}
      />
      
      {/* Animated Background Shapes */}
      <div 
        className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-30 blur-[60px] animate-float"
        style={{ backgroundColor: '#F22E77' }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-[60px] animate-float-delay-1"
        style={{ backgroundColor: '#42B4B7' }}
      />
      <div 
        className="absolute top-1/2 left-[70%] w-56 h-56 rounded-full opacity-30 blur-[60px] animate-float-delay-2"
        style={{ backgroundColor: '#7978E2' }}
      />

      {/* Login Container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl p-12 w-full max-w-md shadow-2xl animate-slide-up">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-slow"
            style={{
              background: 'linear-gradient(135deg, #F22E77 0%, #7978E2 100%)'
            }}
          >
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #F22E77 0%, #7978E2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Bienvenue
          </h1>
          <p className="text-gray-500 text-sm">Connectez-vous à votre espace CRM</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-slide-up">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all"
                placeholder="vous@exemple.com"
                required
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#42B4B7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(66, 180, 183, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
              </svg>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="mot_de_passe"
                name="mot_de_passe"
                value={credentials.mot_de_passe}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all"
                placeholder="••••••••"
                required
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#42B4B7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(66, 180, 183, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"/>
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#42B4B7] transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleInputChange}
                className="sr-only"
                disabled={isLoading}
              />
              <div 
                className="w-5 h-5 border-2 rounded-md transition-all cursor-pointer"
                style={{
                  borderColor: credentials.rememberMe ? 'transparent' : '#d1d5db',
                  background: credentials.rememberMe 
                    ? 'linear-gradient(135deg, #F22E77 0%, #7978E2 100%)' 
                    : 'white'
                }}
              >
                {credentials.rememberMe && (
                  <svg className="w-3 h-3 text-white mx-auto mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                  </svg>
                )}
              </div>
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            
            <a 
              href="/forgot-password" 
              className="text-sm font-medium transition-colors"
              style={{ color: '#7978E2' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F22E77'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#7978E2'}
            >
              Mot de passe oublié ?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #F22E77 0%, #7978E2 100%)'
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-float { animation: float 20s infinite ease-in-out; }
        .animate-float-delay-1 { animation: float 20s infinite ease-in-out; animation-delay: 5s; }
        .animate-float-delay-2 { animation: float 20s infinite ease-in-out; animation-delay: 10s; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s infinite; }
      `}</style>
    </div>
  );
}

export default withGuestGuard(LoginPage, '/dashboard');