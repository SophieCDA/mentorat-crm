// types/formations.ts

export interface ContentBlock {
  id: string | number;
  type: 'text' | 'video' | 'quiz' | 'exercise' | 'download';
  ordre: number;
  data: any;
  obligatoire: boolean;
  titre: string;
  description?: string;
}

export interface Chapter {
  id: string | number;
  titre: string;
  description?: string;
  ordre: number;
  contenu: ContentBlock[];
  duree_estimee?: number;
}

export interface Module {
  id: string | number;
  titre: string;
  description?: string;
  ordre: number;
  chapitres: Chapter[];
  duree_estimee?: number;
}

export interface Formation {
  id?: string | number;
  titre: string;
  description: string;
  prix: number;
  duree_estimee: number;
  niveau: 'debutant' | 'intermediaire' | 'avance';
  statut?: 'brouillon' | 'active' | 'archivee';
  modules: Module[];
  nombre_inscrits?: number;
  note_moyenne?: number;
  date_creation?: string;
  miniature?: string;
}

export type FormationStatus = 'brouillon' | 'active' | 'archivee';
export type FormationNiveau = 'debutant' | 'intermediaire' | 'avance';
export type ContentType = ContentBlock['type'];

export interface ContentTypeConfig {
  type: ContentType;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  color: string;
}