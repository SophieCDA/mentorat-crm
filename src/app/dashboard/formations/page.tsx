'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  RefreshCw, 
  TrendingUp,
  BookOpen,
  Users,
  Euro,
  Clock,
  Eye,
  BarChart3,
  Download,
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { Formation, FormationFilters } from '@/types/formation.types';
import { formationService } from '@/lib/services/formation.service';
import FormationCard from '@/components/formations/FormationCard';

// Interface pour les statistiques
interface FormationStats {
  total: number;
  brouillons: number;
  publiees: number;
  archivees: number;
  revenus_total: number;
  inscriptions_totales: number;
  note_moyenne?: number; // Made optional
}

export default function FormationsPage() {
  const router = useRouter();
  
  // États principaux
  const [formations, setFormations] = useState<Formation[]>([]);
  const [stats, setStats] = useState<FormationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // États d'interface
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'date_creation' | 'titre' | 'prix' | 'nombre_inscrits'>('date_creation');
  
  // Filtres
  const [filters, setFilters] = useState<FormationFilters>({
    search: '',
    statut: undefined,
    limit: 20,
    offset: 0,
    sort_by: 'date_creation',
    sort_order: 'desc'
  });

  // Chargement des données
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadFormations();
  }, [filters]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [formationsResponse, statsResponse] = await Promise.all([
        formationService.getFormations(filters),
        formationService.getStats()
      ]);
      
      setFormations(formationsResponse.formations || []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Erreur chargement initial:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFormations = async () => {
    if (loading) return;
    
    try {
      const response = await formationService.getFormations(filters);
      setFormations(response.formations || []);
    } catch (error) {
      console.error('Erreur chargement formations:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  // Actions
  const handleCreateFormation = async () => {
    setCreating(true);
    try {
      const response = await formationService.createFormation({
        titre: 'Nouvelle Formation',
        description: '',
        statut: 'draft',
        prix: 0
      });
      
      if (response.formation) {
        router.push(`/dashboard/formations/${response.formation.id}/edit`);
      }
    } catch (error) {
      console.error('Erreur création formation:', error);
    } finally {
      setCreating(false);
    }
  };

  // Gestion des filtres
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, offset: 0 }));
  };

  const handleStatusFilter = (status: Formation['statut'] | undefined) => {
    setFilters(prev => ({ ...prev, statut: status, offset: 0 }));
  };

  const handleSort = (field: typeof sortBy) => {
    const newOrder = field === sortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    setFilters(prev => ({ 
      ...prev, 
      sort_by: field, 
      sort_order: newOrder,
      offset: 0 
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      statut: undefined,
      limit: 20,
      offset: 0,
      sort_by: 'date_creation',
      sort_order: 'desc'
    });
    setSortBy('date_creation');
    setSortOrder('desc');
  };

  // Filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statut) count++;
    return count;
  }, [filters]);

  // Composant de statistiques
  const StatsCard = ({ title, value, icon, color, trend }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp 
                size={14} 
                className={`mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} 
              />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Formations</h1>
            <p className="text-gray-600">
              Gérez et créez vos contenus de formation en quelques clics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/formations/analytics')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 size={18} />
              Analytics
            </button>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Actualiser
            </button>
            
            <button
              onClick={handleCreateFormation}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg disabled:opacity-50"
              style={{ backgroundColor: '#F22E77' }}
            >
              <Plus size={20} />
              {creating ? 'Création...' : 'Nouvelle Formation'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total formations"
            value={stats.total}
            icon={<BookOpen size={24} />}
            color="#7978E2"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Apprenants inscrits"
            value={stats.inscriptions_totales.toLocaleString('fr-FR')}
            icon={<Users size={24} />}
            color="#42B4B7"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Revenus générés"
            value={`${stats.revenus_total.toLocaleString('fr-FR')}€`}
            icon={<Euro size={24} />}
            color="#F22E77"
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Note moyenne"
            value={stats.note_moyenne ? `${stats.note_moyenne.toFixed(1)}/5` : 'N/A'}
            icon={<TrendingUp size={24} />}
            color="#10B981"
            trend={{ value: 3, isPositive: true }}
          />
        </div>
      )}

      {/* Barre de filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par titre, description..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filtres rapides */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre statut */}
            <div className="relative">
              <select
                value={filters.statut || ''}
                onChange={(e) => handleStatusFilter(e.target.value as Formation['statut'] || undefined)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">📝 Brouillon</option>
                <option value="published">✅ Publié</option>
                <option value="archived">📦 Archivé</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Tri */}
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                className="appearance-none bg-transparent border-none px-3 py-3 pr-8 focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="date_creation">Date de création</option>
                <option value="titre">Titre</option>
                <option value="prix">Prix</option>
                <option value="nombre_inscrits">Nombre d'inscrits</option>
              </select>
              <button
                onClick={() => handleSort(sortBy)}
                className="px-2 py-1 text-gray-600 hover:text-gray-800"
              >
                {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
              </button>
            </div>

            {/* Toggle vue */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded transition-all ${
                  view === 'grid' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Vue grille"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded transition-all ${
                  view === 'list' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Vue liste"
              >
                <List size={16} />
              </button>
            </div>

            {/* Badge filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  Effacer tout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filtres de statut rapides */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleStatusFilter(undefined)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              !filters.statut 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({stats?.total || 0})
          </button>
          <button
            onClick={() => handleStatusFilter('draft')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.statut === 'draft' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Brouillons ({stats?.brouillons || 0})
          </button>
          <button
            onClick={() => handleStatusFilter('published')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.statut === 'published' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Publiées ({stats?.publiees || 0})
          </button>
          <button
            onClick={() => handleStatusFilter('archived')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.statut === 'archived' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Archivées ({stats?.archivees || 0})
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: '#7978E2' }}></div>
          <p className="text-gray-600 text-lg">Chargement de vos formations...</p>
          <p className="text-gray-500 text-sm mt-1">Veuillez patienter quelques instants</p>
        </div>
      ) : formations.length > 0 ? (
        <div className="space-y-4">
          {/* En-tête de liste avec compteur */}
          <div className="flex items-center justify-between text-sm text-gray-600 px-1">
            <span>
              {formations.length} formation{formations.length > 1 ? 's' : ''} trouvée{formations.length > 1 ? 's' : ''}
              {filters.search && ` pour "${filters.search}"`}
            </span>
            
            <div className="flex items-center gap-2">
              <span>Affichage :</span>
              <span className="font-medium text-gray-900">
                {view === 'grid' ? 'Grille' : 'Liste'}
              </span>
            </div>
          </div>

          {/* Grille/Liste des formations */}
          <div className={
            view === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-3'
          }>
            {formations.map((formation) => (
              <FormationCard 
                key={formation.id} 
                formation={formation} 
                view={view}
                onEdit={(formation) => router.push(`/dashboard/formations/${formation.id}/edit`)}
                onDelete={async (formation) => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
                    try {
                      await formationService.deleteFormation(formation.id);
                      setFormations(prev => prev.filter(f => f.id !== formation.id));
                      refreshData(); // Recharger les stats
                    } catch (error) {
                      console.error('Erreur suppression:', error);
                    }
                  }
                }}
                onDuplicate={async (formation) => {
                  try {
                    const response = await formationService.duplicateFormation(formation.id);
                    if (response.formation) {
                      setFormations(prev => [response.formation, ...prev]);
                      refreshData(); // Recharger les stats
                    }
                  } catch (error) {
                    console.error('Erreur duplication:', error);
                  }
                }}
                onPublish={async (formation) => {
                  try {
                    await formationService.publishFormation(formation.id);
                    setFormations(prev => prev.map(f => 
                      f.id === formation.id 
                        ? { ...f, statut: 'published' as const }
                        : f
                    ));
                    refreshData(); // Recharger les stats
                  } catch (error) {
                    console.error('Erreur publication:', error);
                  }
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* État vide amélioré */
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="max-w-md mx-auto">
            {filters.search || filters.statut ? (
              /* Aucun résultat de recherche */
              <>
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-100">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Aucune formation trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  Aucune formation ne correspond à vos critères de recherche.
                  <br />Essayez de modifier vos filtres ou votre recherche.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Effacer les filtres
                </button>
              </>
            ) : (
              /* Première formation */
              <>
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: '#F22E7720' }}
                >
                  <BookOpen size={32} style={{ color: '#F22E77' }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Créez votre première formation
                </h3>
                <p className="text-gray-600 mb-8">
                  Commencez à partager vos connaissances en créant votre première formation.
                  <br />Utilisez notre éditeur no-code pour une création simple et rapide.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleCreateFormation}
                    disabled={creating}
                    className="px-8 py-4 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: '#F22E77' }}
                  >
                    {creating ? 'Création...' : '🚀 Créer ma première formation'}
                  </button>
                  
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Création en 5 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>Aperçu temps réel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings size={16} />
                      <span>Sans code</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}