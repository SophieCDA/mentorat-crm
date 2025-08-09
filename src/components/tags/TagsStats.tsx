// components/tags/TagsStats.tsx - Version avec mise à jour automatique
'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TagStats } from '@/types/tag.types';
import { apiClient } from '@/lib/api/client';

// Interface pour exposer les méthodes du composant
export interface TagsStatsRef {
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

interface TagsStatsProps {
  onStatsLoaded?: (stats: TagStats) => void;
}

const TagsStats = forwardRef<TagsStatsRef, TagsStatsProps>(({ onStatsLoaded }, ref) => {
  const [stats, setStats] = useState<TagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exposer les méthodes refresh via la ref
  useImperativeHandle(ref, () => ({
    refresh: loadStats,
    forceRefresh: handleRefreshStats
  }));

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<TagStats>('/api/tags/stats');
      console.log('Tag stats response:', response);
      setStats(response);

      // Notifier le parent que les stats ont été chargées
      if (onStatsLoaded) {
        onStatsLoaded(response);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Forcer le recalcul côté serveur
      const response = await apiClient.post<TagStats>('/api/tags/stats/refresh');
      console.log('Tag stats refreshed:', response);
      setStats(response);

      // Notifier le parent
      if (onStatsLoaded) {
        onStatsLoaded(response);
      }

      // Notification discrète au lieu d'alert
      console.log('Statistiques mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
      setError('Erreur lors de la mise à jour des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    isLoading = false
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    isLoading?: boolean;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-16 h-6 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              value
            )}
          </p>
          {subtitle && !isLoading && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={loadStats}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Statistiques des tags</h2>
          {/* Indicateur de dernière mise à jour */}
          {stats && !loading && (
              <p className="text-xs text-gray-500">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </p>
          )}
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total tags"
          value={stats?.total_tags ?? 0}
          color="from-blue-400/20 to-blue-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />

        <StatCard
          title="Tags utilisés"
          value={stats?.tags_utilises ?? 0}
          subtitle={stats ? `${stats.taux_utilisation.toFixed(1)}% d'utilisation` : undefined}
          color="from-green-400/20 to-green-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Nouveaux ce mois"
          value={`+${stats?.nouveaux_mois ?? 0}`}
          color="from-purple-400/20 to-purple-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />

        <StatCard
          title="Tag populaire"
          value={stats?.tag_populaire ?? 'Aucun'}
          subtitle={stats?.tag_populaire_count ? `${stats.tag_populaire_count} contacts` : undefined}
          color="from-yellow-400/20 to-yellow-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />

        <StatCard
          title="Moyenne contacts"
          value={stats?.moyenne_contacts?.toFixed(1) ?? '0.0'}
          subtitle="par tag utilisé"
          color="from-indigo-400/20 to-indigo-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>


    </div>
  );
});

TagsStats.displayName = 'TagsStats';

export default TagsStats;