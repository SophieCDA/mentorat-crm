// utils/constants.ts

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Charte graphique
export const COLORS = {
  primary: '#7978E2',    // Purple
  secondary: '#42B4B7',  // Cyan
  accent: '#F22E77',     // Pink
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

// Formation Configuration
export const FORMATION_STATUS = {
  BROUILLON: 'brouillon',
  ACTIVE: 'active',
  ARCHIVEE: 'archivee'
} as const;

export const FORMATION_NIVEAU = {
  DEBUTANT: 'debutant',
  INTERMEDIAIRE: 'intermediaire',
  AVANCE: 'avance'
} as const;

export const CONTENT_TYPES = {
  TEXT: 'text',
  VIDEO: 'video',
  QUIZ: 'quiz',
  EXERCISE: 'exercise',
  DOWNLOAD: 'download'
} as const;

// UI Configuration
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
} as const;

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  SUCCESS: 'success',
  GHOST: 'ghost'
} as const;

export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const;

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info'
} as const;

// Messages
export const MESSAGES = {
  ERRORS: {
    FETCH_FORMATIONS: 'Erreur lors du chargement des formations',
    CREATE_FORMATION: 'Erreur lors de la création de la formation',
    UPDATE_FORMATION: 'Erreur lors de la mise à jour de la formation',
    DELETE_FORMATION: 'Erreur lors de la suppression de la formation',
    PUBLISH_FORMATION: 'Erreur lors de la publication de la formation',
    ARCHIVE_FORMATION: 'Erreur lors de l\'archivage de la formation',
  },
  CONFIRM: {
    DELETE_FORMATION: 'Êtes-vous sûr de vouloir supprimer cette formation ?',
    DELETE_MODULE: 'Êtes-vous sûr de vouloir supprimer ce module ?',
    DELETE_CHAPTER: 'Êtes-vous sûr de vouloir supprimer ce chapitre ?',
  },
  PLACEHOLDERS: {
    SEARCH: 'Rechercher une formation...',
    FORMATION_TITLE: 'Titre de la formation',
    FORMATION_DESCRIPTION: 'Décrivez votre formation...',
    MODULE_TITLE: 'Titre du module',
    CHAPTER_TITLE: 'Titre du chapitre',
    VIDEO_URL: 'URL de la vidéo (YouTube, Vimeo...)',
    QUIZ_TITLE: 'Titre du quiz',
    QUIZ_DESCRIPTION: 'Description du quiz',
    EXERCISE_TITLE: 'Titre de l\'exercice',
    EXERCISE_INSTRUCTIONS: 'Instructions de l\'exercice',
    RESOURCE_TITLE: 'Titre de la ressource',
    RESOURCE_DESCRIPTION: 'Description de la ressource',
  }
};