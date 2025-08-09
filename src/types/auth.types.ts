// types/auth.types.ts

export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
  rememberMe: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom?: string;
  role: string;
  avatar?: string;
  derniere_connexion?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  field?: string;
}