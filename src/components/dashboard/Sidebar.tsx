// components/dashboard/Sidebar.tsx
'use client';

import { JSX, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface MenuItem {
  id: string;
  label: string;
  icon: JSX.Element;
  href: string;
  badge?: number | null;
  badgeColor?: string;
  subItems?: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

interface CountsData {
  contacts: number;
  tags: number;
  transactions: number;
  campaigns: number;
}

export default function Sidebar({ isOpen, onToggle, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [counts, setCounts] = useState<CountsData>({
    contacts: 0,
    tags: 0,
    transactions: 0,
    campaigns: 0
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Charger les compteurs au montage du composant
  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      setLoadingCounts(true);
      
      // Charger les compteurs en parallèle
      const [contactsRes, tagsRes] = await Promise.allSettled([
        apiClient.get<{ total_contacts: number }>('/api/contacts/count'),
        apiClient.get<{ total_tags: number }>('/api/tags/stats').then(res => ({ total_tags: res.total_tags }))
      ]);

      // Traiter les résultats
      const newCounts: CountsData = {
        contacts: contactsRes.status === 'fulfilled' ? contactsRes.value.total_contacts : 0,
        tags: tagsRes.status === 'fulfilled' ? tagsRes.value.total_tags : 0,
        transactions: 0, // À implémenter plus tard
        campaigns: 0     // À implémenter plus tard
      };

      setCounts(newCounts);
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error);
      // En cas d'erreur, on garde les valeurs par défaut (0)
    } finally {
      setLoadingCounts(false);
    }
  };

  // Configuration du menu - Facilement extensible
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'contacts',
      label: 'Contacts',
      href: '/dashboard/contacts',
      badge: counts.contacts > 0 ? counts.contacts : null,
      badgeColor: 'bg-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'tags',
      label: 'Tags',
      href: '/dashboard/tags',
      badge: counts.tags > 0 ? counts.tags : null,
      badgeColor: 'bg-purple-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      href: '/dashboard/transactions',
      badge: counts.transactions > 0 ? counts.transactions : null,
      badgeColor: 'bg-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytiques',
      href: '/dashboard/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      href: '/dashboard/campaigns',
      badge: counts.campaigns > 0 ? counts.campaigns : null,
      badgeColor: 'bg-pink-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Rapports',
      href: '/dashboard/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6h12zm-5-4h.01" />
        </svg>
      ),
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => pathname === href;

  // Fonction pour formater le nombre dans le badge
  const formatBadgeNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Fonction pour recharger les compteurs (peut être appelée par d'autres composants)
  const refreshCounts = () => {
    loadCounts();
  };

  // Exposer la fonction de refresh globalement (optionnel)
  useEffect(() => {
    // Écouter un événement personnalisé pour rafraîchir les compteurs
    const handleRefreshCounts = () => refreshCounts();
    window.addEventListener('refreshSidebarCounts', handleRefreshCounts);
    
    return () => {
      window.removeEventListener('refreshSidebarCounts', handleRefreshCounts);
    };
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-crm-pink to-crm-purple flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          {isOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-crm-pink to-crm-purple bg-clip-text text-transparent">
              CRM
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:block hidden"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-crm-pink to-crm-purple text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className={`${!isActive(item.href) && 'group-hover:text-crm-purple'}`}>
                    {item.icon}
                  </span>
                  {isOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
                
                {/* Badge avec gestion du loading */}
                {isOpen && (
                  <div className="flex items-center">
                    {loadingCounts && item.badge !== undefined ? (
                      // Indicateur de chargement pour les badges
                      <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
                    ) : item.badge !== null && item.badge !== undefined && item.badge > 0 ? (
                      // Badge avec nombre
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium min-w-[20px] text-center ${
                        isActive(item.href) 
                          ? 'bg-white/20 text-white' 
                          : item.badgeColor 
                            ? `${item.badgeColor} text-white`
                            : 'bg-crm-pink text-white'
                      }`}>
                        {formatBadgeNumber(item.badge)}
                      </span>
                    ) : null}
                  </div>
                )}
                
                {/* Badge pour sidebar fermée (tooltip) */}
                {!isOpen && item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute left-12 px-1.5 py-0.5 text-xs rounded-full font-medium ${
                    item.badgeColor ? `${item.badgeColor} text-white` : 'bg-crm-pink text-white'
                  } opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {formatBadgeNumber(item.badge)}
                  </span>
                )}
              </Link>
              
              {/* Sub-items if any */}
              {item.subItems && expandedItems.includes(item.id) && isOpen && (
                <ul className="mt-1 ml-8 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.id}>
                      <Link
                        href={subItem.href}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-crm-purple rounded-lg hover:bg-gray-50"
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bouton de refresh des compteurs (en mode développement) */}
      {process.env.NODE_ENV === 'development' && isOpen && (
        <div className="px-3 py-2 border-t border-gray-100">
          <button
            onClick={refreshCounts}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 px-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
            disabled={loadingCounts}
          >
            <svg className={`w-3 h-3 ${loadingCounts ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser compteurs</span>
          </button>
        </div>
      )}

      {/* Bottom section */}
      <div className="border-t border-gray-200 p-3">
        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-all mb-2"
          title={!isOpen ? "Paramètres" : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isOpen && <span className="font-medium">Paramètres</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          title={!isOpen ? "Déconnexion" : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isOpen && <span className="font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}