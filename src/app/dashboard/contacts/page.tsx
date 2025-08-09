// app/dashboard/contacts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contact, ContactFilters } from '@/types/contact.types';
import ContactsTable from '@/components/contacts/ContactsTable';
import ContactsFilters from '@/components/contacts/ContactsFilters';
import ContactsStats from '@/components/contacts/ContactsStats';
import ContactModal from '@/components/contacts/ContactModal';
import { apiClient } from '@/lib/api/client';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({
    sort_by: 'date_creation',
    sort_order: 'desc'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  useEffect(() => {
    loadContacts();
  }, [filters, currentPage, searchTerm]);

  // Type pour la réponse de l'API
  interface ContactsResponse {
    data?: Contact[];
    contacts?: Contact[] | any; // Temporairement any pour gérer la réponse malformée
    total?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  }

  const loadContacts = async () => {
    try {
      setLoading(true);
      
      // Construction des paramètres de requête
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        search: searchTerm || undefined,
        source: filters.source || undefined,
        tags: filters.tags || undefined,
        email_autorise: filters.email_autorise || undefined,
        campagne: filters.campagnes || undefined,
        formation: filters.formations || undefined,
        date_debut: filters.date_debut || undefined,
        date_fin: filters.date_fin || undefined,
      };

      // Appel API pour récupérer les contacts avec typage
      const response = await apiClient.get<ContactsResponse>('/api/contacts', { params });
      
      console.log('Réponse API brute:', response); // Debug
      
      // Gestion de la réponse avec validation
      let contactsData: Contact[] = [];
      
      // Cas 1: response.contacts est un tableau de contacts
      if (Array.isArray(response.contacts) && response.contacts.length > 0 && typeof response.contacts[0] === 'object' && 'id_utilisateur' in response.contacts[0]) {
        contactsData = response.contacts;
      }
      // Cas 2: response.data est un tableau de contacts
      else if (Array.isArray(response.data) && response.data.length > 0 && typeof response.data[0] === 'object') {
        contactsData = response.data;
      }
      // Cas 3: response est directement un tableau de contacts
      else if (Array.isArray(response) && response.length > 0 && typeof response[0] === 'object' && 'id_utilisateur' in response[0]) {
        contactsData = response as unknown as Contact[];
      }
      // Cas 4: réponse malformée comme {"contacts":[[],0]}
      else if (response.contacts && Array.isArray(response.contacts) && response.contacts[0] && Array.isArray(response.contacts[0])) {
        // Si c'est une structure de type [contacts_array, total_count]
        contactsData = response.contacts[0] as Contact[];
        const totalCount = typeof response.contacts[1] === 'number' ? response.contacts[1] : 0;
        setTotalContacts(totalCount);
        setTotalPages(Math.ceil(totalCount / itemsPerPage) || 1);
      }
      // Cas par défaut: pas de contacts
      else {
        contactsData = [];
        console.warn('Format de réponse non reconnu:', response);
      }
      
      // Filtrer les contacts invalides
      const validContacts = contactsData.filter(c => 
        c && typeof c === 'object' && 'id_utilisateur' in c
      );
      
      setContacts(validContacts);
      
      // Gestion de la pagination si pas déjà fait
      if (!response.contacts || !Array.isArray(response.contacts) || !Array.isArray(response.contacts[0])) {
        setTotalPages(response.totalPages || Math.ceil((response.total || validContacts.length) / itemsPerPage) || 1);
        setTotalContacts(response.total || validContacts.length || 0);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      // Afficher une notification d'erreur
      alert('Erreur lors du chargement des contacts. Veuillez réessayer.');
      setContacts([]); // S'assurer que contacts est vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset à la première page lors d'une recherche
  };

  const handleDelete = async (ids: number[]) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${ids.length} contact(s) ?`)) {
      try {
        // Utilisation de deleteMany si disponible dans l'API
        if (apiClient.deleteMany) {
          await apiClient.deleteMany('/contacts', ids);
        } else {
          // Sinon, suppression individuelle
          await Promise.all(
            ids.map(id => apiClient.delete(`/contacts/${id}`))
          );
        }
        
        // Recharger les contacts après suppression
        await loadContacts();
        setSelectedContacts([]);
        
        // Notification de succès
        alert(`${ids.length} contact(s) supprimé(s) avec succès`);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression. Veuillez réessayer.');
      }
    }
  };

  const handleExport = async () => {
    try {
      // Construction des paramètres pour l'export
      const params = {
        format: 'csv', // ou 'xlsx' selon le format souhaité
        ids: selectedContacts.length > 0 ? selectedContacts : undefined,
        ...filters
      };
      
      // Utilisation de la méthode download du apiClient
      await apiClient.download(
        '/contacts/export',
        `contacts_${new Date().toISOString().split('T')[0]}.csv`,
        { params }
      );
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des contacts. Veuillez réessayer.');
    }
  };

  interface ImportResponse {
    imported: number;
    errors?: string[];
    message?: string;
  }

  const handleImport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<ImportResponse>('/contacts/import', formData);
      
      // Recharger les contacts après import
      await loadContacts();
      
      alert(`Import réussi: ${response.imported} contact(s) importé(s)`);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import. Vérifiez le format du fichier.');
    }
  };

  interface BulkResponse {
    success: boolean;
    message?: string;
    affected?: number;
  }

  const handleBulkAddTags = async (tagIds: number[]) => {
    try {
      const response = await apiClient.post<BulkResponse>('/contacts/bulk/tags', {
        contactIds: selectedContacts,
        tagIds: tagIds
      });
      
      await loadContacts();
      setSelectedContacts([]);
      alert(response.message || 'Tags ajoutés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des tags:', error);
      alert('Erreur lors de l\'ajout des tags');
    }
  };

  const handleBulkAddToCampaign = async (campaignId: number) => {
    try {
      const response = await apiClient.post<BulkResponse>(`/campagnes/${campaignId}/contacts`, {
        contactIds: selectedContacts
      });
      
      await loadContacts();
      setSelectedContacts([]);
      alert(response.message || 'Contacts ajoutés à la campagne avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la campagne:', error);
      alert('Erreur lors de l\'ajout à la campagne');
    }
  };

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        handleDelete(selectedContacts);
        break;
      case 'add-tag':
        // TODO: Ouvrir modal pour sélectionner les tags
        console.log('Ouvrir modal tags');
        break;
      case 'add-campaign':
        // TODO: Ouvrir modal pour sélectionner la campagne
        console.log('Ouvrir modal campagne');
        break;
      case 'export':
        handleExport();
        break;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500">
              Gérez vos contacts, leurs tags, campagnes et formations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Import button */}
            <label className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Importer</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            {/* Export button */}
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Exporter</span>
            </button>
            
            {/* Add contact button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouveau contact</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <ContactsStats />
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, email, entreprise..."
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
          <ContactsFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Bulk actions */}
        {selectedContacts.length > 0 && (
          <div className="mt-4 p-3 bg-[#7978E2]/10 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedContacts.length} contact(s) sélectionné(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('add-tag')}
                className="px-3 py-1.5 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Ajouter tags
              </button>
              <button
                onClick={() => handleBulkAction('add-campaign')}
                className="px-3 py-1.5 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Ajouter à campagne
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contacts table */}
      <ContactsTable
        contacts={contacts}
        loading={loading}
        selectedContacts={selectedContacts}
        onSelectionChange={setSelectedContacts}
        onContactClick={(contact) => router.push(`/dashboard/contacts/${contact.id_utilisateur}`)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalContacts)} sur {totalContacts} contacts
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {/* Affichage intelligent de la pagination */}
            {totalPages <= 7 ? (
              [...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))
            ) : (
              <>
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="px-2">...</span>}
                  </>
                )}
                
                {[...Array(5)].map((_, i) => {
                  const pageNum = currentPage - 2 + i;
                  if (pageNum > 0 && pageNum <= totalPages) {
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
                
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </>
            )}
            
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

      {/* Add contact modal */}
      {showAddModal && (
        <ContactModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            loadContacts();
          }}
        />
      )}
    </div>
  );
}