// components/contacts/ContactTagsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Contact, Tag } from '@/types/contact.types';
import { apiClient } from '@/lib/api/client';

interface ContactTagsManagerProps {
  contact: Contact;
  onUpdate: () => void;
}

// Interface pour la réponse des tags
interface TagsResponse {
  tags?: Tag[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

// Interface pour la création de tag
interface CreateTagResponse {
  message: string;
  tag: {
    id: number;
    nom: string;
    couleur: string;
    description?: string;
  };
}

export default function ContactTagsManager({ contact, onUpdate }: ContactTagsManagerProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState({ nom: '', couleur: '#7978E2', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableTags();
    setSelectedTags(contact.tags?.map(t => t.id) || []);
  }, [contact]);

  const loadAvailableTags = async () => {
    try {
      const response = await apiClient.get<TagsResponse>('/api/tags', {
        params: { limit: 100, sort_by: 'nom', sort_order: 'asc' }
      });
      
      // Gestion de la réponse avec la nouvelle structure
      let tagsData: Tag[] = [];
      
      if (response && typeof response === 'object') {
        if ('tags' in response && Array.isArray(response.tags)) {
          tagsData = response.tags;
        } else if (Array.isArray(response)) {
          tagsData = response;
        }
      } else if (Array.isArray(response)) {
        tagsData = response;
      }
      
      setAvailableTags(tagsData);
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      setAvailableTags([]);
    }
  };

  const handleAddTag = async (tagId: number) => {
    try {
      setLoading(true);
      // Utiliser l'API corrigée pour ajouter le tag au contact
      await apiClient.post(`/api/contacts/${contact.id_utilisateur}/tags`, {
        tag_ids: [tagId]
      });
      setSelectedTags([...selectedTags, tagId]);
      onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du tag:', error);
      alert('Erreur lors de l\'ajout du tag. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      setLoading(true);
      // Utiliser l'API corrigée pour retirer le tag du contact
      await apiClient.delete(`/api/contacts/${contact.id_utilisateur}/tags/${tagId}`);
      setSelectedTags(selectedTags.filter(id => id !== tagId));
      onUpdate();
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      alert('Erreur lors de la suppression du tag. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.nom.trim()) {
      alert('Veuillez saisir un nom pour le tag');
      return;
    }

    try {
      setLoading(true);
      // Créer le nouveau tag
      const response = await apiClient.post<CreateTagResponse>('/api/tags', {
        nom: newTag.nom.trim(),
        couleur: newTag.couleur,
        description: newTag.description || undefined
      });
      
      // Ajouter le tag créé au contact
      const newTagId = response.tag.id;
      await handleAddTag(newTagId);
      
      // Fermer la modal et réinitialiser
      setShowAddTag(false);
      setNewTag({ nom: '', couleur: '#7978E2', description: '' });
      
      // Recharger la liste des tags disponibles
      await loadAvailableTags();
      
      alert('Tag créé et ajouté avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création du tag:', error);
      if (error.message?.includes('existe déjà')) {
        alert('Un tag avec ce nom existe déjà');
      } else {
        alert('Erreur lors de la création du tag');
      }
    } finally {
      setLoading(false);
    }
  };

  const contactTags = contact.tags || [];
  const unassignedTags = availableTags.filter(tag => !selectedTags.includes(tag.id));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags du contact</h3>
        <p className="text-sm text-gray-500">
          Gérez les tags associés à ce contact pour mieux organiser vos données
        </p>
      </div>

      {/* Tags actuels */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tags actuels</h4>
        {contactTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contactTags.map((tag) => (
              <div
                key={tag.id}
                className="group relative inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: tag.couleur }}
              >
                <span>{tag.nom}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Tooltip */}
                {tag.description && (
                  <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {tag.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">Aucun tag assigné</p>
        )}
      </div>

      {/* Ajouter des tags */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Ajouter des tags</h4>
        <div className="flex flex-wrap gap-2">
          {unassignedTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleAddTag(tag.id)}
              className="group relative inline-flex items-center px-3 py-1.5 rounded-full border-2 border-gray-300 text-gray-700 text-sm font-medium hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: tag.couleur }}
              />
              <span>{tag.nom}</span>
              <svg className="ml-2 w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>

              {/* Tooltip avec statistiques */}
              <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {tag.description && <div>{tag.description}</div>}
                {tag.nombre_contacts !== undefined && (
                  <div className="text-gray-300">{tag.nombre_contacts} contact{tag.nombre_contacts > 1 ? 's' : ''}</div>
                )}
              </div>
            </button>
          ))}

          {/* Bouton créer nouveau tag */}
          <button
            onClick={() => setShowAddTag(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-full border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-gray-400 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un tag
          </button>
        </div>
        
        {unassignedTags.length === 0 && availableTags.length > 0 && (
          <p className="text-sm text-gray-500 italic mt-2">
            Tous les tags disponibles sont déjà assignés à ce contact
          </p>
        )}
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-crm-purple"></div>
          <span className="ml-2 text-sm text-gray-600">Mise à jour en cours...</span>
        </div>
      )}

      {/* Modal création de tag */}
      {showAddTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Créer un nouveau tag</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTag.nom}
                  onChange={(e) => setNewTag({ ...newTag, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise"
                  placeholder="Ex: VIP, Newsletter..."
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newTag.couleur}
                    onChange={(e) => setNewTag({ ...newTag, couleur: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTag.couleur}
                    onChange={(e) => setNewTag({ ...newTag, couleur: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#7978E2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise"
                  rows={3}
                  placeholder="Description du tag..."
                  maxLength={500}
                />
              </div>

              {/* Aperçu du tag */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu :
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: newTag.couleur }}
                  >
                    {newTag.nom || 'Nom du tag'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddTag(false);
                  setNewTag({ nom: '', couleur: '#7978E2', description: '' });
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTag}
                className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newTag.nom.trim() || loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  'Créer le tag'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques des tags */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{contactTags.length}</p>
            <p className="text-xs text-gray-500">Tags assignés</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{availableTags.length}</p>
            <p className="text-xs text-gray-500">Tags disponibles</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {contact.campagnes?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Campagnes liées</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {contact.formations?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Formations suivies</p>
          </div>
        </div>
      </div>
    </div>
  );
}