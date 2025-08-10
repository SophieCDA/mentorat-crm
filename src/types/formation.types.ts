// src/types/formation.types.ts
export interface ContentBlock {
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'quiz' | 'file' | 'embed';
    ordre: number;
    data: any;
    obligatoire: boolean;
    titre?: string;
  }
  
  export interface Chapter {
    id: number;
    titre: string;
    description?: string;
    ordre: number;
    duree_estimee: number;
    obligatoire: boolean;
    contenu: ContentBlock[];
  }
  
  export interface Module {
    id: number;
    titre: string;
    description?: string;
    ordre: number;
    duree_estimee: number;
    obligatoire: boolean;
    chapitres: Chapter[];
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
  }
  
  export interface FormationFilters {
    search?: string;
    statut?: 'draft' | 'published' | 'archived';
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
  
  export interface FormationStats {
    total: number;
    brouillons: number;
    publiees: number;
    archivees: number;
    revenus_total: number;
    inscriptions_totales: number;
  }