// app/dashboard/tags/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tag } from '@/types/tag.types';
import { Contact } from '@/types/contact.types';
import TagAnalytics from '@/components/tags/TagAnalytics';
import TagContactsList from '@/components/tags/TagContactsList';
import { apiClient } from '@/lib/api/client';

interface TagWithContacts extends Tag {
  contacts?: Contact[];
}

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;
  
  const [tag, setTag] = useState<TagWithContacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'analytics'>('contacts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    couleur: '',
    description: ''
  });

  useEffect(() => {
    if (tagId) {
      loadTag();
    }
  }, [tagId]);

  const loadTag = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<TagWithContacts>(`/api/tags/${tagId}`);
      setTag(response);
      setEditForm({
        nom: response.nom,
        couleur: response.couleur,
        description: response.description || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement du tag:', error);
      setTag(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tag) return;

    try {
      await apiClient.put(`/api/tags/${tag.id}`, editForm);
      await loadTag();
      setIsEditing(false);
      alert('Tag modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async () => {
    if (!tag) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tag.nom}" ? Il sera retiré de tous les contacts.`)) {
      try {
        await apiClient.delete(`/api/tags/${tag.id}`);
        router.push('/dashboard/tags');
        alert('Tag supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleRemoveContact = async (contactId: number) => {
    if (!tag) return;

    try {
      await apiClient.post(`/api/tags/${tag.id}/contacts`, {
        tag_ids: [tag.id],
        contact_ids: [contactId],
        operation: 'remove'
      });
      await loadTag();
      alert('Contact retiré du tag');
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      alert('Erreur lors du retrait du contact');
    }
  };

  const handleAddContacts = async (contactIds: number[]) => {
    if (!tag) return;

    try {
      await apiClient.post(`/api/tags/${tag.id}/contacts`, {
        tag_ids: [tag.id],
        contact_ids: contactIds,
        operation: 'add'
      });
      await loadTag();
      alert(`${contactIds.length} contact(s) ajouté(s) au tag`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout des contacts');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p className="text-gray-500 text-lg mb-2">Tag introuvable</p>
        <p className="text-sm text-gray-400 mb-4">Le tag demandé n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push('/dashboard/tags')}
          className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
        >
          Retour aux tags
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/tags')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Retour à la liste"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Tag preview */}
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-200"
                  style={{ backgroundColor: tag.couleur }}
                />
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.nom}
                      onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-crm-purple focus:outline-none"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{tag.nom}</h1>
                  )}
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-500">
                      {tag.nombre_contacts || 0} contact(s)
                    </span>
                    {tag.date_creation && (
                      <span className="text-sm text-gray-500">
                        • Créé le {new Date(tag.date_creation).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Enregistrer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Supprimer le tag"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {isEditing ? (
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-crm-purple resize-none"
            rows={2}
            placeholder="Description du tag..."
          />
        ) : (
          tag.description && (
            <p className="text-gray-600 max-w-2xl">{tag.description}</p>
          )
        )}

        {/* Color editor */}
        {isEditing && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={editForm.couleur}
                onChange={(e) => setEditForm({ ...editForm, couleur: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={editForm.couleur}
                onChange={(e) => setEditForm({ ...editForm, couleur: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple"
                placeholder="#7978E2"
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center space-x-1 border-b border-gray-200 mt-6">
          {[
            { id: 'contacts', label: 'Contacts', icon: '👥', count: tag.contacts?.length },
            { id: 'analytics', label: 'Analytiques', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-crm-purple text-crm-purple'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'contacts' && (
          <TagContactsList
            tag={tag}
            contacts={tag.contacts || []}
            onRemoveContact={handleRemoveContact}
            onAddContacts={handleAddContacts}
            onRefresh={loadTag}
          />
        )}
        
        {activeTab === 'analytics' && (
          <TagAnalytics tagId={tag.id} />
        )}
      </div>
    </div>
  );
}