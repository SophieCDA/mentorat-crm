import React, { useState, useRef } from 'react';
import { Upload, Image, Edit3, Trash2, Loader, ImageIcon } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFormationBuilder';
import { useNotifications } from '@/contexts/NotificationContext';

interface PremiumImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  placeholder?: string;
}

export const PremiumImageUploader: React.FC<PremiumImageUploaderProps> = ({ 
  onImageUploaded, 
  currentImage, 
  placeholder = "Glissez votre image ici ou cliquez pour parcourir" 
}) => {
  const { uploadFile, uploading, progress } = useFileUpload();
  const { addNotification } = useNotifications();
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addNotification('Veuillez sélectionner une image valide', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      addNotification('L\'image ne doit pas dépasser 10MB', 'error');
      return;
    }

    try {
      setPreview(URL.createObjectURL(file));
      const url = await uploadFile(file);
      onImageUploaded(url);
      addNotification('Image téléversée avec succès', 'success');
    } catch (error) {
      addNotification('Erreur lors du téléversement', 'error');
      setPreview(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {uploading ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Téléversement... {progress}%</p>
            </div>
          </div>
        ) : preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Aperçu" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onImageUploaded('');
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
              <Image className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
            </div>
            <p className="text-gray-600 mb-2">{placeholder}</p>
            <p className="text-sm text-gray-400">PNG, JPG, GIF jusqu'à 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};