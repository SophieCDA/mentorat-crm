// components/tags/TagModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/types/tag.types';

interface TagModalProps {
  tag?: Tag;
  onClose: () => void;
  onSave: (data: { nom: string; couleur: string; description?: string }) => void;
  defaultColor?: string;
}

export default function TagModal({ tag, onClose, onSave, defaultColor = '#7978E2' }: TagModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    couleur: defaultColor,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const predefinedColors = [
    '#F22E77', '#42B4B7', '#7978E2', '#10B981', 
    '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  useEffect(() => {
    if (tag) {
      setFormData({
        nom: tag.nom,
        couleur: tag.couleur,
        description: tag.description || ''
      });
    }
  }, [tag]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.couleur) {
      newErrors.couleur = 'La couleur est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave({
        nom: formData.nom.trim(),
        couleur: formData.couleur,
        description: formData.description.trim() || undefined
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {tag ? 'Modifier le tag' : 'Nouveau tag'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]/20 ${
                errors.nom ? 'border-red-500' : 'border-gray-300 focus:border-[#7978E2]'
              }`}
              placeholder="Ex: VIP, Newsletter, Prospect..."
            />
            {errors.nom && (
              <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur <span className="text-red-500">*</span>
            </label>
            
            {/* Couleurs prédéfinies */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, couleur: color }))}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.couleur === color 
                      ? 'border-gray-800 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Sélecteur de couleur personnalisé */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="couleur"
                value={formData.couleur}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                name="couleur"
                value={formData.couleur}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7978E2]"
                placeholder="#7978E2"
              />
            </div>
            {errors.couleur && (
              <p className="text-red-500 text-xs mt-1">{errors.couleur}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7978E2] focus:ring-2 focus:ring-[#7978E2]/20"
              rows={3}
              placeholder="Description du tag..."
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: formData.couleur }}
              />
              <span className="font-medium text-gray-900">
                {formData.nom || 'Nom du tag'}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50">
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
            className="px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{tag ? 'Modifier' : 'Créer'} le tag</span>
          </button>
        </div>
      </div>
    </div>
  );
}