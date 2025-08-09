// app/dashboard/tags/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tag, TagFilters } from '@/types/tag.types';
import TagsTable from '@/components/tags/TagsTable';
import TagsFilters from '@/components/tags/TagsFilters';
import TagsStats from '@/components/tags/TagsStats';
import TagModal from '@/components/tags/TagModal';
import ColorPicker, { colorUtils } from '@/components/tags/ColorPicker';
import { apiClient } from '@/lib/api/client';

// Interface pour la réponse de l'API
interface TagsResponse {
  tags: Tag[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [filters, setFilters] = useState<TagFilters>({
    sort_by: 'nom',
    sort_order: 'asc'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickAddTag, setShowQuickAddTag] = useState(false);
  const [quickTagData, setQuickTagData] = useState({
    nom: '',
    couleur: colorUtils.randomColor()
  });
  const itemsPerPage = 20;

  useEffect(() => {
    loadTags();
  }, [filters, currentPage, searchTerm]);

  const loadTags = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        search: searchTerm || undefined,
        couleur: filters.couleur || undefined,
      };

      const response = await apiClient.get<TagsResponse | Tag[]>('/api/tags', { params });
      console.log('Tags response:', response);
      
      // Gestion de la réponse avec la nouvelle structure
      if (response && typeof response === 'object') {
        if ('tags' in response && Array.isArray(response.tags)) {
          // Structure: { tags: [...], total: ..., etc. }
          setTags(response.tags);
          setTotalTags(response.total || response.tags.length);
          setTotalPages(response.total_pages || Math.ceil((response.total || response.tags.length) / itemsPerPage));
        } else if (Array.isArray(response)) {
          // Structure: [tag1, tag2, ...]
          setTags(response);
          setTotalTags(response.length);
          setTotalPages(Math.ceil(response.length / itemsPerPage));
        } else {
          console.warn('Format de réponse non reconnu:', response);
          setTags([]);
          setTotalTags(0);
          setTotalPages(1);
        }
      } else {
        console.warn('Réponse API inattendue:', response);
        setTags([]);
        setTotalTags(0);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      alert('Erreur lors du chargement des tags. Veuillez réessayer.');
      setTags([]);
      setTotalTags(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateTag = async (tagData: { nom: string; couleur: string; description?: string }) => {
    try {
      const response = await apiClient.post('/api/tags', tagData);
      console.log('Tag created:', response);
      await loadTags();
      setShowAddModal(false);
      alert('Tag créé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      if (error.message?.includes('existe déjà')) {
        alert('Un tag avec ce nom existe déjà');
      } else {
        alert('Erreur lors de la création du tag');
      }
    }
  };

  const handleQuickCreateTag = async () => {
    if (!quickTagData.nom.trim()) {
      alert('Veuillez saisir un nom pour le tag');
      return;
    }

    try {
      const response = await apiClient.post('/api/tags', {
        nom: quickTagData.nom.trim(),
        couleur: quickTagData.couleur
      });
      console.log('Quick tag created:', response);
      await loadTags();
      setShowQuickAddTag(false);
      setQuickTagData({
        nom: '',
        couleur: colorUtils.randomColor()
      });
      alert('Tag créé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      if (error.message?.includes('existe déjà')) {
        alert('Un tag avec ce nom existe déjà');
      } else {
        alert('Erreur lors de la création du tag');
      }
    }
  };

  const handleUpdateTag = async (tagId: number, tagData: { nom?: string; couleur?: string; description?: string }) => {
    try {
      const response = await apiClient.put(`/api/tags/${tagId}`, tagData);
      console.log('Tag updated:', response);
      await loadTags();
      setEditingTag(null);
      alert('Tag modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification du tag');
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tag ? Il sera retiré de tous les contacts.')) {
      try {
        const response = await apiClient.delete(`/api/tags/${tagId}`);
        console.log('Tag deleted:', response);
        await loadTags();
        alert('Tag supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du tag');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTags.length} tag(s) ?`)) {
      try {
        // Supprimer chaque tag individuellement puisque nous n'avons pas d'endpoint bulk
        await Promise.all(
          selectedTags.map(tagId => apiClient.delete(`/api/tags/${tagId}`))
        );
        await loadTags();
        setSelectedTags([]);
        alert(`${selectedTags.length} tag(s) supprimé(s) avec succès`);
      } catch (error) {
        console.error('Erreur lors de la suppression en masse:', error);
        alert('Erreur lors de la suppression des tags');
      }
    }
  };

  const handleDuplicateTag = async (tagId: number) => {
    const originalTag = tags.find(t => t.id === tagId);
    if (!originalTag) return;

    const newName = prompt('Nom du nouveau tag:', `${originalTag.nom} (copie)`);
    if (!newName) return;

    try {
      // Créer un nouveau tag avec les mêmes propriétés
      await apiClient.post('/api/tags', {
        nom: newName,
        couleur: originalTag.couleur,
        description: originalTag.description ? `${originalTag.description} (copie)` : undefined
      });
      await loadTags();
      alert('Tag dupliqué avec succès');
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      alert('Erreur lors de la duplication du tag');
    }
  };

  const handleMergeTags = async () => {
    if (selectedTags.length !== 2) {
      alert('Veuillez sélectionner exactement 2 tags à fusionner');
      return;
    }

    const tag1 = tags.find(t => t.id === selectedTags[0]);
    const tag2 = tags.find(t => t.id === selectedTags[1]);

    if (!tag1 || !tag2) return;

    const choice = confirm(
      `Fusionner "${tag1.nom}" avec "${tag2.nom}" ?\n\n` +
      `Le tag "${tag1.nom}" sera supprimé et tous ses contacts seront transférés vers "${tag2.nom}".`
    );

    if (choice) {
      try {
        // TODO: Implémenter l'endpoint de fusion côté backend
        alert('Fonctionnalité de fusion en cours de développement');
        
        // Code pour plus tard:
        // await apiClient.post('/api/tags/merge', {
        //   source_tag_id: selectedTags[0],
        //   target_tag_id: selectedTags[1]
        // });
        // await loadTags();
        // setSelectedTags([]);
        // alert('Tags fusionnés avec succès');
      } catch (error) {
        console.error('Erreur lors de la fusion:', error);
        alert('Erreur lors de la fusion des tags');
      }
    }
  };

  const handleBulkChangeColor = async (newColor: string) => {
    if (selectedTags.length === 0) return;

    if (confirm(`Changer la couleur de ${selectedTags.length} tag(s) vers ${newColor} ?`)) {
      try {
        // Mettre à jour chaque tag sélectionné
        await Promise.all(
          selectedTags.map(tagId => 
            apiClient.put(`/api/tags/${tagId}`, { couleur: newColor })
          )
        );
        await loadTags();
        setSelectedTags([]);
        alert(`Couleur mise à jour pour ${selectedTags.length} tag(s)`);
      } catch (error) {
        console.error('Erreur lors du changement de couleur:', error);
        alert('Erreur lors du changement de couleur');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
            <p className="text-sm text-gray-500">
              Organisez vos contacts avec un système de tags flexible
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Bouton fusion (si 2 tags sélectionnés) */}
            {selectedTags.length === 2 && (
              <button
                onClick={handleMergeTags}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Fusionner</span>
              </button>
            )}

            {/* Changement couleur en masse */}
            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Couleur:</span>
                <ColorPicker
                  value="#7978E2"
                  onChange={handleBulkChangeColor}
                  className="w-auto"
                />
              </div>
            )}
            
            {/* Création rapide */}
            <button
              onClick={() => setShowQuickAddTag(true)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Rapide</span>
            </button>
            
            {/* Nouveau tag */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouveau tag</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <TagsStats />
      </div>

      {/* Quick Add Tag */}
      {showQuickAddTag && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nom du tag..."
                value={quickTagData.nom}
                onChange={(e) => setQuickTagData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#42B4B7]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleQuickCreateTag();
                  }
                }}
              />
            </div>
            
            <ColorPicker
              value={quickTagData.couleur}
              onChange={(color) => setQuickTagData(prev => ({ ...prev, couleur: color }))}
              className="w-auto"
            />
            
            <button
              onClick={handleQuickCreateTag}
              className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Créer
            </button>
            
            <button
              onClick={() => {
                setShowQuickAddTag(false);
                setQuickTagData({ nom: '', couleur: colorUtils.randomColor() });
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
          
          {/* Aperçu */}
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Aperçu:</span>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: quickTagData.couleur }}
              />
              <span className="font-medium text-gray-900">
                {quickTagData.nom || 'Nom du tag'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un tag..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#42B4B7]"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <TagsFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Bulk actions */}
        {selectedTags.length > 0 && (
          <div className="mt-4 p-3 bg-[#7978E2]/10 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedTags.length} tag(s) sélectionné(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debug info - à retirer en production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <strong>Debug:</strong> {tags.length} tags chargés, Total: {totalTags}, Pages: {totalPages}
        </div>
      )}

      {/* Tags table */}
      <TagsTable
        tags={tags}
        loading={loading}
        selectedTags={selectedTags}
        onSelectionChange={setSelectedTags}
        onEdit={setEditingTag}
        onDelete={handleDeleteTag}
        onDuplicate={handleDuplicateTag}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalTags)} sur {totalTags} tags
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {/* Pages */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <TagModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateTag}
          defaultColor={colorUtils.randomColor()}
        />
      )}

      {editingTag && (
        <TagModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSave={(data) => handleUpdateTag(editingTag.id, data)}
        />
      )}
    </div>
  );
}