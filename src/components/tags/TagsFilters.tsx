// components/tags/TagsFilters.tsx
'use client';

import { TagFilters } from '@/types/tag.types';

interface TagsFiltersProps {
  filters: TagFilters;
  onFiltersChange: (filters: TagFilters) => void;
}

export default function TagsFilters({ filters, onFiltersChange }: TagsFiltersProps) {
  const predefinedColors = [
    { color: '#F22E77', name: 'Rose' },
    { color: '#42B4B7', name: 'Turquoise' },
    { color: '#7978E2', name: 'Violet' },
    { color: '#10B981', name: 'Vert' },
    { color: '#F59E0B', name: 'Orange' },
    { color: '#EF4444', name: 'Rouge' }
  ];

  return (
    <div className="flex items-center space-x-3">
      {/* Sort */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">Trier par:</label>
        <select
          value={filters.sort_by || 'nom'}
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            sort_by: e.target.value as 'nom' | 'date_creation' | 'nombre_contacts'
          })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#42B4B7]"
        >
          <option value="nom">Nom</option>
          <option value="date_creation">Date de création</option>
          <option value="nombre_contacts">Nombre de contacts</option>
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

      {/* Color filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">Couleur:</label>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onFiltersChange({ ...filters, couleur: undefined })}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !filters.couleur 
                ? 'bg-[#7978E2] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          {predefinedColors.map(({ color, name }) => (
            <button
              key={color}
              onClick={() => onFiltersChange({ 
                ...filters, 
                couleur: filters.couleur === color ? undefined : color 
              })}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                filters.couleur === color 
                  ? 'border-gray-800 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}