// components/tags/ColorPicker.tsx
'use client';

import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function ColorPicker({ 
  value, 
  onChange, 
  className = '', 
  disabled = false 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  // Couleurs prédéfinies de la charte graphique
  const predefinedColors = [
    { color: '#F22E77', name: 'Rose CRM' },
    { color: '#42B4B7', name: 'Turquoise CRM' },
    { color: '#7978E2', name: 'Violet CRM' },
    { color: '#FFFFFF', name: 'Blanc' },
    { color: '#10B981', name: 'Vert' },
    { color: '#F59E0B', name: 'Orange' },
    { color: '#EF4444', name: 'Rouge' },
    { color: '#8B5CF6', name: 'Violet' },
    { color: '#06B6D4', name: 'Cyan' },
    { color: '#84CC16', name: 'Lime' },
    { color: '#F97316', name: 'Orange foncé' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#6366F1', name: 'Indigo' },
    { color: '#14B8A6', name: 'Teal' },
    { color: '#F472B6', name: 'Rose clair' },
    { color: '#A78BFA', name: 'Violet clair' },
    { color: '#34D399', name: 'Emerald' },
    { color: '#FBBF24', name: 'Amber' },
    { color: '#FB7185', name: 'Rose' },
    { color: '#000000', name: 'Noir' },
    { color: '#6B7280', name: 'Gris' },
    { color: '#9CA3AF', name: 'Gris clair' }
  ];

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Color display button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title="Choisir une couleur"
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-gray-700 font-medium">{value}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Color picker dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Choisir une couleur</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Couleurs prédéfinies */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Couleurs prédéfinies</p>
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map(({ color, name }) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`group relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    value === color 
                      ? 'border-gray-800 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                >
                  {/* Checkmark pour la couleur sélectionnée */}
                  {value === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        className={`w-4 h-4 ${color === '#FFFFFF' || color === '#FBBF24' ? 'text-gray-800' : 'text-white'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {name}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Couleur personnalisée */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-600">Couleur personnalisée</p>
            
            {/* Sélecteur de couleur natif */}
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              
              {/* Input texte pour la couleur hex */}
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setCustomColor(color);
                    if (isValidHexColor(color)) {
                      onChange(color);
                    }
                  }}
                  placeholder="#7978E2"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7978E2]/20 ${
                    isValidHexColor(customColor) 
                      ? 'border-gray-300 focus:border-[#7978E2]' 
                      : 'border-red-300 focus:border-red-500'
                  }`}
                />
                {!isValidHexColor(customColor) && customColor.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">Format invalide (ex: #FF0000)</p>
                )}
              </div>
            </div>

            {/* Aperçu de la couleur personnalisée */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: isValidHexColor(customColor) ? customColor : '#CCCCCC' }}
              />
              <span className="text-sm text-gray-600">
                Aperçu : {isValidHexColor(customColor) ? customColor : 'Couleur invalide'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleColorSelect('#7978E2')}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white text-sm rounded-lg hover:shadow-lg transition-all"
            >
              Valider
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le picker */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Hook personnalisé pour utiliser le ColorPicker facilement
export function useColorPicker(initialColor: string = '#7978E2') {
  const [color, setColor] = useState(initialColor);
  
  return {
    color,
    setColor,
    ColorPicker: (props: Omit<ColorPickerProps, 'value' | 'onChange'>) => (
      <ColorPicker
        {...props}
        value={color}
        onChange={setColor}
      />
    )
  };
}

// Composant ColorPicker simple (sans dropdown)
export function SimpleColorPicker({ 
  value, 
  onChange, 
  className = '' 
}: ColorPickerProps) {
  const predefinedColors = [
    '#F22E77', '#42B4B7', '#7978E2', '#10B981', 
    '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Couleurs prédéfinies */}
      <div className="flex items-center space-x-1">
        {predefinedColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
              value === color 
                ? 'border-gray-800 shadow-lg' 
                : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      
      {/* Sélecteur personnalisé */}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
        title="Couleur personnalisée"
      />
    </div>
  );
}

// Utilitaires pour les couleurs
export const colorUtils = {
  // Convertir hex vers RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Convertir RGB vers hex
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // Déterminer si une couleur est claire ou foncée
  isLightColor: (hex: string): boolean => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return false;
    
    // Calcul de la luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5;
  },

  // Obtenir la couleur de texte optimale (noir ou blanc)
  getTextColor: (backgroundColor: string): string => {
    return colorUtils.isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
  },

  // Générer une couleur aléatoire
  randomColor: (): string => {
    const colors = [
      '#F22E77', '#42B4B7', '#7978E2', '#10B981', 
      '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
      '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Valider un code couleur hex
  isValidHex: (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
};