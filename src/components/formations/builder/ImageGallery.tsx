import { useNotifications } from "@/contexts/NotificationContext";
import { useFileUpload } from "@/hooks/useFormationBuilder";
import { Upload, Loader, Trash2, Image } from "lucide-react";
import { useState } from "react";

// Composant pour la galerie d'images
interface PremiumImageGalleryProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
  }
  
  export const PremiumImageGallery: React.FC<PremiumImageGalleryProps> = ({ images, onImagesChange }) => {
    const { uploadFile, uploading, progress } = useFileUpload();
    const { addNotification } = useNotifications();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
    const handleMultipleUpload = async (files: FileList) => {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      try {
        const urls = await Promise.all(uploadPromises);
        onImagesChange([...images, ...urls]);
        addNotification(`${urls.length} image(s) ajoutée(s) avec succès`, 'success');
      } catch (error) {
        addNotification('Erreur lors du téléversement multiple', 'error');
      }
    };
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">Galerie d'images</h4>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all">
            <Upload className="w-4 h-4" />
            Ajouter des images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
            />
          </label>
        </div>
  
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-800 font-medium">Téléversement en cours...</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
  
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Galerie ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedImage(image)}
              />
              <button
                onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
  
        {images.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucune image dans la galerie</p>
          </div>
        )}
  
        {/* Modal d'aperçu */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl max-h-full p-4">
              <img src={selectedImage} alt="Aperçu" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          </div>
        )}
      </div>
    );
  };