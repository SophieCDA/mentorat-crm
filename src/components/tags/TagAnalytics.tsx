// components/tags/TagAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface TagAnalytics {
  tag_id: number;
  nom: string;
  utilisation_par_mois: Array<{
    mois: string;
    count: number;
  }>;
  contacts_recents: number;
  tendance: 'up' | 'down' | 'stable';
}

interface TagAnalyticsProps {
  tagId: number;
}

export default function TagAnalytics({ tagId }: TagAnalyticsProps) {
  const [analytics, setAnalytics] = useState<TagAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [tagId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<TagAnalytics>(`/api/tags/${tagId}/analytics`);
      setAnalytics(response);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTendanceIcon = (tendance: string) => {
    switch (tendance) {
      case 'up':
        return (
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium">En hausse</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-red-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="text-sm font-medium">En baisse</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
            </svg>
            <span className="text-sm font-medium">Stable</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Impossible de charger les analytics</p>
      </div>
    );
  }

  const maxCount = Math.max(...analytics.utilisation_par_mois.map(m => m.count));

  return (
    <div className="p-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Nouveaux contacts (30j)</p>
              <p className="text-2xl font-bold text-blue-800">{analytics.contacts_recents}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Tendance</p>
              <div className="mt-2">
                {getTendanceIcon(analytics.tendance)}
              </div>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Utilisation totale</p>
              <p className="text-2xl font-bold text-green-800">
                {analytics.utilisation_par_mois.reduce((total, mois) => total + mois.count, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation par mois</h3>
        
        {analytics.utilisation_par_mois.length > 0 ? (
          <div className="space-y-4">
            {analytics.utilisation_par_mois.map((mois, index) => {
              const width = maxCount > 0 ? (mois.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-20 text-sm text-gray-600 font-medium">
                    {mois.mois}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-gradient-to-r from-crm-pink to-crm-purple h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${width}%` }}
                    >
                      {mois.count > 0 && (
                        <span className="text-white text-xs font-medium">
                          {mois.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600">
                    {mois.count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Aucune donnée d'utilisation disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}