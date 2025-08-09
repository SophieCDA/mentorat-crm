// components/contacts/ContactModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types/contact.types';
import { apiClient } from '@/lib/api/client';

// Types pour les tags
interface Tag {
  id: number;
  nom: string;
  couleur: string;
  description?: string;
}

interface TagsResponse {
  tags: Tag[];
}

interface ContactModalProps {
  contact?: Contact;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

export default function ContactModal({ contact, onClose, onSave }: ContactModalProps) {
  const [formData, setFormData] = useState<Partial<Contact>>({
    email: '',
    email_autorise: false,
    nom: '',
    prenom: '',
    telephone: '',
    pays: 'France',
    ville: '',
    code_postal: '',
    adresse: '',
    entreprise: '',
    numero_tva: '',
    source: 'Site web',
    date_creation: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personnel' | 'entreprise' | 'autres'>('personnel');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    loadTags();
    if (contact) {
      setFormData(contact);
      setSelectedTags(contact.tags?.map(tag => tag.id) || []);
    }
  }, [contact]);

  const loadTags = async () => {
    try {
      const response = await apiClient.get<TagsResponse | Tag[]>('/api/tags');
      
      // Gérer différents formats de réponse
      if (Array.isArray(response)) {
        setTags(response);
      } else if (response && typeof response === 'object' && 'tags' in response) {
        setTags(response.tags);
      } else {
        // Fallback avec des tags par défaut
        setTags([
          { id: 1, nom: 'Nouveau', couleur: '#10B981' },
          { id: 2, nom: 'Prospect', couleur: '#3B82F6' },
          { id: 3, nom: 'Newsletter', couleur: '#7978E2' },
          { id: 4, nom: 'Client', couleur: '#F22E77' },
          { id: 5, nom: 'VIP', couleur: '#F59E0B' }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      // Tags par défaut en cas d'erreur
      setTags([
        { id: 1, nom: 'Nouveau', couleur: '#10B981' },
        { id: 2, nom: 'Prospect', couleur: '#3B82F6' },
        { id: 3, nom: 'Newsletter', couleur: '#7978E2' },
        { id: 4, nom: 'Client', couleur: '#F22E77' }
      ]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom?.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    if (formData.telephone && !/^[\d\s\-\+\(\)]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Le numéro de téléphone n\'est pas valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Préparer les données avec les tags sélectionnés pour les nouveaux contacts
      const submitData = {
        ...formData,
        ...((!contact && selectedTags.length > 0) && { tags: selectedTags })
      };

      if (contact) {
        // Update existing contact
        const response = await apiClient.put(`/api/contacts/${contact.id_utilisateur}`, submitData);
        onSave({ ...contact, ...formData } as Contact);
      } else {
        // Create new contact
        const response = await apiClient.post('/api/contacts', submitData);
        onSave({ ...formData} as Contact);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Afficher l'erreur à l'utilisateur
      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Une erreur est survenue lors de la sauvegarde' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {contact ? 'Modifier le contact' : 'Nouveau contact'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            {[
              { id: 'personnel', label: 'Informations personnelles', icon: '👤' },
              { id: 'entreprise', label: 'Entreprise', icon: '🏢' },
              { id: 'autres', label: 'Autres', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-crm-purple text-crm-purple'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errors.general && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {activeTab === 'personnel' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-purple/20 ${
                        errors.prenom ? 'border-red-500' : 'border-gray-300 focus:border-crm-purple'
                      }`}
                      placeholder="Jean"
                    />
                    {errors.prenom && (
                      <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-purple/20 ${
                        errors.nom ? 'border-red-500' : 'border-gray-300 focus:border-crm-purple'
                      }`}
                      placeholder="Dupont"
                    />
                    {errors.nom && (
                      <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-purple/20 ${
                      errors.email ? 'border-red-500' : 'border-gray-300 focus:border-crm-purple'
                    }`}
                    placeholder="jean.dupont@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-purple/20 ${
                      errors.telephone ? 'border-red-500' : 'border-gray-300 focus:border-crm-purple'
                    }`}
                    placeholder="06 12 34 56 78"
                  />
                  {errors.telephone && (
                    <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="code_postal"
                      value={formData.code_postal || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                      placeholder="75001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                      placeholder="Paris"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <select
                      name="pays"
                      value={formData.pays || 'France'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'entreprise' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    name="entreprise"
                    value={formData.entreprise || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro TVA
                  </label>
                  <input
                    type="text"
                    name="numero_tva"
                    value={formData.numero_tva || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                    placeholder="FR12345678901"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Information entreprise</p>
                      <p>Ces informations sont optionnelles mais permettent une meilleure gestion de vos contacts professionnels.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'autres' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source || 'Site web'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-purple focus:ring-2 focus:ring-crm-purple/20"
                  >
                    <option value="Site web">Site web</option>
                    <option value="Réseaux sociaux">Réseaux sociaux</option>
                    <option value="Référencement">Référencement</option>
                    <option value="Import">Import</option>
                    <option value="Événement">Événement</option>
                    <option value="Partenaire">Partenaire</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="email_autorise"
                      checked={formData.email_autorise || false}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-crm-purple focus:ring-crm-purple"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Autoriser l'envoi d'emails marketing
                      </span>
                      <p className="text-xs text-gray-500">
                        Le contact accepte de recevoir des communications marketing par email
                      </p>
                    </div>
                  </label>
                </div>

                {!contact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tags initiaux
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <label key={tag.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => handleTagToggle(tag.id)}
                            className="rounded border-gray-300 text-crm-purple focus:ring-crm-purple mr-2"
                          />
                          <span 
                            className="px-3 py-1 rounded-full text-sm hover:opacity-80 transition-opacity text-white"
                            style={{ backgroundColor: tag.couleur }}
                          >
                            {tag.nom}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Conformité RGPD</p>
                      <p>Assurez-vous d'avoir le consentement explicite du contact avant d'activer l'envoi d'emails marketing.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            {contact ? `ID: #${contact.id_utilisateur}` : 'Les champs marqués d\'un * sont obligatoires'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{contact ? 'Modifier' : 'Créer'} le contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}