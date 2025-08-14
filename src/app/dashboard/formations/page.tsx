'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Users, Clock, Award, TrendingUp, Eye, Edit, Archive, Trash, ChevronRight, Calendar, BookOpen, DollarSign, BarChart, Star, AlertCircle, GraduationCap, PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { Formation, FormationStatus, FormationNiveau } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';

// Composant de carte de statistique
const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
  </div>
);

// Composant de carte de formation
const FormationCard = ({ formation, onEdit, onArchive, onView }: { 
  formation: Formation; 
  onEdit: () => void;
  onArchive: () => void;
  onView: () => void;
}) => {
  const getStatusColor = (status?: FormationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archivee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getNiveauColor = (niveau: FormationNiveau) => {
    switch (niveau) {
      case 'debutant': return 'text-green-600';
      case 'intermediaire': return 'text-yellow-600';
      case 'avance': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
      {/* Image de couverture */}
      <div className="relative h-48 bg-gradient-to-br from-[#7978E2] to-[#42B4B7] rounded-t-xl overflow-hidden">
        {formation.miniature ? (
          <img 
            src={formation.miniature} 
            alt={formation.titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GraduationCap className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        {/* Badge de statut */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formation.statut)}`}>
            {formation.statut === 'active' ? 'Active' : formation.statut === 'archivee' ? 'Archivée' : 'Brouillon'}
          </span>
        </div>

        {/* Actions rapides */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <button
              onClick={onView}
              className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
              title="Voir"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={onArchive}
              className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
              title="Archiver"
            >
              <Archive className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {formation.titre}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {formation.description}
        </p>

        {/* Infos */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-medium ${getNiveauColor(formation.niveau)}`}>
            {formation.niveau === 'debutant' ? 'Débutant' : formation.niveau === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
          </span>
          <span className="text-xl font-bold text-gray-900">
            {formation.prix} €
          </span>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <BookOpen className="w-4 h-4 mr-1.5" />
            {formation.modules.length} modules
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1.5" />
            {formation.duree_estimee}h
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1.5" />
            {formation.nombre_inscrits || 0} inscrits
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="w-4 h-4 mr-1.5 text-yellow-500" />
            {formation.note_moyenne || 0}/5
          </div>
        </div>

        {/* Barre de progression pour les revenus */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Revenus générés</span>
            <span className="font-semibold text-gray-900">
              {((formation.nombre_inscrits || 0) * formation.prix).toLocaleString()} €
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#F22E77] to-[#7978E2] h-2 rounded-full"
              style={{ width: `${Math.min(((formation.nombre_inscrits || 0) * 100) / 200, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export default function FormationDashboard() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | FormationStatus>('all');
  const [filterNiveau, setFilterNiveau] = useState<'all' | FormationNiveau>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Charger les formations
  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    setLoading(true);
    try {
      const data = await formationsAPI.getAll();
      setFormations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les formations
  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || formation.statut === filterStatus;
    const matchesNiveau = filterNiveau === 'all' || formation.niveau === filterNiveau;
    
    return matchesSearch && matchesStatus && matchesNiveau;
  });

  // Calculer les statistiques
  const stats = {
    total: formations.length,
    actives: formations.filter(f => f.statut === 'active').length,
    inscrits: formations.reduce((sum, f) => sum + (f.nombre_inscrits || 0), 0),
    revenus: formations.reduce((sum, f) => sum + ((f.nombre_inscrits || 0) * f.prix), 0)
  };

  const handleEdit = (id: string | number | undefined) => {
    if (id) {
      window.location.href = `/dashboard/formations/${id}/edit`;
    }
  };

  const handleArchive = async (id: string | number | undefined) => {
    if (id && confirm('Êtes-vous sûr de vouloir archiver cette formation ?')) {
      const success = await formationsAPI.archive(id);
      if (success) {
        loadFormations();
      }
    }
  };

  const handleView = (id: string | number | undefined) => {
    if (id) {
      window.location.href = `/dashboard/formations/${id}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Formations</h1>
              <p className="mt-2 text-gray-600">Gérez vos formations et suivez leur performance</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle formation
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total formations"
              value={stats.total}
              icon={GraduationCap}
              color="from-[#7978E2] to-[#42B4B7]"
              trend={12}
            />
            <StatCard
              title="Formations actives"
              value={stats.actives}
              icon={CheckCircle}
              color="from-green-500 to-green-600"
              trend={8}
            />
            <StatCard
              title="Total inscrits"
              value={stats.inscrits}
              icon={Users}
              color="from-[#42B4B7] to-[#7978E2]"
              trend={25}
            />
            <StatCard
              title="Revenus totaux"
              value={`${stats.revenus.toLocaleString()} €`}
              icon={DollarSign}
              color="from-[#F22E77] to-[#7978E2]"
              trend={15}
            />
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2] focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtres
              {(filterStatus !== 'all' || filterNiveau !== 'all') && (
                <span className="ml-2 px-2 py-0.5 bg-[#7978E2] text-white text-xs rounded-full">
                  {[filterStatus !== 'all', filterNiveau !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filtres expandables */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="brouillon">Brouillon</option>
                    <option value="active">Active</option>
                    <option value="archivee">Archivée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                  <select
                    value={filterNiveau}
                    onChange={(e) => setFilterNiveau(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                  >
                    <option value="all">Tous les niveaux</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des formations */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7978E2]"></div>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' || filterNiveau !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre première formation'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterNiveau === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une formation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                onEdit={() => handleEdit(formation.id)}
                onArchive={() => handleArchive(formation.id)}
                onView={() => handleView(formation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de création (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Nouvelle formation</h2>
            <p className="text-gray-600 mb-6">
              La création de formation sera disponible prochainement.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}