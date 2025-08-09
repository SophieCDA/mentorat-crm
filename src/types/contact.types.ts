// types/contact.types.ts

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