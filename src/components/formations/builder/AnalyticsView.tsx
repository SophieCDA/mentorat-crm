import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Target, Star, Eye, Clock, Award, BookOpen,
  HelpCircle, Play, Pause, Download, RefreshCw, Calendar,
  BarChart3, PieChart, Activity, Zap, Trophy, Heart, 
  MessageCircle, Share2, ThumbsUp, AlertTriangle, CheckCircle2,
  ArrowUp, ArrowDown, Minus, Filter, Search, MoreHorizontal,
  ExternalLink, MapPin, Smartphone, Monitor, Tablet, Globe
} from 'lucide-react';
import { Formation } from '@/types/formation.types';

interface AnalyticsViewProps {
  formation: Formation;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ formation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Données simulées d'analytics (à remplacer par des vraies données API)
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 15247,
      totalEnrollments: 1089,
      completionRate: 78.5,
      averageRating: 4.6,
      totalRevenue: formation.prix * (formation.nombre_inscrits || 0),
      monthlyGrowth: 23.4,
      engagementRate: 85.2,
      certificatesIssued: 856
    },
    trends: {
      viewsData: generateTrendData(30),
      enrollmentsData: generateTrendData(30),
      completionData: generateTrendData(30),
      revenueData: generateTrendData(30)
    },
    demographics: {
      countries: [
        { name: 'France', value: 45, color: '#F22E77' },
        { name: 'Canada', value: 22, color: '#42B4B7' },
        { name: 'Belgique', value: 15, color: '#7978E2' },
        { name: 'Suisse', value: 12, color: '#10B981' },
        { name: 'Autres', value: 6, color: '#6B7280' }
      ],
      devices: [
        { name: 'Desktop', value: 52, icon: Monitor },
        { name: 'Mobile', value: 35, icon: Smartphone },
        { name: 'Tablet', value: 13, icon: Tablet }
      ],
      ageGroups: [
        { name: '18-25', value: 28 },
        { name: '26-35', value: 42 },
        { name: '36-45', value: 20 },
        { name: '46-55', value: 8 },
        { name: '55+', value: 2 }
      ]
    },
    modulePerformance: formation.modules.map((module, index) => ({
      id: module.id,
      title: module.titre,
      views: Math.floor(Math.random() * 1000) + 500,
      completions: Math.floor(Math.random() * 800) + 300,
      avgTime: Math.floor(Math.random() * 900) + 300,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      dropoffRate: Math.floor(Math.random() * 20) + 5,
      engagementScore: Math.floor(Math.random() * 30) + 70
    })),
    recentActivity: [
      { type: 'enrollment', user: 'Marie Dubois', action: 'S\'est inscrite', time: '2 heures', avatar: '👩‍💼' },
      { type: 'completion', user: 'Jean Martin', action: 'A terminé le module 2', time: '4 heures', avatar: '👨‍💻' },
      { type: 'rating', user: 'Sophie Chen', action: 'A donné 5⭐', time: '6 heures', avatar: '👩‍🎓' },
      { type: 'certificate', user: 'Pierre Moreau', action: 'A obtenu son certificat', time: '8 heures', avatar: '👨‍🔬' },
      { type: 'quiz', user: 'Lisa Wang', action: 'A réussi le quiz final', time: '1 jour', avatar: '👩‍🏫' },
      { type: 'review', user: 'Alex Johnson', action: 'A laissé un commentaire', time: '1 jour', avatar: '👨‍🎨' }
    ]
  });

  // Fonction pour générer des données de tendance
  function generateTrendData(days: number) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 20
    }));
  }

  // Simulation du chargement des données
  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Ici vous feriez l'appel à votre API
    setIsLoading(false);
  };

  useEffect(() => {
    // Charger les données analytics au montage
    refreshData();
  }, [selectedPeriod]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* En-tête Analytics */}
      <AnalyticsHeader 
        formation={formation}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        onRefresh={refreshData}
        isLoading={isLoading}
      />

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vues totales"
          value={analytics.overview.totalViews.toLocaleString()}
          change={+12.5}
          icon={Eye}
          color="blue"
          subtitle="Sessions uniques"
        />
        <MetricCard
          title="Inscriptions"
          value={analytics.overview.totalEnrollments.toLocaleString()}
          change={+8.2}
          icon={Users}
          color="green"
          subtitle={`Taux: ${(analytics.overview.totalEnrollments / analytics.overview.totalViews * 100).toFixed(1)}%`}
        />
        <MetricCard
          title="Taux de completion"
          value={`${analytics.overview.completionRate}%`}
          change={+5.3}
          icon={Target}
          color="purple"
          subtitle="Moyenne industrie: 65%"
        />
        <MetricCard
          title="Note moyenne"
          value={analytics.overview.averageRating.toFixed(1)}
          change={+0.2}
          icon={Star}
          color="yellow"
          subtitle="Sur 5 étoiles"
          maxValue={5}
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenus générés"
          value={`${analytics.overview.totalRevenue.toLocaleString()}€`}
          change={analytics.overview.monthlyGrowth}
          icon={TrendingUp}
          color="emerald"
          subtitle="Ce mois"
        />
        <MetricCard
          title="Engagement"
          value={`${analytics.overview.engagementRate}%`}
          change={+3.1}
          icon={Heart}
          color="pink"
          subtitle="Temps passé / module"
        />
        <MetricCard
          title="Certificats délivrés"
          value={analytics.overview.certificatesIssued.toLocaleString()}
          change={+15.7}
          icon={Award}
          color="amber"
          subtitle={`${Math.round(analytics.overview.certificatesIssued / analytics.overview.totalEnrollments * 100)}% des inscrits`}
        />
        <MetricCard
          title="Score satisfaction"
          value="9.2/10"
          change={+0.5}
          icon={Trophy}
          color="indigo"
          subtitle="NPS: +67"
        />
      </div>

      {/* Graphiques de tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Évolution des inscriptions"
          data={analytics.trends.enrollmentsData}
          color="#42B4B7"
          subtitle="Nouvelles inscriptions par jour"
        />
        <TrendChart
          title="Taux de completion"
          data={analytics.trends.completionData}
          color="#7978E2"
          subtitle="Pourcentage de completion quotidien"
        />
      </div>

      {/* Performance des modules */}
      <ModulePerformanceSection modules={analytics.modulePerformance} />

      {/* Données démographiques et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemographicsSection demographics={analytics.demographics} />
        <RecentActivitySection activities={analytics.recentActivity} />
      </div>

      {/* Insights et recommandations */}
      <InsightsSection formation={formation} analytics={analytics.overview} />
    </div>
  );
};

