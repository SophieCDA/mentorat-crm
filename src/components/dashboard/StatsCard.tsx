// components/dashboard/StatsCard.tsx
'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: 'euro' | 'transaction' | 'users' | 'chart';
  color: 'pink' | 'turquoise' | 'purple';
}

export default function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'euro':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'transaction':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'pink':
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
          icon: 'text-crm-pink',
          iconBg: 'bg-gradient-to-br from-crm-pink/10 to-crm-pink/20',
        };
      case 'turquoise':
        return {
          bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
          icon: 'text-crm-turquoise',
          iconBg: 'bg-gradient-to-br from-crm-turquoise/10 to-crm-turquoise/20',
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
          icon: 'text-crm-purple',
          iconBg: 'bg-gradient-to-br from-crm-purple/10 to-crm-purple/20',
        };
    }
  };

  const colors = getColorClasses();
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          
          {/* Change indicator */}
          <div className="flex items-center space-x-1">
            <span className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-gray-500">vs mois dernier</span>
          </div>
        </div>
        
        {/* Icon */}
        <div className={`p-3 rounded-xl ${colors.iconBg}`}>
          <div className={colors.icon}>
            {getIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}