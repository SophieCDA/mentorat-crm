// components/formations/FormationManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  Copy, 
  Trash2, 
  Play, 
  Users, 
  Clock, 
  DollarSign,
  BookOpen,
  Settings,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// Types
interface Formation {
  id: number;
  titre: string;
  description: string;
  prix: number;
  duree_heures: number;
  status: 'draft' | 'published' | 'archived';
  image_couverture: string;
  couleur_theme: string;
  date_creation: string;
  date_modification: string;
  nombre_inscrits: number;
  duree_totale_minutes: number;
  nombre_chapitres_total: number;
  modules: any[];
}

interface FormationStats {
  formations: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  inscriptions: {
    total: number;
  };
}

const FormationManager: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [stats, setStats] = useState<FormationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Couleurs de la charte graphique
  const colors = {
    primary: '#F22E77',
    secondary: '#42B4B7', 
    accent: '#7978E2',
    white: '#FFFFFF'
  };

  useEffect(() => {
    loadFormations();
    loadStats();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/builder/formations');
      const data = await response.json();
      
      if (response.ok) {
        setFormations(data.formations || []);
      } else {
        console.error('Erreur lors du chargement des formations:', data.message);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/builder/formations/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const createFormation = async () => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/builder/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: 'Nouvelle Formation',
          description: 'Description de votre formation...',
          prix: 0,
          couleur_theme: colors.accent,
          modules: [
            {
              titre: 'Module 1: Introduction',
              description: 'Module d\'introduction',
              ordre: 0,
              chapitres: [
                {
                  titre: 'Bienvenue',
                  type: 'text',
                  ordre: 0,
                  contenu: [
                    {
                      id: 1,
                      type: 'text',
                      data: {
                        titre: 'Bienvenue dans votre formation',
                        content: '<p>Commencez à créer votre contenu ici...</p>'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Rediriger vers le builder
        window.open(`/formations/builder/${data.formation.id}`, '_blank');
        loadFormations(); // Recharger la liste
      } else {
        alert('Erreur lors de la création: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la formation');
    } finally {
      setIsCreating(false);
    }
  };

  const duplicateFormation = async (formationId: number) => {
    try {
      const response = await fetch(`/api/builder/formations/${formationId}/duplicate`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        loadFormations();
        alert('Formation dupliquée avec succès !');
      } else {
        alert('Erreur lors de la duplication: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la duplication');
    }
  };

  const publishFormation = async (formationId: number) => {
    try {
      const response = await fetch(`/api/builder/formations/${formationId}/publish`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        loadFormations();
        alert('Formation publiée avec succès !');
      } else {
        alert('Erreur lors de la publication: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication');
    }
  };

  const deleteFormation = async (formationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/builder/formations/${formationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        loadFormations();
        alert('Formation supprimée avec succès !');
      } else {
        alert('Erreur lors de la suppression: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || formation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: '#6B7280' },
      published: { label: 'Publié', color: colors.secondary },
      archived: { label: 'Archivé', color: '#9CA3AF' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        style={{
          backgroundColor: config.color,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.accent }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Formations</h1>
            <p className="text-gray-600 mt-1">Créez et gérez vos formations avec notre builder NO-CODE</p>
          </div>
          <button
            onClick={createFormation}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:transform hover:-translate-y-1 disabled:opacity-50"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              boxShadow: '0 4px 15px rgba(242, 46, 119, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Création...' : 'Nouvelle Formation'}
          </button>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Formations</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.formations.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Play className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Publiées</p>
                  <p className="text-2xl font-bold text-green-900">{stats.formations.published}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <Edit className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Brouillons</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.formations.draft}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Inscriptions</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.inscriptions.total}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ outlineColor: colors.accent }}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outlineColor: colors.accent }}
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="published">Publiées</option>
              <option value="archived">Archivées</option>
            </select>

            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Liste des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.map((formation) => (
          <div
            key={formation.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1"
          >
            {/* Image de couverture */}
            <div
              className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 relative"
              style={{
                background: formation.image_couverture 
                  ? `url(${formation.image_couverture}) center/cover`
                  : `linear-gradient(135deg, ${formation.couleur_theme || colors.accent}, ${colors.secondary})`
              }}
            >
              <div className="absolute top-3 left-3">
                {getStatusBadge(formation.status)}
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => window.open(`/formations/builder/${formation.id}`, '_blank')}
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => window.open(`/formations/preview/${formation.id}`, '_blank')}
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Aperçu"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
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

              {/* Métriques */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(formation.duree_totale_minutes)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{formation.nombre_chapitres_total} chapitres</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{formation.nombre_inscrits} inscrits</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{formation.prix}€</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateFormation(formation.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  {formation.status === 'draft' && (
                    <button
                      onClick={() => publishFormation(formation.id)}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      style={{ color: colors.secondary }}
                      title="Publier"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteFormation(formation.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => window.open(`/formations/builder/${formation.id}`, '_blank')}
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
        ))}
      </div>

      {/* Message si aucune formation */}
      {filteredFormations.length === 0 && (
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:transform hover:-translate-y-1 disabled:opacity-50"
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
  );
};

export default FormationManager;