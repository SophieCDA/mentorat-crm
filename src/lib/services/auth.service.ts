// lib/services/auth.service.ts

import { LoginCredentials, AuthResponse, User } from '@/types/auth.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AuthService {
  private userKey = 'user_data';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: permet d'envoyer et recevoir les cookies
        body: JSON.stringify({
          email: credentials.email,
          mot_de_passe: credentials.mot_de_passe,
          remember_me: credentials.rememberMe
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Le cookie est automatiquement géré par le navigateur
      // On stocke uniquement les données utilisateur localement
      if (data.user) {
        this.setUser(data.user, credentials.rememberMe);
      }

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la connexion');
    }
  }

  async logout(): Promise<void> {
    try {
      // Appeler l'endpoint de logout pour supprimer le cookie côté serveur
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearLocalData();
      window.location.href = '/login';
    }
  }

  async checkAuth(): Promise<AuthResponse> {
    try {
      // Vérifier l'authentification via le cookie
      const response = await fetch(`${API_BASE_URL}/check-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.clearLocalData();
        return { success: false };
      }

      const data = await response.json();
      
      if (data.user) {
        this.setUser(data.user, true);
      }

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      this.clearLocalData();
      return { success: false };
    }
  }

  async refreshAuth(): Promise<AuthResponse> {
    try {
      // Rafraîchir le cookie d'authentification
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.clearLocalData();
        throw new Error('Échec du rafraîchissement de l\'authentification');
      }

      const data = await response.json();
      
      if (data.user) {
        this.setUser(data.user, true);
      }

      return data;
    } catch (error) {
      this.clearLocalData();
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi de l\'email');
      }

      return {
        success: true,
        message: data.message || 'Email de réinitialisation envoyé'
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la réinitialisation');
      }

      return {
        success: true,
        message: data.message || 'Mot de passe réinitialisé avec succès'
      };
    } catch (error) {
      throw error;
    }
  }

  private setUser(user: User, remember: boolean): void {
    const userData = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(this.userKey, userData);
    } else {
      sessionStorage.setItem(this.userKey, userData);
    }
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // L'authentification est maintenant vérifiée via le cookie
  async isAuthenticated(): Promise<boolean> {
    const response = await this.checkAuth();
    return response.success;
  }

  private clearLocalData(): void {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }
}

export const authService = new AuthService();