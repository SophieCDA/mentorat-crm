// components/contacts/ContactTimeline.tsx
'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
  id: string;
  type: 'creation' | 'tag' | 'campaign' | 'formation' | 'transaction' | 'email' | 'note' | 'call';
  title: string;
  description?: string;
  date: string;
  user?: string;
  metadata?: any;
}

interface ContactTimelineProps {
  contactId: number;
}

export default function ContactTimeline({ contactId }: ContactTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TimelineEvent['type']>('all');

  useEffect(() => {
    loadTimeline();
  }, [contactId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      // Simulation - Remplacez par votre API
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          type: 'transaction',
          title: 'Nouvelle transaction',
          description: 'Achat formation CRM Avancée - 299€',
          date: '2024-12-01T10:30:00',
          user: 'Système'
        },
        {
          id: '2',
          type: 'email',
          title: 'Email envoyé',
          description: 'Newsletter Novembre 2024',
          date: '2024-11-28T14:00:00',
          user: 'Campagne automatique'
        },
        {
          id: '3',
          type: 'formation',
          title: 'Inscription formation',
          description: 'Formation Marketing Digital',
          date: '2024-11-15T09:00:00',
          user: 'Admin'
        },
        {
          id: '4',
          type: 'tag',
          title: 'Tag ajouté',
          description: 'Tag "VIP" ajouté au contact',
          date: '2024-11-10T11:45:00',
          user: 'Marie Dupont'
        },
        {
          id: '5',
          type: 'note',
          title: 'Note ajoutée',
          description: 'Client intéressé par nos nouvelles formations',
          date: '2024-11-05T16:20:00',
          user: 'Jean Martin'
        },
        {
          id: '6',
          type: 'call',
          title: 'Appel téléphonique',
          description: 'Discussion sur les besoins en formation',
          date: '2024-10-28T10:15:00',
          user: 'Sophie Bernard'
        },
        {
          id: '7',
          type: 'campaign',
          title: 'Ajouté à une campagne',
          description: 'Campagne "Promo Black Friday"',
          date: '2024-10-20T08:30:00',
          user: 'Système'
        },
        {
          id: '8',
          type: 'creation',
          title: 'Contact créé',
          description: 'Le contact a été ajouté au CRM',
          date: '2024-01-15T12:00:00',
          user: 'Import CSV'
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Erreur lors du chargement de la timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'creation':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'tag':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        );
      case 'campaign':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
        );
      case 'formation':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'transaction':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'email':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'note':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'call':
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Historique des activités</h3>
        <p className="text-sm text-gray-500">
          Toutes les interactions et événements liés à ce contact
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-crm-purple text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tout ({events.length})
        </button>
        {['email', 'call', 'note', 'transaction', 'formation'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as TimelineEvent['type'])}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === type
                ? 'bg-crm-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'email' ? 'Emails' : 
             type === 'call' ? 'Appels' : 
             type === 'note' ? 'Notes' : 
             type === 'transaction' ? 'Transactions' : 
             'Formations'} 
            ({events.filter(e => e.type === type).length})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="flex items-start space-x-4">
              {/* Icon */}
              <div className="relative z-10">
                {getEventIcon(event.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(event.date)}
                  </span>
                </div>
                
                {event.user && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {event.user}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add note button */}
      <div className="mt-8 text-center">
        <button className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all">
          Ajouter une note
        </button>
      </div>
    </div>
  );
}