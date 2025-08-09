// types/tag.types.ts

export interface Tag {
    id: number;
    nom: string;
    couleur: string;
    description?: string;
    date_creation?: string;
    cree_par?: string;
    nombre_contacts?: number;
  }
  
  export interface TagFilters {
    search?: string;
    couleur?: string;
    sort_by?: 'nom' | 'couleur' | 'date_creation' | 'nombre_contacts';
    sort_order?: 'asc' | 'desc';
  }
  
  export interface TagStats {
    total_tags: number;
    nouveaux_mois: number;
    taux_croissance: number;
    tags_populaires: Tag[];
    repartition_couleurs: { [couleur: string]: number };
  }
  
  export interface CreateTagRequest {
    nom: string;
    couleur?: string;
    description?: string;
  }
  
  export interface UpdateTagRequest {
    nom?: string;
    couleur?: string;
    description?: string;
  }
  
  export interface TagResponse {
    tag: Tag;
    message?: string;
  }
  
  export interface TagsResponse {
    tags: Tag[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }
  
  export interface BulkTagAction {
    tag_ids: number[];
    action: 'delete' | 'change_color' | 'merge';
    parameters?: {
      new_color?: string;
      target_tag_id?: number;
    };
  }
  
  export interface TagStatistics {
    total_contacts: number;
    email_autorises: number;
    taux_email_autorise: number;
    repartition_sources: { [source: string]: number };
    repartition_pays: { [pays: string]: number };
  }