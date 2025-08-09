// app/dashboard/tags/page.tsx - Version avec mise à jour automatique des stats
'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag, TagFilters, CreateTagData, UpdateTagData, TagStats } from '@/types/tag.types';
import TagsTable from '@/components/tags/TagsTable';
import TagsFilters from '@/components/tags/TagsFilters';
import TagsStats, { TagsStatsRef } from '@/components/tags/TagsStats';
import TagModal from '@/components/tags/TagModal';
import ColorPicker, { colorUtils } from '@/components/tags/ColorPicker';
import { apiClient } from '@/lib/api/client';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickAddTag, setShowQuickAddTag] = useState(false);
  const [quickTagData, setQuickTagData] = useState({
    nom: '',
    couleur: colorUtils.randomColor()
  });
  const [currentStats, setCurrentStats] = useState<TagStats | null>(null);

  // Référence pour contrôler le composant TagsStats
  const statsRef = useRef<TagsStatsRef>(null);

  useEffect(() => {
    loadTags();
  }, [filters, searchTerm]);

  const loadTags = async () => {
    try {
      setLoading(true);
      
      const params: TagFilters = {
        ...filters,
        search: searchTerm || undefined,
      };

      const response = await apiClient.get<Tag[]>('/api/tags', { params });
      console.log('Tags response:', response);
      
      if (Array.isArray(response)) {
        setTags(response);
      } else {
        console.warn('Format de réponse non reconnu:', response);
        setTags([]);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      alert('Erreur lors du chargement des tags. Veuillez réessayer.');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction helper pour rafraîchir tags ET stats
  const refreshTagsAndStats = async () => {
    console.log('🔄 Rafraîchissement des tags et statistiques...');
    
    // Rafraîchir les tags
    await loadTags();
    
    // Rafraîchir les stats via la ref
    if (statsRef.current) {
      await statsRef.current.forceRefresh();
    }
    
    console.log('✅ Tags et statistiques mis à jour');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCreateTag = async (tagData: CreateTagData) => {
    try {
      const response = await apiClient.post<Tag>('/api/tags', tagData);
      console.log('Tag created:', response);
      
      // Rafraîchir les tags et stats
      await refreshTagsAndStats();
      
      setShowAddModal(false);
      
      // Notification de succès avec détails
      const message = `Tag "${tagData.nom}" créé avec succès!`;
      console.log(message);
      
      // Toast notification au lieu d'alert
      showSuccessToast(message);
      
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
      const tagData: CreateTagData = {
        nom: quickTagData.nom.trim(),
        couleur: quickTagData.couleur
      };
      
      const response = await apiClient.post<Tag>('/api/tags', tagData);
      console.log('Quick tag created:', response);
      
      // Rafraîchir les tags et stats
      await refreshTagsAndStats();
      
      setShowQuickAddTag(false);
      setQuickTagData({
        nom: '',
        couleur: colorUtils.randomColor()
      });
      
      showSuccessToast(`Tag "${tagData.nom}" créé rapidement!`);
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      if (error.message?.includes('existe déjà')) {
        alert('Un tag avec ce nom existe déjà');
      } else {
        alert('Erreur lors de la création du tag');
      }
    }
  };

  const handleUpdateTag = async (tagId: number, tagData: UpdateTagData) => {
    try {
      const response = await apiClient.put(`/api/tags/${tagId}`, tagData);
      console.log('Tag updated:', response);
      
      // Rafraîchir les tags et stats
      await refreshTagsAndStats();
      
      setEditingTag(null);
      showSuccessToast('Tag modifié avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification du tag');
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    const tag = tags.find(t => t.id === tagId);
    const contactCount = tag?.nombre_contacts || 0;
    
    let confirmMessage = 'Êtes-vous sûr de vouloir supprimer ce tag ?';
    if (contactCount > 0) {
      confirmMessage += ` Il sera retiré de ${contactCount} contact(s).`;
    }
    
    if (confirm(confirmMessage)) {
      try {
        const response = await apiClient.delete(`/api/tags/${tagId}`);
        console.log('Tag deleted:', response);
        
        // Rafraîchir les tags et stats
        await refreshTagsAndStats();
        
        setSelectedTags(prev => prev.filter(id => id !== tagId));
        showSuccessToast(`Tag "${tag?.nom}" supprimé avec succès`);
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du tag');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;
    
    const totalContacts = selectedTags.reduce((total, tagId) => {
      const tag = tags.find(t => t.id === tagId);
      return total + (tag?.nombre_contacts || 0);
    }, 0);
    
    let confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedTags.length} tag(s) ?`;
    if (totalContacts > 0) {
      confirmMessage += ` Cela affectera ${totalContacts} contact(s).`;
    }
    
    if (confirm(confirmMessage)) {
      try {
        // Supprimer chaque tag individuellement
        await Promise.all(
          selectedTags.map(tagId => apiClient.delete(`/api/tags/${tagId}`))
        );
        
        // Rafraîchir les tags et stats
        await refreshTagsAndStats();
        
        setSelectedTags([]);
        showSuccessToast(`${selectedTags.length} tag(s) supprimé(s) avec succès`);
        
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
      const tagData: CreateTagData = {
        nom: newName,
        couleur: originalTag.couleur,
        description: originalTag.description ? `${originalTag.description} (copie)` : undefined
      };
      
      await apiClient.post<Tag>('/api/tags', tagData);
      
      // Rafraîchir les tags et stats
      await refreshTagsAndStats();
      
      showSuccessToast(`Tag "${newName}" dupliqué avec succès`);
      
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
        // Utiliser l'endpoint de fusion que nous avons créé
        const response = await apiClient.post('/api/tags/merge', {
          source_tag_id: selectedTags[0],
          target_tag_id: selectedTags[1]
        });
        
        console.log('Tags merged:', response);
        
        // Rafraîchir les tags et stats
        await refreshTagsAndStats();
        
        setSelectedTags([]);
        showSuccessToast(`Tags fusionnés: "${tag1.nom}" → "${tag2.nom}"`);
        
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
        
        // Rafraîchir les tags et stats
        await refreshTagsAndStats();
        
        setSelectedTags([]);
        showSuccessToast(`Couleur mise à jour pour ${selectedTags.length} tag(s)`);
        
      } catch (error) {
        console.error('Erreur lors du changement de couleur:', error);
        alert('Erreur lors du changement de couleur');
      }
    }
  };

  const handleRefreshTags = async () => {
    try {
      // Forcer le rechargement avec force_refresh
      setFilters(prev => ({ ...prev, force_refresh: true }));
      await refreshTagsAndStats();
      // Remettre force_refresh à false
      setFilters(prev => ({ ...prev, force_refresh: false }));
      showSuccessToast('Tags et statistiques rechargés');
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
      alert('Erreur lors du rechargement des tags');
    }
  };

  // Fonction pour afficher les notifications de succès
  const showSuccessToast = (message: string) => {
    // Pour l'instant, on utilise console.log
    // Plus tard, vous pourrez remplacer par un système de toast/notification
    console.log(`✅ ${message}`);
    
    // Optionnel: afficher temporairement un message à l'écran
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Gestionnaire pour quand les stats sont chargées
  const handleStatsLoaded = (stats: TagStats) => {
    setCurrentStats(stats);
    console.log('📊 Statistiques chargées:', stats);
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
            {/* Bouton refresh */}
            <button
              onClick={handleRefreshTags}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Actualiser"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

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

        {/* Stats cards avec ref pour contrôle */}
        <TagsStats ref={statsRef} onStatsLoaded={handleStatsLoaded} />
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
                autoFocus
              />
            </div>
            
            <ColorPicker
              value={quickTagData.couleur}
              onChange={(color) => setQuickTagData(prev => ({ ...prev, couleur: color }))}
              className="w-auto"
            />
            
            <button
              onClick={handleQuickCreateTag}
              disabled={!quickTagData.nom.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Info sur les tags chargés */}
      <div className="mb-4 text-sm text-gray-500">
        {loading ? 'Chargement...' : `${tags.length} tag(s) affiché(s)`}
      </div>

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