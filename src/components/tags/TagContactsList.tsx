// components/tags/TagContactsList.tsx
'use client';

import { useState } from 'react';
import { Tag } from '@/types/tag.types';
import { Contact } from '@/types/contact.types';

interface TagContactsListProps {
  tag: Tag;
  contacts: Contact[];
  onRemoveContact: (contactId: number) => void;
  onAddContacts: (contactIds: number[]) => void;
  onRefresh: () => void;
}

export default function TagContactsList({ 
  tag, 
  contacts, 
  onRemoveContact, 
  onAddContacts, 
  onRefresh 
}: TagContactsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  const filteredContacts = contacts.filter(contact =>
    contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.entreprise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (prenom?: string, nom?: string): string => {
    const firstInitial = prenom && prenom.length > 0 ? prenom[0].toUpperCase() : '';
    const lastInitial = nom && nom.length > 0 ? nom[0].toUpperCase() : '';
    return firstInitial + lastInitial || '?';
  };

  const getFullName = (contact: Contact): string => {
    if (contact.prenom && contact.nom) {
      return `${contact.prenom} ${contact.nom}`;
    } else if (contact.prenom) {
      return contact.prenom;
    } else if (contact.nom) {
      return contact.nom;
    } else {
      return 'Contact sans nom';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Contacts avec le tag "{tag.nom}"
          </h3>
          <p className="text-sm text-gray-500">
            {contacts.length} contact(s) au total
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajouter des contacts</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-crm-turquoise"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Contacts list */}
      {filteredContacts.length > 0 ? (
        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id_utilisateur}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-crm-pink to-crm-purple flex items-center justify-center text-white font-semibold">
                  {getInitials(contact.prenom, contact.nom)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {getFullName(contact)}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>{contact.email}</span>
                    {contact.entreprise && (
                      <>
                        <span>•</span>
                        <span>{contact.entreprise}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(`/dashboard/contacts/${contact.id_utilisateur}`, '_blank')}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-crm-purple transition-colors"
                  title="Voir le contact"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => onRemoveContact(contact.id_utilisateur)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                  title="Retirer du tag"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">
            {searchTerm ? 'Aucun contact trouvé' : 'Aucun contact avec ce tag'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter des contacts à ce tag'}
          </p>
        </div>
      )}

      {/* Add contacts modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ajouter des contacts au tag</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Cette fonctionnalité permettrait de sélectionner des contacts et les ajouter au tag.
                Pour l'instant, vous pouvez ajouter des tags aux contacts depuis la page de gestion des contacts.
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}