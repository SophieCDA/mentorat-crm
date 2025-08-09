// components/contacts/ContactFormations.tsx
'use client';

import { useState } from 'react';
import { Contact, Formation } from '@/types/contact.types';

interface ContactFormationsProps {
  contact: Contact;
  onUpdate: () => void;
}

export default function ContactFormations({ contact, onUpdate }: ContactFormationsProps) {
  const [showAddFormation, setShowAddFormation] = useState(false);
  const formations = contact.formations || [];

  const getStatusColor = (status: Formation['statut']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'archivee':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Formations</h3>
          <button
            onClick={() => setShowAddFormation(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-crm-pink to-crm-purple text-white text-sm rounded-lg hover:shadow-lg transition-all"
          >
            Inscrire à une formation
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Formations suivies par ce contact
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-purple-800">
            {formations.length}
          </p>
          <p className="text-xs text-purple-600">Formations totales</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-800">
            {formations.filter(f => f.statut === 'active').length}
          </p>
          <p className="text-xs text-green-600">En cours</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-800">
            {formations.reduce((total, f) => total + (f.progression || 0), 0) / formations.length || 0}%
          </p>
          <p className="text-xs text-blue-600">Progression moyenne</p>
        </div>
      </div>

      {/* Formations list */}
      {formations.length > 0 ? (
        <div className="space-y-4">
          {formations.map((formation) => (
            <div
              key={formation.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{formation.nom}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(formation.statut)}`}>
                      {formation.statut === 'active' ? 'Active' : formation.statut === 'inactive' ? 'Inactive' : 'Archivée'}
                    </span>
                  </div>
                  {formation.description && (
                    <p className="text-sm text-gray-600">{formation.description}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formation.prix} €</p>
                  {formation.duree_heures && (
                    <p className="text-xs text-gray-500">{formation.duree_heures}h de contenu</p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {formation.progression !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium">{formation.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(formation.progression)}`}
                      style={{ width: `${formation.progression}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Formation details */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                {formation.date_acces && (
                  <div>
                    <span className="text-gray-600">Date d'accès:</span>
                    <span className="ml-2 font-medium">
                      {new Date(formation.date_acces).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Statut:</span>
                  <span className="ml-2 font-medium">
                    {formation.progression === 100 ? '✅ Complétée' : 
                     formation.progression && formation.progression > 0 ? '📚 En cours' : '📋 Non commencée'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                <button className="flex-1 px-3 py-1.5 bg-crm-purple text-white text-sm rounded hover:bg-opacity-90 transition-colors">
                  Voir détails
                </button>
                <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                  Envoyer rappel
                </button>
                {formation.statut === 'active' && (
                  <button className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors">
                    Désinscrire
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500">Aucune formation</p>
          <p className="text-sm text-gray-400 mt-1">
            Ce contact n'est inscrit à aucune formation
          </p>
        </div>
      )}

      {/* Add formation modal */}
      {showAddFormation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Inscrire à une formation</h3>
            
            {/* Liste des formations disponibles */}
            <div className="space-y-3 mb-6">
              {[
                { nom: 'CRM Débutant', prix: 99, duree: 6 },
                { nom: 'CRM Avancé', prix: 199, duree: 12 },
                { nom: 'Marketing Digital', prix: 149, duree: 8 },
                { nom: 'Vente B2B', prix: 299, duree: 16 }
              ].map((formation, idx) => (
                <label
                  key={idx}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="formation"
                    className="rounded-full border-gray-300 text-crm-purple focus:ring-crm-purple mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{formation.nom}</p>
                    <p className="text-sm text-gray-500">
                      {formation.duree}h de contenu • {formation.prix} €
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formation.prix} €
                  </span>
                </label>
              ))}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Envoyer l'accès immédiatement
                </label>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-crm-purple focus:ring-crm-purple"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Envoyer email de bienvenue
                </label>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-crm-purple focus:ring-crm-purple"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddFormation(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowAddFormation(false);
                  onUpdate();
                }}
                className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
              >
                Inscrire à la formation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}