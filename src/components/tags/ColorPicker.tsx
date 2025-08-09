// components/tags/ColorPicker.tsx
'use client';

import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

// Couleurs prédéfinies correspondant à votre charte graphique
const predefinedColors = [
  '#F22E77', // Rose CRM
  '#7978E2', // Violet CRM
  '#42B4B7', // Turquoise CRM
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange foncé
  '#EC4899', // Rose
  '#6366F1', // Indigo
];

export const colorUtils = {
  /**
   * Génère une couleur aléatoire parmi les couleurs prédéfinies
   */
  randomColor: (): string => {
    return predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
  },

  /**
   * Convertit une couleur hex en RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Détermine si une couleur est claire ou foncée
   */
  isLightColor: (hex: string): boolean => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return false;
    
    // Calcul de la luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5;
  },

  /**
   * Retourne la couleur de texte appropriée (noir ou blanc) pour une couleur de fond
   */
  getContrastColor: (backgroundColor: string): string => {
    return colorUtils.isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
  },

  /**
   * Valide qu'une couleur est au format hex valide
   */
  isValidHexColor: (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
};

export default function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setShowPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (colorUtils.isValidHexColor(newColor)) {
      onChange(newColor);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Color display button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: value }}
        title={`Couleur: ${value}`}
      >
        {/* Pattern pour visualiser les couleurs claires */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)`,
            backgroundSize: '8px 8px'
          }}
        />
        
        {/* Icône pour indiquer que c'est cliquable */}
        <svg 
          className="w-4 h-4 opacity-60" 
          style={{ color: colorUtils.getContrastColor(value) }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Color picker dropdown */}
      {showPicker && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64">
          {/* Couleurs prédéfinies */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Couleurs prédéfinies</h4>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform ${
                    value === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Couleur personnalisée */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Couleur personnalisée</h4>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (colorUtils.isValidHexColor(e.target.value)) {
                    onChange(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#42B4B7]"
              />
            </div>
            {!colorUtils.isValidHexColor(customColor) && (
              <p className="text-xs text-red-500 mt-1">Format invalide (ex: #FF0000)</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleColorSelect(colorUtils.randomColor())}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Couleur aléatoire
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le picker */}
      {showPicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}