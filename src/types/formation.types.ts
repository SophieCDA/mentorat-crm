// types/formation.ts

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'text' | 'number';
  question: string;
  options?: string[];
  correct_answer: string | number | boolean;
  explanation?: string;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  time_limit?: number;
}

export interface ExerciseStep {
  id: string;
  title: string;
  description: string;
  type: 'instruction' | 'input' | 'validation' | 'media';
  expected_result?: string;
  hints?: string[];
  code_snippet?: string;
  language?: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'quiz' | 'exercise' | 'file' | 'embed' | 'gallery' | 'interactive';
  ordre: number;
  data: any;
  obligatoire: boolean;
  titre?: string;
  metadata?: {
    created_at: string;
    updated_at: string;
    created_by: string;
    version: number;
  };
}

export interface Chapter {
  id: number;
  titre: string;
  description?: string;
  ordre: number;
  duree_estimee: number;
  obligatoire: boolean;
  contenu: ContentBlock[];
  completion_rate?: number;
  analytics?: {
    views: number;
    completions: number;
    average_time: number;
  };
}

export interface Module {
  id: number;
  titre: string;
  description?: string;
  ordre: number;
  duree_estimee: number;
  obligatoire: boolean;
  chapitres: Chapter[];
  color?: string;
  icon?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Formation {
  id: number;
  titre: string;
  description?: string;
  statut: 'draft' | 'published' | 'archived';
  prix: number;
  duree_estimee: number;
  miniature?: string;
  modules: Module[];
  date_creation?: string;
  date_publication?: string;
  cree_par?: string;
  nombre_inscrits?: number;
  note_moyenne?: number;
  tags?: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  certificate?: boolean;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

export const COLORS = {
  primary: '#F22E77',
  secondary: '#42B4B7', 
  accent: '#7978E2',
  white: '#FFFFFF',
  dark: '#1a1a1a',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const PREVIEW_MODES = {
  DESKTOP: 'desktop',
  TABLET: 'tablet', 
  MOBILE: 'mobile'
} as const;