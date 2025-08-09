// components/dashboard/RecentActivity.tsx
'use client';

interface Activity {
  id: string;
  type: 'contact' | 'transaction' | 'tag' | 'campaign';
  title: string;
  description: string;
  time: string;
  amount?: number;
}

export default function RecentActivity() {
  // Données simulées - À remplacer par des données réelles
  const activities: Activity[] = [
    {
      id: '1',
      type: 'transaction',
      title: 'Nouvelle transaction',
      description: 'Jean Dupont',
      time: 'Il y a 5 min',
      amount: 1250
    },
    {
      id: '2',
      type: 'contact',
      title: 'Nouveau contact',
      description: 'Marie Martin',
      time: 'Il y a 12 min'
    },
    {
      id: '3',
      type: 'tag',
      title: 'Tag ajouté',
      description: 'VIP sur 5 contacts',
      time: 'Il y a 25 min'
    },
    {
      id: '4',
      type: 'campaign',
      title: 'Campagne lancée',
      description: 'Newsletter Novembre',
      time: 'Il y a 1h'
    },
    {
      id: '5',
      type: 'transaction',
      title: 'Transaction complétée',
      description: 'Sophie Bernard',
      time: 'Il y a 2h',
      amount: 890
    },
    {
      id: '6',
      type: 'contact',
      title: 'Contact modifié',
      description: 'Pierre Durand',
      time: 'Il y a 3h'
    },
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'transaction':
        return (
          <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'contact':
        return (
          <div className="p-2 bg-gradient-to-br from-crm-turquoise to-blue-500 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'tag':
        return (
          <div className="p-2 bg-gradient-to-br from-crm-purple to-indigo-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        );
      case 'campaign':
        return (
          <div className="p-2 bg-gradient-to-br from-crm-pink to-red-500 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
        <a href="/dashboard/activity" className="text-sm text-crm-purple hover:text-crm-pink transition-colors">
          Voir tout
        </a>
      </div>

      {/* Activity list */}
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
            {/* Icon */}
            {getIcon(activity.type)}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {activity.description}
              </p>
            </div>
            
            {/* Time/Amount */}
            <div className="text-right">
              <p className="text-xs text-gray-400">{activity.time}</p>
              {activity.amount && (
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {activity.amount.toLocaleString('fr-FR')} €
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View all button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full py-2 text-sm font-medium text-crm-purple hover:text-crm-pink transition-colors">
          Charger plus d'activités
        </button>
      </div>
    </div>
  );
}