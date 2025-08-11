// app/dashboard/formation/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Eye, 
  Copy, 
  Trash2, 
  Play, 
  Pause,
  Archive,
  Download,
  Upload,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Settings,
  BarChart3,
  Target,
  Award,
  Zap
} from 'lucide-react';

// Services et types
import { formationService } from '@/lib/services/formation.service';
import { Formation, FormationStats, FormationFilters } from '@/types/formation.types';

const colors = {
  primary: '#F22E77',
  secondary: '#42B4B7', 
  accent: '#7978E2',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// Composant principal
const FormationDashboard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formations, setFormations] = useState<Formation[]>([]);
  const [stats, setStats] = useState<FormationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams?.get('sort') || 'date_creation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams?.get('order') as 'asc' | 'desc') || 'desc'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFormations, setSelectedFormations] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFormations(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFormations = async () => {
    try {
      const filters: FormationFilters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter as 'draft' | 'published' | 'archived';
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await formationService.getFormations(filters);
      setFormations(response.formations || []);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await formationService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const createFormation = async () => {
    try {
      setIsCreating(true);
      const newFormationData = {
        titre: 'Nouvelle Formation',
        description: 'Description de votre formation...',
        prix: 0,
        couleur_theme: colors.accent,
        status: 'draft' as const
      };

      const response = await formationService.createFormation(newFormationData);
      
      if (response.formation?.id) {
        router.push(`/dashboard/formation/builder/${response.formation.id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la formation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormationAction = async (action: string, formationId: number) => {
    try {
      switch (action) {
        case 'edit':
          router.push(`/dashboard/formations/builder/${formationId}`);
          break;
        
        case 'preview':
          window.open(`/formations/preview/${formationId}`, '_blank');
          break;
        
        case 'duplicate':
          const formation = formations.find(f => f.id === formationId);
          const newTitle = formation ? `${formation.titre} (Copie)` : undefined;
          
          await formationService.duplicateFormation(formationId, newTitle);
          await loadFormations();
          alert('Formation dupliquée avec succès !');
          break;
        
        case 'publish':
          await formationService.publishFormation(formationId);
          await loadFormations();
          alert('Formation publiée avec succès !');
          break;
        
        case 'archive':
          if (confirm('Êtes-vous sûr de vouloir archiver cette formation ?')) {
            // Vous pouvez ajouter une méthode archiveFormation au service
            // Pour l'instant, on met à jour le statut
            await formationService.updateFormation(formationId, { status: 'archived' });
            await loadFormations();
            alert('Formation archivée avec succès !');
          }
          break;
        
        case 'delete':
          if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
            await formationService.deleteFormation(formationId);
            await loadFormations();
            alert('Formation supprimée avec succès !');
          }
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      alert('Une erreur est survenue lors de l\'opération');
    }
    
    setShowDropdown(null);
  };

  // Effet pour recharger les formations quand les filtres changent
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (!loading) {
        loadFormations();
      }
    }, 300); // Debounce la recherche

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter]);

  const filteredAndSortedFormations = formations
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'titre':
          aValue = a.titre.toLowerCase();
          bValue = b.titre.toLowerCase();
          break;
        case 'prix':
          aValue = a.prix;
          bValue = b.prix;
          break;
        case 'inscrits':
          aValue = a.nombre_inscrits || 0;
          bValue = b.nombre_inscrits || 0;
          break;
        case 'revenus':
          aValue = a.revenus_totaux || 0;
          bValue = b.revenus_totaux || 0;
          break;
        case 'date_creation':
        default:
          aValue = new Date(a.date_creation).getTime();
          bValue = new Date(b.date_creation).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: colors.warning, bg: '#FEF3C7' },
      published: { label: 'Publié', color: colors.success, bg: '#D1FAE5' },
      archived: { label: 'Archivé', color: '#6B7280', bg: '#F3F4F6' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: config.bg,
          color: config.color
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.accent }}
          ></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Formations</h1>
              <p className="text-gray-600 mt-1">Gérez vos formations et suivez leurs performances</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Export via le service
                  const link = document.createElement('a');
                  link.href = '/api/formations/export';
                  link.download = 'formations.json';
                  link.click();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              
              <button
                onClick={createFormation}
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:transform hover:-translate-y-1 disabled:opacity-50 shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  boxShadow: '0 4px 15px rgba(242, 46, 119, 0.3)'
                }}
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'Création...' : 'Nouvelle Formation'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Formations totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.formations?.total || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.formations?.published || 0} publiées
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inscriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inscriptions?.total || 0}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`w-4 h-4 mr-1 ${(stats.inscriptions?.evolution || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <p className={`text-sm ${(stats.inscriptions?.evolution || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(stats.inscriptions?.evolution || 0) >= 0 ? '+' : ''}{stats.inscriptions?.evolution || 0}% ce mois
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.revenus?.total || 0)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`w-4 h-4 mr-1 ${(stats.revenus?.evolution || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <p className={`text-sm ${(stats.revenus?.evolution || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(stats.revenus?.evolution || 0) >= 0 ? '+' : ''}{stats.revenus?.evolution || 0}% ce mois
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de complétion</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.engagement?.taux_completion_moyen || 0}%</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Note: {stats.engagement?.note_moyenne || 0}/5
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillons</option>
                  <option value="published">Publiées</option>
                  <option value="archived">Archivées</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': colors.accent } as React.CSSProperties}
                >
                  <option value="date_creation">Date de création</option>
                  <option value="titre">Titre</option>
                  <option value="prix">Prix</option>
                  <option value="inscrits">Nb. inscrits</option>
                  <option value="revenus">Revenus</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Vue grille"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current"></div>
                  <div className="bg-current"></div>
                  <div className="bg-current"></div>
                  <div className="bg-current"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Vue liste"
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="h-0.5 bg-current"></div>
                  <div className="h-0.5 bg-current"></div>
                  <div className="h-0.5 bg-current"></div>
                  <div className="h-0.5 bg-current"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Liste des formations */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedFormations.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                onAction={handleFormationAction}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                colors={colors}
                formatCurrency={formatCurrency}
                formatDuration={formatDuration}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <FormationTable
              formations={filteredAndSortedFormations}
              onAction={handleFormationAction}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              colors={colors}
              formatCurrency={formatCurrency}
              formatDuration={formatDuration}
              getStatusBadge={getStatusBadge}
            />
          </div>
        )}

        {/* Message si aucune formation */}
        {filteredAndSortedFormations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Aucune formation trouvée' : 'Aucune formation créée'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre première formation avec notre builder NO-CODE'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={createFormation}
                disabled={isCreating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:transform hover:-translate-y-1 disabled:opacity-50 shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  boxShadow: '0 4px 15px rgba(242, 46, 119, 0.3)'
                }}
              >
                <Plus className="w-5 h-5" />
                {isCreating ? 'Création...' : 'Créer ma première formation'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant carte de formation
const FormationCard: React.FC<{
  formation: Formation;
  onAction: (action: string, id: number) => void;
  showDropdown: number | null;
  setShowDropdown: (id: number | null) => void;
  colors: any;
  formatCurrency: (amount: number) => string;
  formatDuration: (minutes: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}> = ({ formation, onAction, showDropdown, setShowDropdown, colors, formatCurrency, formatDuration, getStatusBadge }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1">
      {/* Image de couverture */}
      <div
        className="h-40 bg-gradient-to-r relative"
        style={{
          background: formation.image_couverture 
            ? `url(${formation.image_couverture}) center/cover`
            : `linear-gradient(135deg, ${formation.couleur_theme || colors.accent}, ${colors.secondary})`
        }}
      >
        <div className="absolute top-3 left-3">
          {getStatusBadge(formation.status)}
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(showDropdown === formation.id ? null : formation.id)}
              className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>
            
            {showDropdown === formation.id && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[160px]">
                <button
                  onClick={() => onAction('edit', formation.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => onAction('preview', formation.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  Aperçu
                </button>
                <button
                  onClick={() => onAction('duplicate', formation.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>
                {formation.status === 'draft' && (
                  <button
                    onClick={() => onAction('publish', formation.id)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-green-600"
                  >
                    <Play className="w-4 h-4" />
                    Publier
                  </button>
                )}
                {formation.status === 'published' && (
                  <button
                    onClick={() => onAction('archive', formation.id)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </button>
                )}
                <hr className="my-2" />
                <button
                  onClick={() => onAction('delete', formation.id)}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {formation.titre}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {formation.description}
        </p>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{formation.nombre_inscrits} inscrits</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(formation.revenus_totaux || 0)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(formation.duree_totale_minutes || 0)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{formation.nombre_chapitres_total} chapitres</span>
          </div>
        </div>

        {/* Métriques avancées */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Complétion: {formation.taux_completion || 0}%</span>
          <span>Note: {formation.note_moyenne || 0}/5</span>
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
            {formatCurrency(formation.prix)}
          </div>
          
          <button
            onClick={() => onAction('edit', formation.id)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:transform hover:-translate-y-1"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              boxShadow: '0 2px 8px rgba(242, 46, 119, 0.3)'
            }}
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant tableau de formations
const FormationTable: React.FC<{
  formations: Formation[];
  onAction: (action: string, id: number) => void;
  showDropdown: number | null;
  setShowDropdown: (id: number | null) => void;
  colors: any;
  formatCurrency: (amount: number) => string;
  formatDuration: (minutes: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}> = ({ formations, onAction, showDropdown, setShowDropdown, colors, formatCurrency, formatDuration, getStatusBadge }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrits</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complétion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {formations.map((formation) => (
            <tr key={formation.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg mr-3"
                    style={{
                      background: formation.image_couverture 
                        ? `url(${formation.image_couverture}) center/cover`
                        : `linear-gradient(135deg, ${formation.couleur_theme || colors.accent}, ${colors.secondary})`
                    }}
                  ></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{formation.titre}</div>
                    <div className="text-sm text-gray-500">{formation.nombre_modules || 0} modules • {formation.nombre_chapitres_total || 0} chapitres</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(formation.status)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {formatCurrency(formation.prix)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {formation.nombre_inscrits || 0}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {formatCurrency(formation.revenus_totaux || 0)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="text-sm text-gray-900 mr-2">{formation.taux_completion || 0}%</div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${formation.taux_completion || 0}%`,
                        backgroundColor: colors.success
                      }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(formation.date_creation).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === formation.id ? null : formation.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showDropdown === formation.id && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[160px]">
                      <button
                        onClick={() => onAction('edit', formation.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Edit3 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => onAction('preview', formation.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                        Aperçu
                      </button>
                      <button
                        onClick={() => onAction('duplicate', formation.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                        Dupliquer
                      </button>
                      {formation.status === 'draft' && (
                        <button
                          onClick={() => onAction('publish', formation.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-green-600"
                        >
                          <Play className="w-4 h-4" />
                          Publier
                        </button>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={() => onAction('delete', formation.id)}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Wrapper avec Suspense pour gérer les searchParams
const FormationDashboardPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <FormationDashboard />
    </Suspense>
  );
};

export default FormationDashboardPage;