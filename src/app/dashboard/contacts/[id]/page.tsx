// app/dashboard/contacts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Contact, Tag, Campaign, Formation, Transaction } from '@/types/contact.types';
import ContactInfoCard from '@/components/contacts/ContactInfoCard';
import ContactTagsManager from '@/components/contacts/ContactTagsManager';
import ContactCampaigns from '@/components/contacts/ContactCampaigns';
import ContactFormations from '@/components/contacts/ContactFormations';
import ContactTransactions from '@/components/contacts/ContactTransactions';
import ContactTimeline from '@/components/contacts/ContactTimeline';
import { apiClient } from '@/lib/api/client';

// Type pour la réponse de l'API
interface ContactResponse {
  data?: Contact;
  contact?: Contact;
  // Pour gérer différents formats de réponse
  [key: string]: any;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'infos' | 'tags' | 'campagnes' | 'formations' | 'transactions' | 'timeline'>('infos');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contactId) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    try {
      setLoading(true);
      
      // Appel API pour récupérer le contact
      const response = await apiClient.get<ContactResponse>(`/api/contacts/${contactId}`);
      
      console.log('Réponse API contact:', response); // Debug
      
      // Gestion des différents formats de réponse possibles
      let contactData: Contact | null = null;
      
      if (response.contact && typeof response.contact === 'object') {
        contactData = response.contact;
      } else if (response.data && typeof response.data === 'object') {
        contactData = response.data;
      } else if (response && typeof response === 'object' && 'id_utilisateur' in response) {
        contactData = response as unknown as Contact;
      }
      
      if (contactData) {
        setContact(contactData);
      } else {
        console.error('Format de réponse non reconnu:', response);
        setContact(null);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du contact:', error);
      // Afficher une notification d'erreur
      alert('Erreur lors du chargement du contact. Veuillez réessayer.');
      setContact(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedContact: Partial<Contact>) => {
    try {
      setSaving(true);
      
      // Appel API pour mettre à jour le contact
      const response = await apiClient.put<ContactResponse>(
        `/api/contacts/${contactId}`, 
        updatedContact
      );
      
      // Recharger le contact après la sauvegarde
      await loadContact();
      setIsEditing(false);
      
      // Notification de succès
      alert('Contact mis à jour avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.')) {
      try {
        // Appel API pour supprimer le contact
        await apiClient.delete(`/api/contacts/${contactId}`);
        
        // Notification de succès
        alert('Contact supprimé avec succès');
        
        // Redirection vers la liste des contacts
        router.push('/dashboard/contacts');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression. Veuillez réessayer.');
      }
    }
  };

  const handleSendEmail = () => {
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  const handleCall = () => {
    if (contact?.telephone) {
      window.location.href = `tel:${contact.telephone}`;
    }
  };

  // Fonction helper pour obtenir les initiales
  const getInitials = (prenom?: string, nom?: string): string => {
    const firstInitial = prenom && prenom.length > 0 ? prenom[0].toUpperCase() : '';
    const lastInitial = nom && nom.length > 0 ? nom[0].toUpperCase() : '';
    return firstInitial + lastInitial || '?';
  };

  // Fonction helper pour obtenir le nom complet
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7978E2]"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-lg mb-2">Contact introuvable</p>
        <p className="text-sm text-gray-400 mb-4">Le contact demandé n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push('/dashboard/contacts')}
          className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
        >
          Retour aux contacts
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'infos', label: 'Informations', icon: '👤' },
    { id: 'tags', label: 'Tags', icon: '🏷️', count: contact.tags?.length },
    { id: 'campagnes', label: 'Campagnes', icon: '📧', count: contact.campagnes?.length },
    { id: 'formations', label: 'Formations', icon: '🎓', count: contact.formations?.length },
    { id: 'transactions', label: 'Transactions', icon: '💳', count: contact.transactions?.length },
    { id: 'timeline', label: 'Historique', icon: '📅' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/contacts')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Retour à la liste"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F22E77] to-[#7978E2] flex items-center justify-center text-white font-bold text-lg">
                {getInitials(contact.prenom, contact.nom)}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getFullName(contact)}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-500">{contact.email || 'Pas d\'email'}</span>
                  {contact.email_autorise && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      Email autorisé
                    </span>
                  )}
                  {contact.entreprise && (
                    <span className="text-sm text-gray-500">• {contact.entreprise}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quick actions */}
            {contact.email && (
              <button 
                onClick={handleSendEmail}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Envoyer un email"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            
            {contact.telephone && (
              <button 
                onClick={handleCall}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Appeler"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : (isEditing ? 'Annuler' : 'Modifier')}
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Supprimer le contact"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#7978E2] text-[#7978E2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
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
        {activeTab === 'infos' && (
          <ContactInfoCard
            contact={contact}
            isEditing={isEditing}
            onSave={handleSave}
          />
        )}
        
        {activeTab === 'tags' && (
          <ContactTagsManager
            contact={contact}
            onUpdate={loadContact}
          />
        )}
        
        {activeTab === 'campagnes' && (
          <ContactCampaigns
            contact={contact}
            onUpdate={loadContact}
          />
        )}
        
        {activeTab === 'formations' && (
          <ContactFormations
            contact={contact}
            onUpdate={loadContact}
          />
        )}
        
        {activeTab === 'transactions' && (
          <ContactTransactions
            contact={contact}
            onUpdate={loadContact}
          />
        )}
        
        {activeTab === 'timeline' && (
          <ContactTimeline
            contactId={contact.id_utilisateur}
          />
        )}
      </div>
    </div>
  );
}