// components/contacts/ContactsTable.tsx
'use client';

import { Contact } from '@/types/contact.types';

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedContacts: number[];
  onSelectionChange: (ids: number[]) => void;
  onContactClick: (contact: Contact) => void;
}

export default function ContactsTable({
  contacts,
  loading,
  selectedContacts,
  onSelectionChange,
  onContactClick
}: ContactsTableProps) {
  
  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(contacts.map(c => c.id_utilisateur));
    }
  };

  const handleSelectContact = (id: number) => {
    if (selectedContacts.includes(id)) {
      onSelectionChange(selectedContacts.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedContacts, id]);
    }
  };

  // Fonction helper pour obtenir les initiales
  const getInitials = (prenom?: string, nom?: string): string => {
    const firstInitial = prenom && prenom.length > 0 ? prenom[0].toUpperCase() : '';
    const lastInitial = nom && nom.length > 0 ? nom[0].toUpperCase() : '';
    
    if (firstInitial && lastInitial) {
      return firstInitial + lastInitial;
    } else if (firstInitial) {
      return firstInitial;
    } else if (lastInitial) {
      return lastInitial;
    } else {
      return '?';
    }
  };

  // Fonction helper pour obtenir le nom complet
  const getFullName = (prenom?: string, nom?: string): string => {
    if (prenom && nom) {
      return `${prenom} ${nom}`;
    } else if (prenom) {
      return prenom;
    } else if (nom) {
      return nom;
    } else {
      return 'Contact sans nom';
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

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500 mb-2">Aucun contact trouvé</p>
          <p className="text-sm text-gray-400">Commencez par ajouter votre premier contact</p>
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
                  checked={selectedContacts.length === contacts.length && contacts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date création
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact, index) => (
              <tr 
                key={contact.id_utilisateur || `contact-${index}`}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onContactClick(contact)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id_utilisateur)}
                    onChange={() => handleSelectContact(contact.id_utilisateur)}
                    className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F22E77] to-[#7978E2] flex items-center justify-center text-white font-semibold mr-3">
                      {getInitials(contact.prenom, contact.nom)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getFullName(contact.prenom, contact.nom)}
                      </div>
                      {contact.entreprise && (
                        <div className="text-sm text-gray-500">{contact.entreprise}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{contact.email || '-'}</span>
                    {contact.email_autorise && (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{contact.telephone || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags && contact.tags.length > 0 ? (
                      <>
                        {contact.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tag.id || `tag-${contact.id_utilisateur}-${tagIndex}`}
                            className="px-2 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: tag.couleur || '#7978E2' }}
                          >
                            {tag.nom}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{contact.source || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {contact.date_creation 
                      ? new Date(contact.date_creation).toLocaleDateString('fr-FR')
                      : '-'
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}