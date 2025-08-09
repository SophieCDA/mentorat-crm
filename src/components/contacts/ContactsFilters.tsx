// components/contacts/ContactsFilters.tsx
'use client';

import { useState } from 'react';
import { ContactFilters } from '@/types/contact.types';

interface ContactsFiltersProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
}

export default function ContactsFilters({ filters, onFiltersChange }: ContactsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  // État local pour les filtres en cours d'édition
  const [tempFilters, setTempFilters] = useState<ContactFilters>(filters);

  const handleFilterChange = (key: keyof ContactFilters, value: any) => {
    setTempFilters({
      ...tempFilters,
      [key]: value
    });
  };

  const handleReset = () => {
    const resetFilters: ContactFilters = {
      sort_by: 'date_creation',
      sort_order: 'desc'
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    setShowAdvanced(false);
  };

  // Appliquer les filtres temporaires aux filtres réels
  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setShowAdvanced(false);
  };

  // Annuler les modifications et revenir aux filtres originaux
  const cancelFilters = () => {
    setTempFilters(filters);
    setShowAdvanced(false);
  };

  // Ouvrir la modal avec les filtres actuels
  const openAdvancedFilters = () => {
    setTempFilters(filters);
    setShowAdvanced(true);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sort_by' && key !== 'sort_order'
  ).length;

  return (
    <div className="flex items-center space-x-3">
      {/* Sort */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">Trier par:</label>
        <select
          value={filters.sort_by || 'date_creation'}
          onChange={(e) => onFiltersChange({ ...filters, sort_by: e.target.value as 'date_creation' | 'nom' | 'prenom' | 'email' })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#42B4B7]"
        >
          <option value="date_creation">Date de création</option>
          <option value="nom">Nom</option>
          <option value="prenom">Prénom</option>
          <option value="email">Email</option>
        </select>
        
        <button
          onClick={() => onFiltersChange({ 
            ...filters, 
            sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc' 
          })}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {filters.sort_order === 'asc' ? (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Filter button */}
      <button
        onClick={openAdvancedFilters}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
          activeFiltersCount > 0
            ? 'bg-[#7978E2] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filtres</span>
        {activeFiltersCount > 0 && (
          <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Advanced filters modal */}
      {showAdvanced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filtres avancés</h3>
              <button
                onClick={cancelFilters}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Email autorisé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autorisation email
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="email_autorise"
                      checked={tempFilters.email_autorise === undefined}
                      onChange={() => handleFilterChange('email_autorise', undefined)}
                      className="rounded-full border-gray-300 text-[#7978E2] focus:ring-[#7978E2] mr-2"
                    />
                    <span className="text-sm">Tous</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="email_autorise"
                      checked={tempFilters.email_autorise === true}
                      onChange={() => handleFilterChange('email_autorise', true)}
                      className="rounded-full border-gray-300 text-[#7978E2] focus:ring-[#7978E2] mr-2"
                    />
                    <span className="text-sm">Autorisé</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="email_autorise"
                      checked={tempFilters.email_autorise === false}
                      onChange={() => handleFilterChange('email_autorise', false)}
                      className="rounded-full border-gray-300 text-[#7978E2] focus:ring-[#7978E2] mr-2"
                    />
                    <span className="text-sm">Non autorisé</span>
                  </label>
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={tempFilters.source || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#42B4B7]"
                >
                  <option value="">Toutes les sources</option>
                  <option value="Site web">Site web</option>
                  <option value="Réseaux sociaux">Réseaux sociaux</option>
                  <option value="Référencement">Référencement</option>
                  <option value="Import">Import</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Localisation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={tempFilters.pays || ''}
                    onChange={(e) => handleFilterChange('pays', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#42B4B7]"
                    placeholder="Ex: France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={tempFilters.ville || ''}
                    onChange={(e) => handleFilterChange('ville', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#42B4B7]"
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>

              {/* Date de création */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de création
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Du</label>
                    <input
                      type="date"
                      value={tempFilters.date_debut || ''}
                      onChange={(e) => handleFilterChange('date_debut', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#42B4B7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Au</label>
                    <input
                      type="date"
                      value={tempFilters.date_fin || ''}
                      onChange={(e) => handleFilterChange('date_fin', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#42B4B7]"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* {['VIP', 'Client', 'Newsletter', 'Prospect', 'Partenaire'].map((tag) => {
                    const isSelected = tempFilters.tags?.includes(tag) || false;
                    return (
                      <label key={tag} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentTags = tempFilters.tags || [];
                            if (e.target.checked) {
                              handleFilterChange('tags', [...currentTags, tag]);
                            } else {
                              handleFilterChange('tags', currentTags.filter(t => t !== tag));
                            }
                          }}
                          className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2] mr-2"
                        />
                        <span className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          isSelected 
                            ? 'bg-[#7978E2] text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}>
                          {tag}
                        </span>
                      </label>
                    );
                  })} */}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={cancelFilters}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}