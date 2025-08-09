// components/contacts/ContactCampaigns.tsx
'use client';

import { useState } from 'react';
import { Contact, Campaign } from '@/types/contact.types';

interface ContactCampaignsProps {
  contact: Contact;
  onUpdate: () => void;
}

export default function ContactCampaigns({ contact, onUpdate }: ContactCampaignsProps) {
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const campaigns = contact.campagnes || [];

  const getStatusColor = (status: Campaign['statut']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pausee':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminee':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'brouillon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (status: Campaign['statut']) => {
    switch (status) {
      case 'active':
        return '🟢 Active';
      case 'pausee':
        return '⏸️ En pause';
      case 'terminee':
        return '✅ Terminée';
      case 'brouillon':
        return '📝 Brouillon';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'sms':
        return '📱';
      case 'notification':
        return '🔔';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Campagnes marketing</h3>
          <button
            onClick={() => setShowAddCampaign(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-crm-pink to-crm-purple text-white text-sm rounded-lg hover:shadow-lg transition-all"
          >
            Ajouter à une campagne
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Campagnes auxquelles ce contact est inscrit
        </p>
      </div>

      {/* Campaigns grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColor(
                campaign.statut
              )}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{campaign.nom}</h4>
                    <span className="text-xs font-medium">
                      {getStatusLabel(campaign.statut)}
                    </span>
                  </div>
                </div>
                
                <button className="p-1 rounded hover:bg-white/50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Campaign stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date début</span>
                  <span className="font-medium">
                    {new Date(campaign.date_debut).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                {campaign.date_fin && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date fin</span>
                    <span className="font-medium">
                      {new Date(campaign.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Inscrits</span>
                  <span className="font-medium">{campaign.nombre_inscrits}</span>
                </div>
                
                {campaign.taux_ouverture !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-lg">{campaign.taux_ouverture}%</p>
                        <p className="text-xs text-gray-600">Taux d'ouverture</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{campaign.taux_clic}%</p>
                        <p className="text-xs text-gray-600">Taux de clic</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-200">
                <button className="flex-1 px-3 py-1.5 bg-white/70 text-gray-700 text-sm rounded hover:bg-white transition-colors">
                  Voir détails
                </button>
                <button className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors">
                  Désinscrire
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-gray-500">Aucune campagne active</p>
          <p className="text-sm text-gray-400 mt-1">
            Ce contact n'est inscrit à aucune campagne
          </p>
        </div>
      )}

      {/* Add to campaign modal */}
      {showAddCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Ajouter à une campagne</h3>
            
            {/* Liste des campagnes disponibles */}
            <div className="space-y-2 mb-6">
              {['Newsletter Janvier', 'Promo Soldes', 'Campagne Fidélité', 'Email de bienvenue'].map((name, idx) => (
                <label
                  key={idx}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-crm-purple focus:ring-crm-purple mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-500">
                      {idx % 2 === 0 ? 'Email' : 'SMS'} • {150 + idx * 23} inscrits
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddCampaign(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowAddCampaign(false);
                  onUpdate();
                }}
                className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
              >
                Ajouter aux campagnes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}