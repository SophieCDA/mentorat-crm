// components/formations/editor/MediaGallery.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, Image, Clock, Check, Grid, List } from 'lucide-react';
import { getMediaUrl } from '@/utils/mediaHelpers';

interface MediaItem {
  id: string;
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  uploadedAt: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  type?: 'image' | 'file';
}

export const MediaGallery = ({ isOpen, onClose, onSelect, type = 'image' }: MediaGalleryProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (isOpen) {
      loadMediaItems();
    }
  }, [isOpen, type]);

  const loadMediaItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/${type}s`);
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data.items || []);
      }
    } catch (error) {
      console.error('Erreur chargement média:', error);
      // Utiliser des données mockées pour le développement
      setMediaItems(getMockMediaItems());
    } finally {
      setLoading(false);
    }
  };

  const getMockMediaItems = (): MediaItem[] => {
    // Données de test pour le développement
    return [
      {
        id: '1',
        url: '/uploads/formations/image1.jpg',
        thumbnail: '/uploads/formations/image1_thumb.jpg',
        filename: 'formation-intro.jpg',
        size: 245632,
        uploadedAt: new Date().toISOString(),
        alt: 'Introduction de la formation',
        width: 1920,
        height: 1080
      },
      {
        id: '2',
        url: '/uploads/formations/image2.jpg',
        thumbnail: '/uploads/formations/image2_thumb.jpg',
        filename: 'chapitre-1.jpg',
        size: 189456,
        uploadedAt: new Date().toISOString(),
        alt: 'Chapitre 1',
        width: 1920,
        height: 1080
      },
      // Ajoutez plus d'items mock si nécessaire
    ];
  };

  const filteredItems = mediaItems.filter(item =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Bibliothèque média
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {/* Barre de recherche */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
              />
            </div>

            {/* Options de vue */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#7978E2] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#7978E2] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7978E2]"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Image className="w-16 h-16 mb-4 text-gray-300" />
              <p>Aucun média trouvé</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-[#7978E2] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getMediaUrl(item.thumbnail || item.url)}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Overlay avec infos */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-sm font-medium truncate">{item.filename}</p>
                      <p className="text-xs opacity-80">{formatFileSize(item.size)}</p>
                    </div>
                  </div>

                  {/* Indicateur de sélection */}
                  {selectedItem?.id === item.id && (
                    <div className="absolute top-2 right-2 bg-[#7978E2] text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-[#7978E2]/10 border border-[#7978E2]'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 mr-4">
                    <img
                      src={getMediaUrl(item.thumbnail || item.url)}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.filename}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>{formatFileSize(item.size)}</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(item.uploadedAt)}</span>
                      {item.width && item.height && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{item.width}x{item.height}px</span>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedItem?.id === item.id && (
                    <div className="ml-4 text-[#7978E2]">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec détails de l'image sélectionnée */}
        {selectedItem && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 mr-4">
                  <img
                    src={getMediaUrl(selectedItem.thumbnail || selectedItem.url)}
                    alt={selectedItem.alt || selectedItem.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedItem.filename}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize(selectedItem.size)}
                    {selectedItem.width && selectedItem.height && (
                      <span className="ml-2">• {selectedItem.width}x{selectedItem.height}px</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploadé le {formatDate(selectedItem.uploadedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Annuler la sélection
                </button>
                <button
                  onClick={handleSelect}
                  className="px-6 py-2 bg-gradient-to-r from-[#7978E2] to-[#42B4B7] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Utiliser cette image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};