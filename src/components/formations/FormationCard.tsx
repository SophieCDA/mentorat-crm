import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  MoreVertical, 
  Play, 
  Users, 
  Clock, 
  Euro,
  Star,
  Calendar,
  BookOpen,
  Settings
} from 'lucide-react';

// Types (à importer depuis src/types/formation.types.ts)
interface Formation {
  id: number;
  titre: string;
  description?: string;
  statut: 'draft' | 'published' | 'archived';
  prix: number;
  duree_estimee: number;
  miniature?: string;
  modules: any[];
  date_creation?: string;
  date_publication?: string;
  cree_par?: string;
  nombre_inscrits?: number;
  note_moyenne?: number;
}

interface FormationCardProps {
  formation: Formation;
  view: 'grid' | 'list';
  onEdit?: (formation: Formation) => void;
  onDelete?: (formation: Formation) => void;
  onDuplicate?: (formation: Formation) => void;
  onPublish?: (formation: Formation) => void;
}

const FormationCard: React.FC<FormationCardProps> = ({ 
  formation, 
  view, 
  onEdit,
  onDelete,
  onDuplicate,
  onPublish 
}) => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Couleurs selon le statut
  const getStatusColor = (statut: Formation['statut']) => {
    switch (statut) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statut: Formation['statut']) => {
    switch (statut) {
      case 'published':
        return 'Publié';
      case 'draft':
        return 'Brouillon';
      case 'archived':
        return 'Archivé';
      default:
        return statut;
    }
  };

  // Actions
  const handleEdit = () => {
    if (onEdit) {
      onEdit(formation);
    } else {
      router.push(`/dashboard/formations/${formation.id}/edit`);
    }
  };

  const handleView = () => {
    router.push(`/dashboard/formations/${formation.id}`);
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      setLoading(true);
      try {
        await onDuplicate(formation);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      setLoading(true);
      try {
        await onDelete(formation);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublish = async () => {
    if (onPublish) {
      setLoading(true);
      try {
        await onPublish(formation);
      } finally {
        setLoading(false);
      }
    }
  };

  // Format de date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Image par défaut
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQgNzJMMTY4IDk2SDE0NEgxMjBMMTQ0IDcyWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTc2IDEwOEgxMDRWMTIwSDE3NlYxMDhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';

  if (view === 'list') {
    // Vue liste
    return (
      <div className="bg-white rounded-lg border hover:shadow-md transition-all duration-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Miniature */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={formation.miniature || defaultImage}
                alt={formation.titre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultImage;
                }}
              />
            </div>

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {formation.titre}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(formation.statut)}`}>
                  {getStatusText(formation.statut)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {formation.description || 'Aucune description'}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{formation.modules?.length || 0} modules</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{formation.nombre_inscrits || 0} inscrits</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formation.duree_estimee || 0}h</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Euro size={14} />
                  <span>{formation.prix > 0 ? `${formation.prix}€` : 'Gratuit'}</span>
                </div>

                {formation.note_moyenne && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    <span>{formation.note_moyenne.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleView}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Voir"
            >
              <Eye size={16} />
            </button>
            
            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit size={16} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                title="Plus d'actions"
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <div className="py-1">
                    {formation.statut === 'draft' && (
                      <button
                        onClick={handlePublish}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Play size={14} />
                        Publier
                      </button>
                    )}
                    
                    <button
                      onClick={handleDuplicate}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy size={14} />
                      Dupliquer
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue grille (par défaut)
  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Image de couverture */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={formation.miniature || defaultImage}
          alt={formation.titre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Overlay avec actions au hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <button
              onClick={handleView}
              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              title="Voir"
            >
              <Eye size={16} />
            </button>
            
            <button
              onClick={handleEdit}
              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Badge statut */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(formation.statut)}`}>
            {getStatusText(formation.statut)}
          </span>
        </div>

        {/* Prix */}
        <div className="absolute top-3 right-3">
          <span 
            className="px-2 py-1 text-sm font-bold text-white rounded-full"
            style={{ backgroundColor: '#F22E77' }}
          >
            {formation.prix > 0 ? `${formation.prix}€` : 'Gratuit'}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Titre et description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {formation.titre}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
            {formation.description || 'Aucune description disponible pour cette formation.'}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen size={14} style={{ color: '#42B4B7' }} />
            <span>{formation.modules?.length || 0} modules</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={14} style={{ color: '#7978E2' }} />
            <span>{formation.nombre_inscrits || 0} inscrits</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} style={{ color: '#F22E77' }} />
            <span>{formation.duree_estimee || 0}h estimées</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} style={{ color: '#42B4B7' }} />
            <span>{formatDate(formation.date_creation)}</span>
          </div>
        </div>

        {/* Note moyenne si disponible */}
        {formation.note_moyenne && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(formation.note_moyenne!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {formation.note_moyenne.toFixed(1)}
            </span>
          </div>
        )}

        {/* Actions principales */}
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#F22E77' }}
            disabled={loading}
          >
            <Edit size={16} className="inline mr-2" />
            Modifier
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <MoreVertical size={16} />
            </button>

            {showDropdown && (
              <>
                {/* Overlay pour fermer le dropdown */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                  <div className="py-1">
                    <button
                      onClick={handleView}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Eye size={14} />
                      Voir détails
                    </button>
                    
                    {formation.statut === 'draft' && (
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handlePublish();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                      >
                        <Play size={14} />
                        Publier
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleDuplicate();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy size={14} />
                      Dupliquer
                    </button>
                    
                    <div className="border-t border-gray-100 my-1" />
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleDelete();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationCard;