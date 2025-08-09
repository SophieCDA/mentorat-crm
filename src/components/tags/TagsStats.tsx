// components/tags/TagsStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface TagStats {
  total_tags: number;
  nouveaux_mois: number;
  taux_croissance: number;
  tags_populaires: Array<{
    id: number;
    nom: string;
    couleur: string;
    nombre_contacts: number;
  }>;
  repartition_couleurs: { [couleur: string]: number };
  moyenne_tags_par_contact: number;
  tags_inutilises: number;
}

export default function TagsStats() {
  const [stats, setStats] = useState<TagStats>({
    total_tags: 0,
    nouveaux_mois: 0,
    taux_croissance: 0,
    tags_populaires: [],
    repartition_couleurs: {},
    moyenne_tags_par_contact: 0,
    tags_inutilises: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<TagStats>('/api/tags/stats');
      setStats(response);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques des tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: React.ReactNode; 
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? (
              <span className="inline-block w-20 h-6 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              value
            )}
          </p>
          {change !== undefined && !loading && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Total tags"
        value={stats.total_tags.toLocaleString('fr-FR')}
        change={stats.taux_croissance}
        color="from-purple-400/20 to-purple-600/20"
        icon={
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        }
      />

      <StatCard
        title="Nouveaux ce mois"
        value={`+${stats.nouveaux_mois}`}
        color="from-green-400/20 to-green-600/20"
        icon={
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <StatCard
        title="Moyenne par contact"
        value={stats.moyenne_tags_par_contact.toFixed(1)}
        color="from-blue-400/20 to-blue-600/20"
        icon={
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <StatCard
        title="Tags inutilisés"
        value={stats.tags_inutilises}
        color="from-yellow-400/20 to-yellow-600/20"
        icon={
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />

      <StatCard
        title="Couleurs distinctes"
        value={Object.keys(stats.repartition_couleurs).length}
        color="from-pink-400/20 to-pink-600/20"
        icon={
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        }
      />

      {/* Section des tags populaires - prend toute la largeur */}
      <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags les plus populaires</h3>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats.tags_populaires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.tags_populaires.map((tag, index) => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.couleur }}
                  />
                  <span className="font-medium text-gray-900">{tag.nom}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{tag.nombre_contacts}</span>
                  <p className="text-xs text-gray-500">contact{tag.nombre_contacts > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun tag populaire trouvé</p>
        )}
      </div>
    </div>
  );
}