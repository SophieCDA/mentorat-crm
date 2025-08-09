// types/tag.types.ts - Types corrigés pour correspondre à l'API

export interface Tag {
  id: number;
  nom: string;
  couleur: string;
  description?: string;
  date_creation?: string;
  cree_par?: string;
  nombre_contacts: number;
}

export interface TagStats {
  total_tags: number;
  tags_utilises: number;
  nouveaux_mois: number;
  tag_populaire?: string;
  tag_populaire_count: number;
  moyenne_contacts: number;
  couleurs_populaires?: Record<string, number>;
  taux_utilisation: number;
}

export interface TagFilters {
  search?: string;
  couleur?: string;
  sort_by?: 'nom' | 'couleur' | 'date_creation' | 'nombre_contacts';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  force_refresh?: boolean;
}

export interface CreateTagData {
  nom: string;
  couleur: string;
  description?: string;
  cree_par?: string;
}

export interface UpdateTagData {
  nom?: string;
  couleur?: string;
  description?: string;
}

export interface BulkTagAssignment {
  tag_id: number;
  contact_ids: number[];
}

export interface TagAssignment {
  contact_id: number;
  tag_ids: number[];
}