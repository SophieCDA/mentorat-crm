// components/contacts/ContactsStats.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContactStats } from '@/types/contact.types';
import { apiClient } from '@/lib/api/client';

interface ContactsStatsProps {
  refreshTrigger?: number; // Prop pour déclencher un refresh externe
  onStatsLoaded?: (stats: ContactStats) => void; // Callback pour exposer les stats
}

export default function ContactsStats({ refreshTrigger, onStatsLoaded }: ContactsStatsProps = {}) {
  const [stats, setStats] = useState<ContactStats>({
    total_contacts: 0,
    nouveaux_mois: 0,
    taux_croissance: 0,
    contacts_actifs: 0,
    valeur_moyenne: 0,
    total_revenus: 0,
    taux_croissance_revenus: 0,
  });

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadStats = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const url = forceRefresh ? '/api/contacts/stats?force_refresh=true' : '/api/contacts/stats';
      const response = await apiClient.get<ContactStats>(url);
      setStats(response);
      setLastUpdate(new Date());
      
      // Appeler le callback si fourni
      if (onStatsLoaded) {
        onStatsLoaded(response);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Garder les anciennes stats en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, [onStatsLoaded]);

  // Effet pour le chargement initial
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Effet pour le refresh déclenché depuis l'extérieur
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadStats(true); // Force refresh quand triggered
    }
  }, [refreshTrigger, loadStats]);

  // Auto-refresh toutes les 5 minutes si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStats();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, loadStats]);

  const handleForceRefresh = () => {
    loadStats(true);
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color,
    isLoading = false
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
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
              <span className="inline-block w-20 h-6 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              value
            )}
          </p>
          {change !== undefined && !isLoading && (
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
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Statistiques des contacts</h2>
          {lastUpdate && (
            <p className="text-xs text-gray-500">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
      </div>

      {/* Grille des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total contacts"
          value={stats.total_contacts.toLocaleString('fr-FR')}
          change={stats.taux_croissance}
          color="from-blue-400/20 to-blue-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <StatCard
          title="Nouveaux ce mois"
          value={`+${stats.nouveaux_mois}`}
          color="from-green-400/20 to-green-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />

        <StatCard
          title="Contacts actifs"
          value={stats.contacts_actifs.toLocaleString('fr-FR')}
          color="from-purple-400/20 to-purple-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatCard
          title="Valeur moyenne"
          value={`${stats.valeur_moyenne.toLocaleString('fr-FR')} €`}
          color="from-yellow-400/20 to-yellow-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Taux conversion"
          value={
            stats.total_contacts > 0
              ? `${((stats.contacts_actifs / stats.total_contacts) * 100).toFixed(1)}%`
              : "0%"
          }
          color="from-pink-400/20 to-pink-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <StatCard
          title="Revenus totaux"
          value={`${(stats.total_revenus / 1000).toFixed(0)}k €`}
          change={stats.taux_croissance_revenus}
          color="from-emerald-400/20 to-emerald-600/20"
          isLoading={loading}
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Indicateur de statut */}
      {loading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-#7978E2 mr-2"></div>
            Mise à jour des statistiques...
          </div>
        </div>
      )}
    </div>
  );
}