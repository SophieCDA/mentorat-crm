// components/dashboard/RevenueChart.tsx
'use client';

import { useState } from 'react';

interface ChartData {
  month: string;
  revenue: number;
  transactions: number;
}

export default function RevenueChart() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Données simulées - À remplacer par des données réelles
  const data: ChartData[] = [
    { month: 'Jan', revenue: 12500, transactions: 230 },
    { month: 'Fév', revenue: 15200, transactions: 280 },
    { month: 'Mar', revenue: 18900, transactions: 320 },
    { month: 'Avr', revenue: 22400, transactions: 380 },
    { month: 'Mai', revenue: 28600, transactions: 420 },
    { month: 'Juin', revenue: 32100, transactions: 460 },
    { month: 'Juil', revenue: 38500, transactions: 510 },
    { month: 'Août', revenue: 35200, transactions: 480 },
    { month: 'Sep', revenue: 41800, transactions: 550 },
    { month: 'Oct', revenue: 45200, transactions: 590 },
    { month: 'Nov', revenue: 48900, transactions: 620 },
    { month: 'Déc', revenue: 52300, transactions: 680 },
  ];

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Évolution des revenus</h3>
          <p className="text-sm text-gray-500">Revenus et transactions mensuels</p>
        </div>
        
        {/* Period selector */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-white text-crm-purple shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{(maxRevenue / 1000).toFixed(0)}k€</span>
          <span>{(maxRevenue * 0.75 / 1000).toFixed(0)}k€</span>
          <span>{(maxRevenue * 0.5 / 1000).toFixed(0)}k€</span>
          <span>{(maxRevenue * 0.25 / 1000).toFixed(0)}k€</span>
          <span>0€</span>
        </div>

        {/* Chart area */}
        <div className="ml-14 relative h-64">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100"></div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-full flex items-end justify-between gap-2">
            {data.slice(0, period === 'week' ? 7 : period === 'month' ? 12 : 12).map((item, index) => {
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 relative group"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <div className="font-semibold">{item.revenue.toLocaleString('fr-FR')} €</div>
                      <div className="text-gray-300">{item.transactions} transactions</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  
                  {/* Bar */}
                  <div
                    className="relative rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, #7978E2 0%, #42B4B7 100%)`,
                    }}
                  >
                    {/* Animated fill effect */}
                    <div 
                      className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(180deg, #F22E77 0%, #7978E2 100%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
            {data.slice(0, period === 'week' ? 7 : period === 'month' ? 12 : 12).map((item, index) => (
              <div key={index} className="flex-1 text-center">
                {period === 'week' ? item.month.slice(0, 3) : item.month.slice(0, 3)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-8 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-crm-purple to-crm-turquoise"></div>
          <span className="text-sm text-gray-600">Revenus</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-crm-pink to-crm-purple"></div>
          <span className="text-sm text-gray-600">Objectif</span>
        </div>
      </div>
    </div>
  );
}