// Composant en-tête Analytics
interface AnalyticsHeaderProps {
  formation: Formation;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  formation,
  selectedPeriod,
  setSelectedPeriod,
  onRefresh,
  isLoading
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics Premium
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tableau de bord complet pour "{formation.titre}"
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Sélecteur de période */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">3 derniers mois</option>
          <option value="1y">Cette année</option>
        </select>

        {/* Boutons d'action */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>
    </div>

    {/* Indicateurs rapides */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <QuickStat label="Aujourd'hui" value="47 vues" trend={+5} />
      <QuickStat label="Cette semaine" value="312 vues" trend={+12} />
      <QuickStat label="Ce mois" value="1,247 vues" trend={+8} />
      <QuickStat label="Revenus du mois" value="2,890€" trend={+23} />
    </div>
  </div>
);

// Composant carte de métrique
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className: string }>;
  color: string;
  subtitle?: string;
  maxValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, change, icon: Icon, color, subtitle, maxValue 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <ChangeIndicator change={change} />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {maxValue && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${color === 'yellow' ? 'bg-yellow-500' : 'bg-current'}`}
              style={{ width: `${(parseFloat(value) / maxValue) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Indicateur de changement
const ChangeIndicator: React.FC<{ change: number }> = ({ change }) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${
      isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'
    }`}>
      {!isNeutral && (
        isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
      )}
      {isNeutral ? <Minus className="w-4 h-4" /> : `${isPositive ? '+' : ''}${change.toFixed(1)}%`}
    </div>
  );
};

// Statistique rapide
const QuickStat: React.FC<{ label: string; value: string; trend: number }> = ({ label, value, trend }) => (
  <div className="text-center">
    <div className="text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    <ChangeIndicator change={trend} />
  </div>
);

// Graphique de tendance simplifié
interface TrendChartProps {
  title: string;
  data: Array<{ date: string; value: number }>;
  color: string;
  subtitle: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ title, data, color, subtitle }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data[data.length - 1]?.value || 0}
          </div>
          <div className="text-sm text-gray-500">Dernière valeur</div>
        </div>
      </div>
      
      {/* Graphique SVG simplifié */}
      <div className="h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
          
          {/* Ligne de tendance */}
          <path
            d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 300},${100 - ((d.value - minValue) / (maxValue - minValue)) * 80}`).join(' L ')}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          
          {/* Zone remplie */}
          <path
            d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 300},${100 - ((d.value - minValue) / (maxValue - minValue)) * 80}`).join(' L ')} L 300,100 L 0,100 Z`}
            fill={`url(#gradient-${color})`}
          />
        </svg>
      </div>
    </div>
  );
};

