// types/contact.types.ts - Mis à jour avec intégration complète des tags

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

export interface Contact {
    id_utilisateur: number;
    email: string;
    email_autorise: boolean;
    date_creation: string;
    source?: string;
    nom: string;
    prenom: string;
    telephone?: string;
    pays?: string;
    ville?: string;
    code_postal?: string;
    adresse?: string;
    entreprise?: string;
    numero_tva?: string;
    
    // Relations
    tags?: Tag[];
    campagnes?: Campaign[];
    formations?: Formation[];
    transactions?: Transaction[];
}
  
export interface Tag {
    id: number;
    nom: string;
    couleur: string;
    description?: string;
    date_creation?: string;
    cree_par?: string;
    nombre_contacts?: number;
}

export interface Campaign {
    id: number;
    nom: string;
    statut: 'active' | 'pausee' | 'terminee' | 'brouillon';
    date_debut: string;
    date_fin?: string;
    type: 'email' | 'sms' | 'notification';
    nombre_inscrits: number;
    taux_ouverture?: number;
    taux_clic?: number;
}
  
export interface Formation {
    id: number;
    nom: string;
    description?: string;
    statut: 'active' | 'inactive' | 'archivee';
    prix: number;
    duree_heures?: number;
    date_acces?: string;
    progression?: number;
}
  
export interface Transaction {
    id: number;
    contact_id: number;
    montant: number;
    devise: string;
    statut: 'reussie' | 'en_attente' | 'echouee' | 'remboursee';
    date_transaction: string;
    type: 'achat' | 'abonnement' | 'remboursement';
    description?: string;
    reference?: string;
    methode_paiement?: string;
}
  
export interface ContactFilters {
    search?: string;
    tags?: number[];
    campagnes?: number[];
    formations?: number[];
    email_autorise?: boolean;
    source?: string;
    pays?: string;
    ville?: string;
    date_debut?: string;
    date_fin?: string;
    sort_by?: 'nom' | 'prenom' | 'date_creation' | 'email';
    sort_order?: 'asc' | 'desc';
}
  
export interface ContactStats {
    total_contacts: number;
    nouveaux_mois: number;
    taux_croissance: number;
    contacts_actifs: number;
    valeur_moyenne: number;
    total_revenus: number;
    taux_croissance_revenus: number;
}

// =====================================
// Types spécifiques aux tags
// =====================================

export interface TagStats {
    total_tags: number;
    tags_utilises: number;
    nouveaux_mois: number;
    tag_populaire: string | null;
    tag_populaire_count: number;
    moyenne_contacts: number;
    taux_utilisation: number;
    couleurs_populaires: Record<string, number>;
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

export interface TagFilters {
    search?: string;
    limit?: number;
    force_refresh?: boolean;
}

export interface TagAssignment {
    contact_id: number;
    tag_ids: number[];
}

export interface BulkTagAssignment {
    tag_id: number;
    contact_ids: number[];
}

export interface PopularTag {
    tag: Tag;
    count: number;
}

// =====================================
// Types pour les actions en lot
// =====================================

export interface BulkAction {
    type: 'delete' | 'add-tag' | 'remove-tag' | 'add-campaign' | 'export';
    data?: any;
}

export interface BulkResponse {
    success: boolean;
    message?: string;
    affected?: number;
    errors?: string[];
}

// =====================================
// Types pour l'import/export
// =====================================

export interface ImportResponse {
    imported: number;
    updated?: number;
    errors?: Array<{
        ligne: number;
        erreur: string;
        donnees: any;
    }>;
    message?: string;
}

export interface ExportParams {
    format: 'csv' | 'xlsx';
    ids?: number[];
    filters?: ContactFilters | TagFilters;
}

// =====================================
// Types pour les activités
// =====================================

export interface Activity {
    id: string;
    type: 'creation' | 'tag' | 'campaign' | 'formation' | 'transaction' | 'email' | 'note' | 'call' | 'modification';
    title: string;
    description: string;
    date: string;
    user?: string;
    metadata?: any;
}

// =====================================
// Types pour les notifications
// =====================================

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    actions?: Array<{
        label: string;
        action: () => void;
    }>;
}

// =====================================
// Types pour les modals
// =====================================

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmModalProps extends ModalProps {
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

// =====================================
// Types pour la pagination
// =====================================

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// =====================================
// Types pour les formulaires
// =====================================

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'color' | 'date';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    };
}

export interface FormError {
    field: string;
    message: string;
}

// =====================================
// Types pour le cache
// =====================================

export interface CacheInfo {
    has_data: boolean;
    last_update: string | null;
    cache_duration: number;
}

export interface CacheManager {
    tags_cache: CacheInfo;
    stats_cache: CacheInfo;
    contacts_cache?: CacheInfo;
}

// =====================================
// Types pour les hooks personnalisés
// =====================================

export interface UseRefreshReturn<T> {
    data: T;
    loading: boolean;
    error: string | null;
    refresh: (force?: boolean) => Promise<void>;
    lastUpdate: Date | null;
}

export interface UseStatsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onStatsLoaded?: (stats: any) => void;
}

// =====================================
// Types pour les composants de stats
// =====================================

export interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    isLoading?: boolean;
    onClick?: () => void;
}

export interface StatsComponentProps {
    refreshTrigger?: number;
    onStatsLoaded?: (stats: any) => void;
    autoRefresh?: boolean;
    showControls?: boolean;
}