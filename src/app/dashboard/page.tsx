// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';

// Types pour les statistiques
interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  transactionsGrowth: number;
  activeContacts: number;
  contactsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 45231.89,
    revenueGrowth: 12.5,
    totalTransactions: 2350,
    transactionsGrowth: 8.2,
    activeContacts: 1280,
    contactsGrowth: 15.3,
    conversionRate: 3.48,
    conversionGrowth: -2.4,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simuler le chargement des données
      // À remplacer par un appel API réel
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <QuickActions />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Revenus totaux"
              value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`}
              change={stats.revenueGrowth}
              icon="euro"
              color="purple"
            />
            <StatsCard
              title="Transactions"
              value={stats.totalTransactions.toLocaleString('fr-FR')}
              change={stats.transactionsGrowth}
              icon="transaction"
              color="turquoise"
            />
            <StatsCard
              title="Contacts actifs"
              value={stats.activeContacts.toLocaleString('fr-FR')}
              change={stats.contactsGrowth}
              icon="users"
              color="pink"
            />
            <StatsCard
              title="Taux de conversion"
              value={`${stats.conversionRate}%`}
              change={stats.conversionGrowth}
              icon="chart"
              color="purple"
            />
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>

            {/* Recent Activity - Takes 1 column */}
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>
          </div>
        </>
      )}
    </div>
  );
}