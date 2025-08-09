// components/tags/TagsTable.tsx
'use client';

import { Tag } from '@/types/tag.types';

interface TagsTableProps {
  tags: Tag[];
  loading: boolean;
  selectedTags: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: number) => void;
  onDuplicate: (tagId: number) => void;
}

export default function TagsTable({
  tags,
  loading,
  selectedTags,
  onSelectionChange,
  onEdit,
  onDelete,
  onDuplicate
}: TagsTableProps) {
  
  const handleSelectAll = () => {
    if (selectedTags.length === tags.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tags.map(t => t.id));
    }
  };

  const handleSelectTag = (id: number) => {
    if (selectedTags.includes(id)) {
      onSelectionChange(selectedTags.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedTags, id]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7978E2]"></div>
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-gray-500 mb-2">Aucun tag trouvé</p>
          <p className="text-sm text-gray-400">Commencez par créer votre premier tag</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTags.length === tags.length && tags.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date création
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tags.map((tag) => (
              <tr 
                key={tag.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleSelectTag(tag.id)}
                    className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: tag.couleur }}
                    />
                    <span className="font-medium text-gray-900">{tag.nom}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {tag.description || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {tag.nombre_contacts || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {tag.date_creation 
                      ? new Date(tag.date_creation).toLocaleDateString('fr-FR')
                      : '-'
                    }
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(tag)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-[#7978E2] transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDuplicate(tag.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Dupliquer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(tag.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}