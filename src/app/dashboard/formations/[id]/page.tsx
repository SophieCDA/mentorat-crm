// src/app/dashboard/formations/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Edit, Archive, Trash2, Users, Clock, Star, BookOpen, 
  DollarSign, Calendar, Award, TrendingUp, ChevronRight, Play,
  Download, FileText, CheckCircle, Lock, Eye, BarChart, 
  AlertCircle, Loader2, MoreVertical, Share2, Settings
} from 'lucide-react';
import { Formation } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apercu' | 'contenu' | 'inscrits' | 'statistiques'>('apercu');
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  useEffect(() => {
    if (params.id) {
      loadFormation(params.id as string);
    }
  }, [params.id]);

  const loadFormation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await formationsAPI.getById(id);
      
      if (!data) {
        setError('Formation introuvable');
        return;
      }
      
      setFormation(data);
    } catch (err) {
      console.error('Erreur lors du chargement de la formation:', err);
      setError('Erreur lors du chargement de la formation');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!formation?.id) return;
    
    if (confirm('Êtes-vous sûr de vouloir archiver cette formation ?')) {
      const success = await formationsAPI.archive(formation.id);
      if (success) {
        router.push('/dashboard/formations');
      }
    }
  };

  const handleDelete = async () => {
    if (!formation?.id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
      const success = await formationsAPI.delete(formation.id);
      if (success) {
        router.push('/dashboard/formations');
      }
    }
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archivee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getNiveauLabel = (niveau: string) => {
    switch (niveau) {
      case 'debutant': return 'Débutant';
      case 'intermediaire': return 'Intermédiaire';
      case 'avance': return 'Avancé';
      default: return niveau;
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7978E2] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Formation introuvable'}</p>
          <button
            onClick={() => router.push('/dashboard/formations')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux formations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/dashboard/formations')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux formations
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/dashboard/formations/${formation.id}/preview`)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#42B4B7] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vue étudiant
              </button>
              <button
                onClick={() => router.push(`/dashboard/formations/${formation.id}/edit`)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={handleArchive}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archiver
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Informations principales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{formation.titre}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formation.statut)}`}>
                    {formation.statut === 'active' ? 'Active' : formation.statut === 'archivee' ? 'Archivée' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-gray-600 text-lg mb-4">{formation.description}</p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-500">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>{formation.modules.length} modules</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{formation.duree_estimee} heures</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{formation.nombre_inscrits || 0} inscrits</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    <span>{formation.note_moyenne || 0}/5</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Award className="w-5 h-5 mr-2" />
                    <span>{getNiveauLabel(formation.niveau)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-6">
                <p className="text-3xl font-bold text-gray-900">{formation.prix} €</p>
                <p className="text-sm text-gray-500 mt-1">Prix de la formation</p>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+15%</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {((formation.nombre_inscrits || 0) * formation.prix).toLocaleString()} €
              </p>
              <p className="text-sm text-gray-500">Revenus totaux</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">+8</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formation.nombre_inscrits || 0}</p>
              <p className="text-sm text-gray-500">Inscrits actifs</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-sm text-gray-500">Taux de complétion</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formation.note_moyenne || 0}/5</p>
              <p className="text-sm text-gray-500">Note moyenne</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'apercu', label: 'Aperçu', icon: Eye },
                { id: 'contenu', label: 'Contenu', icon: BookOpen },
                { id: 'inscrits', label: 'Inscrits', icon: Users },
                { id: 'statistiques', label: 'Statistiques', icon: BarChart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#7978E2] text-[#7978E2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Tab Aperçu */}
            {activeTab === 'apercu' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Aperçu de la formation</h2>
                <div className="prose max-w-none text-gray-600">
                  <p>{formation.description}</p>
                  <h3 className="text-lg font-semibold mt-6 mb-3">Objectifs pédagogiques</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maîtriser les concepts fondamentaux</li>
                    <li>Appliquer les connaissances dans des cas pratiques</li>
                    <li>Développer une expertise approfondie</li>
                  </ul>
                  <h3 className="text-lg font-semibold mt-6 mb-3">Prérequis</h3>
                  <p>Aucun prérequis spécifique n'est nécessaire pour cette formation.</p>
                </div>
              </div>
            )}

            {/* Tab Contenu */}
            {activeTab === 'contenu' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Structure de la formation</h2>
                <div className="space-y-4">
                  {formation.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(moduleIndex)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <ChevronRight 
                            className={`w-5 h-5 mr-3 text-gray-400 transition-transform ${
                              expandedModules.includes(moduleIndex) ? 'rotate-90' : ''
                            }`} 
                          />
                          <span className="font-medium">Module {module.ordre} : {module.titre}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {module.chapitres.length} chapitres • {module.duree_estimee || 0}h
                        </span>
                      </button>
                      
                      {expandedModules.includes(moduleIndex) && (
                        <div className="px-4 py-3 space-y-2">
                          {module.description && (
                            <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                          )}
                          {module.chapitres.map((chapitre) => (
                            <div key={chapitre.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-3" />
                                <span className="text-sm">{chapitre.titre}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {chapitre.contenu.length} blocs
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Inscrits */}
            {activeTab === 'inscrits' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Liste des inscrits</h2>
                <p className="text-gray-600">
                  {formation.nombre_inscrits || 0} personnes sont inscrites à cette formation.
                </p>
                {/* Ici vous pouvez ajouter une table avec la liste des inscrits */}
              </div>
            )}

            {/* Tab Statistiques */}
            {activeTab === 'statistiques' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Statistiques détaillées</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taux de complétion moyen</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Temps moyen de complétion</span>
                        <span className="font-medium">12.5h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Score moyen aux quiz</span>
                        <span className="font-medium">82%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Engagement</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Connexions moyennes/semaine</span>
                        <span className="font-medium">3.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Durée moyenne/session</span>
                        <span className="font-medium">45 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taux d'abandon</span>
                        <span className="font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}