// Section performance des modules
const ModulePerformanceSection: React.FC<{ modules: any[] }> = ({ modules }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance par module</h3>
      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir détails</button>
    </div>
    
    <div className="space-y-4">
      {modules.map((module, index) => (
        <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{module.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{module.views} vues</span>
                <span>{module.completions} complétions</span>
                <span>⭐ {module.rating}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {module.engagementScore}%
            </div>
            <div className="text-sm text-gray-500">Engagement</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Section démographiques
const DemographicsSection: React.FC<{ demographics: any }> = ({ demographics }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Données démographiques</h3>
    
    <div className="space-y-6">
      {/* Pays */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Répartition géographique
        </h4>
        <div className="space-y-2">
          {demographics.countries.map((country: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{country.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ backgroundColor: country.color, width: `${country.value}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{country.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appareils */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Appareils utilisés
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {demographics.devices.map((device: any, index: number) => (
            <div key={index} className="text-center">
              <device.icon className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{device.value}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{device.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Section activité récente
const RecentActivitySection: React.FC<{ activities: any[] }> = ({ activities }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activité récente</h3>
      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tout</button>
    </div>
    
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
            {activity.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{activity.user}</span> {activity.action}
            </p>
            <p className="text-xs text-gray-500">Il y a {activity.time}</p>
          </div>
          <ActivityTypeIcon type={activity.type} />
        </div>
      ))}
    </div>
  </div>
);

// Icône de type d'activité
const ActivityTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons = {
    enrollment: <Users className="w-4 h-4 text-blue-500" />,
    completion: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    rating: <Star className="w-4 h-4 text-yellow-500" />,
    certificate: <Award className="w-4 h-4 text-purple-500" />,
    quiz: <HelpCircle className="w-4 h-4 text-indigo-500" />,
    review: <MessageCircle className="w-4 h-4 text-pink-500" />
  };
  
  return icons[type as keyof typeof icons] || <Activity className="w-4 h-4 text-gray-500" />;
};

// Section insights et recommandations
const InsightsSection: React.FC<{ formation: Formation; analytics: any }> = ({ formation, analytics }) => {
  const insights = [
    {
      type: 'success',
      title: 'Excellent taux de completion',
      description: `Votre formation a un taux de completion de ${analytics.completionRate}%, bien au-dessus de la moyenne de 65%.`,
      action: 'Maintenir la qualité',
      icon: Trophy
    },
    {
      type: 'warning',
      title: 'Améliorer l\'engagement mobile',
      description: 'Les utilisateurs mobiles ont un taux de completion 15% plus faible.',
      action: 'Optimiser pour mobile',
      icon: Smartphone
    },
    {
      type: 'info',
      title: 'Opportunité de croissance',
      description: 'Le marché canadien montre un fort potentiel avec +45% de croissance.',
      action: 'Cibler le Canada',
      icon: TrendingUp
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Insights & Recommandations
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            insight.type === 'success' ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400' :
            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400' :
            'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400'
          }`}>
            <div className="flex items-start gap-3">
              <insight.icon className={`w-5 h-5 mt-0.5 ${
                insight.type === 'success' ? 'text-green-600' :
                insight.type === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                <button className={`text-xs font-medium mt-2 ${
                  insight.type === 'success' ? 'text-green-700 hover:text-green-800' :
                  insight.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                  'text-blue-700 hover:text-blue-800'
                }`}>
                  {insight.action} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};