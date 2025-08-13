// components/formations/FormationModal.tsx
'use client';

import { useState } from 'react';
import { Formation, FormationNiveau, FormationStatus } from '@/types/formation.types';

interface FormationModalProps {
  formation?: Formation;
  onSave: (formation: Formation) => void;
  onClose: () => void;
}

// Schéma de formulaire simple pour générer les champs
type Field = {
  name: keyof Pick<Formation, 'titre' | 'description' | 'prix' | 'duree_estimee'>;
  label: string;
  type: 'text' | 'textarea' | 'number';
};

const fields: Field[] = [
  { name: 'titre', label: 'Titre', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'prix', label: 'Prix (€)', type: 'number' },
  { name: 'duree_estimee', label: 'Durée estimée (h)', type: 'number' },
];

export default function FormationModal({ formation, onSave, onClose }: FormationModalProps) {
  const [formData, setFormData] = useState<Formation>(
    formation || {
      titre: '',
      description: '',
      prix: 0,
      duree_estimee: 0,
      niveau: 'debutant',
      statut: 'brouillon',
      modules: [],
    }
  );

  const handleChange = (name: keyof Formation, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {formation ? 'Modifier la formation' : 'Nouvelle formation'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] as string}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] as number | string}
                  onChange={e => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              )}
            </div>
          ))}

          {/* Sélecteurs niveau et statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                value={formData.niveau}
                onChange={e => handleChange('niveau', e.target.value as FormationNiveau)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.statut}
                onChange={e => handleChange('statut', e.target.value as FormationStatus)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="brouillon">Brouillon</option>
                <option value="active">Active</option>
                <option value="archivee">Archivée</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
            >
              {formation ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
