// components/contacts/ContactInfoCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types/contact.types';

interface ContactInfoCardProps {
  contact: Contact;
  isEditing: boolean;
  onSave: (updatedContact: Partial<Contact>) => void;
}

export default function ContactInfoCard({ contact, isEditing, onSave }: ContactInfoCardProps) {
  const [formData, setFormData] = useState<Partial<Contact>>({});

  useEffect(() => {
    setFormData(contact);
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const InfoField = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
    <div className="flex items-start space-x-3">
      {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  const EditField = ({ label, name, type = 'text', required = false }: { 
    label: string; 
    name: keyof Contact; 
    type?: string; 
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {name === 'email_autorise' ? (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            checked={formData[name] as boolean || false}
            onChange={handleChange}
            className="rounded border-gray-300 text-crm-purple focus:ring-crm-purple"
          />
          <span className="text-sm text-gray-700">Autoriser l'envoi d'emails marketing</span>
        </label>
      ) : (
        <input
          type={type}
          name={name}
          value={(formData[name] as string) || ''}
          onChange={handleChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise"
        />
      )}
    </div>
  );

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Modifier les informations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Informations personnelles</h4>
            <EditField label="Prénom" name="prenom" required />
            <EditField label="Nom" name="nom" required />
            <EditField label="Email" name="email" type="email" required />
            <EditField label="Téléphone" name="telephone" type="tel" />
            <EditField label="Autorisation email" name="email_autorise" />
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Adresse</h4>
            <EditField label="Adresse" name="adresse" />
            <EditField label="Code postal" name="code_postal" />
            <EditField label="Ville" name="ville" />
            <EditField label="Pays" name="pays" />
          </div>

          {/* Entreprise */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Entreprise</h4>
            <EditField label="Entreprise" name="entreprise" />
            <EditField label="Numéro TVA" name="numero_tva" />
          </div>

          {/* Autres */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Autres informations</h4>
            <EditField label="Source" name="source" />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Section Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide border-b pb-2">
            Contact
          </h4>
          
          <InfoField 
            label="Nom complet" 
            value={`${contact.prenom} ${contact.nom}`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          
          <InfoField 
            label="Email" 
            value={contact.email}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21-8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          
          <InfoField 
            label="Téléphone" 
            value={contact.telephone}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Email marketing:</span>
            {contact.email_autorise ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Autorisé
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Non autorisé
              </span>
            )}
          </div>
        </div>

        {/* Section Adresse */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide border-b pb-2">
            Adresse
          </h4>
          
          <InfoField 
            label="Adresse" 
            value={contact.adresse}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          
          <InfoField label="Code postal" value={contact.code_postal} />
          <InfoField label="Ville" value={contact.ville} />
          <InfoField label="Pays" value={contact.pays} />
        </div>

        {/* Section Entreprise */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide border-b pb-2">
            Entreprise
          </h4>
          
          <InfoField 
            label="Entreprise" 
            value={contact.entreprise}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          
          <InfoField label="Numéro TVA" value={contact.numero_tva} />
        </div>

        {/* Section Métadonnées */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide border-b pb-2">
            Informations système
          </h4>
          
          <InfoField 
            label="Date de création" 
            value={new Date(contact.date_creation).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          
          <InfoField 
            label="Source" 
            value={contact.source}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <InfoField 
            label="ID utilisateur" 
            value={`#${contact.id_utilisateur}`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}