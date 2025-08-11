// types/formation.types.ts
export interface Formation {
  id: number;
  titre: string;
  description: string;
  prix: number;
  duree_heures?: number;
  status: 'draft' | 'published' | 'archived';
  image_couverture?: string;
  couleur_theme?: string;
  date_creation: string;
  date_modification?: string;
  date_publication?: string;
  nombre_inscrits?: number;
  duree_totale_minutes?: number;
  nombre_chapitres_total?: number;
  nombre_modules?: number;
  revenus_totaux?: number;
  taux_completion?: number;
  note_moyenne?: number;
  modules?: Module[];
  certificat_actif?: boolean;
  acces_limite?: boolean;
  duree_acces_jours?: number;
  score_minimum_global?: number;
  nombre_vues?: number;
  nombre_evaluations?: number;
}

export interface Module {
  id: number;
  formation_id: number;
  nom: string;
  description?: string;
  ordre: number;
  status: 'active' | 'inactive';
  duree_estimee?: number;
  objectifs?: string[];
  prerequis_modules?: number[];
  date_creation: string;
  date_modification?: string;
  chapitres?: Chapter[];
}

export interface Chapter {
  id: number;
  module_id: number;
  nom: string;
  type: 'text' | 'video' | 'quiz' | 'exercise';
  ordre: number;
  contenu: ContentBlock[];
  duree_estimee?: number;
  requis_pour_progression: boolean;
  score_minimum?: number;
  tentatives_max?: number;
  date_creation: string;
  date_modification?: string;
}

export interface ContentBlock {
  id: string | number;
  type: 'text' | 'video' | 'quiz' | 'exercise' | 'image' | 'audio' | 'document';
  ordre: number;
  data: any;
  options?: {
    visible?: boolean;
    obligatoire?: boolean;
    [key: string]: any;
  };
}

export interface FormationFilters {
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  prix_min?: number;
  prix_max?: number;
  date_debut?: string;
  date_fin?: string;
  tags?: string[];
  categorie?: string;
  niveau?: 'debutant' | 'intermediaire' | 'avance';
  duree_min?: number;
  duree_max?: number;
  page?: number;
  limit?: number;
  sort_by?: 'date_creation' | 'titre' | 'prix' | 'inscrits' | 'revenus';
  sort_order?: 'asc' | 'desc';
}

export interface FormationStats {
  formations?: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    par_mois?: { [key: string]: number };
  };
  inscriptions?: {
    total: number;
    ce_mois: number;
    evolution: number;
    par_formation?: { formation_id: number; total: number }[];
  };
  revenus?: {
    total: number;
    ce_mois: number;
    evolution: number;
    par_formation?: { formation_id: number; total: number }[];
    par_mois?: { [key: string]: number };
  };
  engagement?: {
    taux_completion_moyen: number;
    temps_moyen_formation: number;
    note_moyenne: number;
    taux_abandon?: number;
  };
  performances?: {
    formations_populaires: Array<{
      formation_id: number;
      titre: string;
      inscrits: number;
      revenus: number;
    }>;
    tendances?: {
      inscriptions_tendance: 'up' | 'down' | 'stable';
      revenus_tendance: 'up' | 'down' | 'stable';
    };
  };
}

export interface FormationInscription {
  id: number;
  formation_id: number;
  contact_id: number;
  date_inscription: string;
  date_debut?: string;
  date_fin_acces?: string;
  date_derniere_activite?: string;
  date_completion?: string;
  progression_globale: number;
  temps_total_passe: number;
  certificat_obtenu: boolean;
  date_certificat?: string;
  score_final?: number;
  statut: 'actif' | 'suspendu' | 'termine' | 'expire';
}

export interface ModuleProgress {
  id: number;
  inscription_id: number;
  module_id: number;
  progression: number;
  temps_passe: number;
  date_debut?: string;
  date_fin?: string;
  date_derniere_activite?: string;
  termine: boolean;
  score?: number;
}

export interface ChapterProgress {
  id: number;
  module_progress_id: number;
  chapter_id: number;
  termine: boolean;
  score?: number;
  temps_passe: number;
  tentatives: number;
  date_debut?: string;
  date_fin?: string;
  date_derniere_activite?: string;
  donnees_utilisateur?: any;
}

// Types pour les quiz
export interface QuizQuestion {
  id: string;
  type: 'qcm' | 'qcu' | 'vrai_faux' | 'texte_libre' | 'numerique';
  question: string;
  options?: string[];
  reponse_correcte: string | string[] | number | boolean;
  points: number;
  explication?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
}

export interface QuizData {
  titre: string;
  description?: string;
  questions: QuizQuestion[];
  duree_limite?: number; // en minutes
  tentatives_max: number;
  score_minimum: number;
  affichage_score: boolean;
  melanger_questions: boolean;
  melanger_reponses: boolean;
}

// Types pour les exercices
export interface ExerciseData {
  titre: string;
  description?: string;
  type: 'code' | 'redaction' | 'upload' | 'pratique';
  consignes: string;
  ressources?: Array<{
    titre: string;
    url: string;
    type: 'document' | 'video' | 'lien';
  }>;
  criteres_evaluation?: string[];
  notation: {
    type: 'automatique' | 'manuelle' | 'peer_review';
    bareme?: number;
  };
}

// Types pour les médias
export interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  mime_type: string;
  duree?: number; // pour les vidéos/audio
  dimensions?: {
    width: number;
    height: number;
  };
  uploaded_at: string;
}

// Types pour les templates
export interface FormationTemplate {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  niveau: 'debutant' | 'intermediaire' | 'avance';
  duree_estimee: number;
  prix_suggere: number;
  image_preview: string;
  modules: Array<{
    titre: string;
    description?: string;
    chapitres: Array<{
      titre: string;
      type: Chapter['type'];
      contenu_template: ContentBlock[];
    }>;
  }>;
  tags: string[];
  populaire: boolean;
}

// Types pour l'export/import
export interface FormationExport {
  version: string;
  formation: Formation & {
    modules: Array<Module & {
      chapitres: Chapter[];
    }>;
  };
  metadata: {
    export_date: string;
    export_by: string;
    version_app: string;
  };
}

// Types pour les notifications et événements
export interface FormationEvent {
  id: string;
  type: 'inscription' | 'completion' | 'progress' | 'certification' | 'feedback';
  formation_id: number;
  contact_id: number;
  data: any;
  timestamp: string;
  processed: boolean;
}

// Types utilitaires
export type FormationStatus = Formation['status'];
export type ModuleStatus = Module['status'];
export type ChapterType = Chapter['type'];
export type ContentBlockType = ContentBlock['type'];

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Types pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormationValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number; // Score de qualité sur 100
}