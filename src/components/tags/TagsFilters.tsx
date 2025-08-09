// components/tags/TagsFilters.tsx
'use client';

import { TagFilters } from '@/types/tag.types';

interface TagsFiltersProps {
  filters: TagFilters;
  onFiltersChange: (filters: TagFilters) => void;
}

export default function TagsFilters({ filters, onFiltersChange }: TagsFiltersProps) {
  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sort_by: sortBy as TagFilters['sort_by']
    });
  };

  const handleOrderChange = () => {
    onFiltersChange({
      ...filters,
      sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleColorFilter = (couleur: string) => {
    onFiltersChange({
      ...filters,
      couleur: couleur === filters.couleur ? undefined : couleur
    });
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Sort by */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">Trier par:</label>
        <select
          value={filters.sort_by || 'nom'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#42B4B7]"
        >
          <option value="nom">Nom</option>
          <option value="couleur">Couleur</option>
          <option value="date_creation">Date de création</option>
          <option value="nombre_contacts">Nombre de contacts</option>
        </select>
        
        {/* Sort order button */}
        <button
          onClick={handleOrderChange}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={filters.sort_order === 'asc' ? 'Croissant' : 'Décroissant'}
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

      {/* Color filters */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Couleur:</span>
        <div className="flex items-center space-x-1">
          {['#F22E77', '#7978E2', '#42B4B7', '#10B981', '#F59E0B'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorFilter(color)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                filters.couleur === color 
                  ? 'border-gray-800 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={`Filtrer par ${color}`}
            />
          ))}
          
          {/* Clear color filter */}
          {filters.couleur && (
            <button
              onClick={() => handleColorFilter('')}
              className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center bg-white"
              title="Toutes les couleurs"
            >
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}