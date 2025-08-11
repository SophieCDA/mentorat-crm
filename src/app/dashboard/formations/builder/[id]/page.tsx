// app/dashboard/formations/builder/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Undo, 
  Redo, 
  Settings, 
  Play, 
  Plus,
  Type,
  PlayCircle,
  HelpCircle,
  FileText,
  GripVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Music,
  FileVideo,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Services et types
import { formationService } from '@/lib/services/formation.service';
import { 
  Formation, 
  Module, 
  Chapter, 
  ContentBlock,
  MediaFile 
} from '@/types/formation.types';

// Types locaux pour le builder
interface ContentElement {
  id: string;
  type: 'text' | 'video' | 'quiz' | 'document' | 'image' | 'audio';
  data: any;
  ordre: number;
}

interface BuilderState {
  formation: Formation | null;
  loading: boolean;
  saving: boolean;
  activeModule: number;
  selectedElement: ContentElement | null;
  isPreviewMode: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: string[];
  validationWarnings: string[];
}

// Couleurs de la charte graphique
const colors = {
  primary: '#F22E77',
  secondary: '#42B4B7', 
  accent: '#7978E2',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

const FormationBuilderPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const formationId = parseInt(params?.id as string);
  
  const [state, setState] = useState<BuilderState>({
    formation: null,
    loading: true,
    saving: false,
    activeModule: 0,
    selectedElement: null,
    isPreviewMode: false,
    hasUnsavedChanges: false,
    validationErrors: [],
    validationWarnings: []
  });

  // Auto-save
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>(new Date().toISOString());

  useEffect(() => {
    if (formationId) {
      loadFormation();
    }
  }, [formationId]);

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    if (state.hasUnsavedChanges && state.formation) {
      autosaveTimer.current = setTimeout(() => {
        autosaveFormation();
      }, 30000);
    }

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [state.hasUnsavedChanges, state.formation]);

  const updateState = (updates: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const loadFormation = async () => {
    try {
      updateState({ loading: true });
      
      const response = await formationService.getFormation(formationId);
      const formation = response.formation;
      
      updateState({ 
        formation,
        loading: false,
        hasUnsavedChanges: false
      });
      
      // Valider la formation au chargement
      await validateFormation();
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      router.push('/dashboard/formations');
    }
  };

  const validateFormation = async () => {
    if (!state.formation) return;

    try {
      const response = await formationService.validateFormation(state.formation.id);
      updateState({
        validationErrors: response.errors,
        validationWarnings: response.warnings
      });
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const autosaveFormation = async () => {
    if (!state.formation) return;

    try {
      await formationService.autoSave(state.formation.id, state.formation);
      lastSaved.current = new Date().toISOString();
      updateState({ hasUnsavedChanges: false });
    } catch (error) {
      console.error('Erreur autosave:', error);
    }
  };

  const saveFormation = async () => {
    if (!state.formation) return;

    try {
      updateState({ saving: true });
      
      const response = await formationService.updateFormation(
        state.formation.id, 
        state.formation
      );
      
      updateState({ 
        formation: response.formation,
        hasUnsavedChanges: false,
        saving: false
      });
      
      lastSaved.current = new Date().toISOString();
      await validateFormation();
      
      // Notification de succès
      showNotification('Formation sauvegardée avec succès !', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
      updateState({ saving: false });
    }
  };

  const publishFormation = async () => {
    if (!state.formation) return;

    // Vérifier les erreurs de validation
    if (state.validationErrors.length > 0) {
      showNotification('Corrigez les erreurs avant de publier', 'error');
      return;
    }

    const confirmPublish = confirm(
      'Êtes-vous sûr de vouloir publier cette formation ? Elle sera visible par vos étudiants.'
    );
    if (!confirmPublish) return;

    try {
      await formationService.publishFormation(state.formation.id);
      
      updateState({ 
        formation: { ...state.formation, status: 'published' }
      });
      
      showNotification('Formation publiée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      showNotification('Erreur lors de la publication', 'error');
    }
  };

  const addElement = async (type: ContentElement['type']) => {
    if (!state.formation) return;

    const newElement: ContentElement = {
      id: `element_${Date.now()}`,
      type,
      ordre: getCurrentModule()?.chapitres?.length || 0,
      data: getDefaultElementData(type)
    };

    try {
      // Créer le chapitre via l'API
      const moduleId = getCurrentModule()?.id;
      if (!moduleId) return;

      const chapterData = {
        nom: newElement.data.titre || `Nouveau ${type}`,
        type: (type === 'document' ? 'text' : type === 'image' || type === 'audio' ? 'exercise' : type) as 'text' | 'video' | 'quiz' | 'exercise', // Cast to allowed types
        ordre: newElement.ordre,
        contenu: [newElement.data],
        duree_estimee: newElement.data.duree || 0,
        requis_pour_progression: true
      };

      const response = await formationService.createChapter(moduleId, chapterData);
      
      // Recharger la formation pour avoir les dernières données
      await loadFormation();
      
      updateState({ 
        hasUnsavedChanges: true,
        selectedElement: newElement
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'élément:', error);
      showNotification('Erreur lors de l\'ajout de l\'élément', 'error');
    }
  };

  const updateElement = async (elementId: string, newData: any) => {
    if (!state.formation) return;

    try {
      // Trouver le chapitre correspondant
      const chapter = findChapterByElementId(elementId);
      if (!chapter) return;

      // Mettre à jour le contenu du chapitre
      const updatedContent = chapter.contenu.map(block => 
        block.id === elementId ? { ...block, data: { ...block.data, ...newData } } : block
      );

      await formationService.updateChapterContent(chapter.id, updatedContent);
      
      // Recharger pour avoir les dernières données
      await loadFormation();
      
      updateState({ hasUnsavedChanges: true });
      
      // Mettre à jour l'élément sélectionné
      if (state.selectedElement && state.selectedElement.id === elementId) {
        updateState({
          selectedElement: {
            ...state.selectedElement,
            data: { ...state.selectedElement.data, ...newData }
          }
        });
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const deleteElement = async (elementId: string) => {
    if (!state.formation) return;

    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cet élément ?');
    if (!confirmDelete) return;

    try {
      // Trouver et supprimer le chapitre
      const chapter = findChapterByElementId(elementId);
      if (!chapter) return;

      await formationService.deleteChapter(chapter.id);
      
      // Recharger la formation
      await loadFormation();
      
      updateState({ 
        hasUnsavedChanges: true,
        selectedElement: null
      });

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const addModule = async () => {
    if (!state.formation) return;

    const moduleData = {
      nom: `Module ${(state.formation.modules?.length ?? 0) + 1}`,
      description: 'Description du module...',
      ordre: state.formation.modules?.length || 0,
      status: 'active' as const
    };

    try {
      await formationService.createModule(state.formation.id, moduleData);
      await loadFormation();
      
      updateState({ 
        activeModule: state.formation.modules?.length || 0,
        hasUnsavedChanges: true
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
      showNotification('Erreur lors de l\'ajout du module', 'error');
    }
  };

  const updateFormationInfo = async (field: string, value: any) => {
    if (!state.formation) return;

    const updatedFormation = {
      ...state.formation,
      [field]: value
    };

    updateState({ 
      formation: updatedFormation,
      hasUnsavedChanges: true
    });
  };

  const uploadFile = async (file: File, type: 'image' | 'video' | 'audio' | 'document') => {
    try {
      const response = await formationService.uploadFile(file, type);
      return {
        original_name: response.filename,
        mime_type: response.type,
        uploaded_at: new Date().toISOString(), // Add a timestamp
        url: response.url,
        filename: response.filename,
        size: response.size,
        type: response.type
      } as MediaFile;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      showNotification('Erreur lors de l\'upload du fichier', 'error');
      throw error;
    }
  };

  // Fonctions utilitaires
  const getCurrentModule = () => {
    return state.formation?.modules?.[state.activeModule];
  };

  const findChapterByElementId = (elementId: string): Chapter | null => {
    if (!state.formation?.modules) return null;
    
    for (const module of state.formation.modules) {
      if (module.chapitres) {
        for (const chapter of module.chapitres) {
          if (chapter.contenu?.some(block => block.id === elementId)) {
            return chapter;
          }
        }
      }
    }
    return null;
  };

  const getDefaultElementData = (type: ContentElement['type']) => {
    switch (type) {
      case 'text':
        return {
          titre: 'Nouveau contenu texte',
          content: '<p>Commencez à écrire votre contenu ici...</p>'
        };
      case 'video':
        return {
          titre: 'Nouvelle vidéo',
          url: '',
          duree: 0,
          description: ''
        };
      case 'quiz':
        return {
          titre: 'Nouveau quiz',
          questions: [],
          points: 10,
          tentatives_max: 3
        };
      case 'document':
        return {
          titre: 'Nouveau document',
          description: '',
          filename: '',
          url: ''
        };
      case 'image':
        return {
          titre: 'Nouvelle image',
          url: '',
          alt: '',
          description: ''
        };
      case 'audio':
        return {
          titre: 'Nouvel audio',
          url: '',
          duree: 0,
          description: ''
        };
      default:
        return {};
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Implémentation simple - vous pouvez utiliser une librairie de notifications
    if (type === 'success') {
      alert(`✅ ${message}`);
    } else if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }
  };

  const renderElement = (element: ContentElement) => {
    const isSelected = state.selectedElement?.id === element.id;
    const baseClasses = `relative border-2 rounded-lg p-4 mb-4 cursor-pointer transition-all duration-200 group ${
      isSelected 
        ? 'border-pink-500 bg-pink-50' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

    const handleClick = () => {
      if (!state.isPreviewMode) {
        updateState({ selectedElement: element });
      }
    };

    return (
      <div key={element.id} className={baseClasses} onClick={handleClick}>
        {!state.isPreviewMode && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateState({ selectedElement: element });
              }}
              className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <ElementRenderer element={element} isPreview={state.isPreviewMode} />
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.accent }}
          ></div>
          <p className="text-gray-600">Chargement du builder...</p>
        </div>
      </div>
    );
  }

  if (!state.formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Formation non trouvée</p>
          <button
            onClick={() => router.push('/dashboard/formations')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Retour aux formations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/formations')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{state.formation.titre}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  {state.hasUnsavedChanges ? 'Modifications non sauvegardées' : `Dernière sauvegarde: ${new Date(lastSaved.current).toLocaleTimeString()}`}
                </span>
                {state.validationErrors.length > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {state.validationErrors.length} erreur(s)
                  </span>
                )}
                {state.validationWarnings.length > 0 && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <Info className="w-4 h-4" />
                    {state.validationWarnings.length} avertissement(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateState({ isPreviewMode: !state.isPreviewMode })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                state.isPreviewMode 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              {state.isPreviewMode ? 'Mode Édition' : 'Aperçu'}
            </button>

            <button
              onClick={saveFormation}
              disabled={state.saving || !state.hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {state.saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>

            {state.formation.status !== 'published' && (
              <button
                onClick={publishFormation}
                disabled={state.validationErrors.length > 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Publier
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Sidebar gauche - Éléments */}
          {!state.isPreviewMode && (
            <div className="col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">📚 Éléments</h3>
                
                <div className="space-y-3">
                  {[
                    { type: 'text', icon: Type, title: 'Texte', description: 'Contenu textuel' },
                    { type: 'video', icon: PlayCircle, title: 'Vidéo', description: 'Lecteur vidéo' },
                    { type: 'image', icon: ImageIcon, title: 'Image', description: 'Image illustrative' },
                    { type: 'audio', icon: Music, title: 'Audio', description: 'Fichier audio' },
                    { type: 'quiz', icon: HelpCircle, title: 'Quiz', description: 'Questions interactives' },
                    { type: 'document', icon: FileText, title: 'Document', description: 'Fichier téléchargeable' }
                  ].map(({ type, icon: Icon, title, description }) => (
                    <button
                      key={type}
                      onClick={() => addElement(type as ContentElement['type'])}
                      className="w-full p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-purple-900">{title}</p>
                          <p className="text-xs text-gray-600">{description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Configuration de la formation */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">⚙️ Formation</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input
                        type="text"
                        value={state.formation.titre}
                        onChange={(e) => updateFormationInfo('titre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                      <input
                        type="number"
                        value={state.formation.prix}
                        onChange={(e) => updateFormationInfo('prix', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={state.formation.description}
                        onChange={(e) => updateFormationInfo('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Validation */}
                {(state.validationErrors.length > 0 || state.validationWarnings.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">🔍 Validation</h4>
                    
                    {state.validationErrors.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-red-700 mb-2">Erreurs :</p>
                        <ul className="text-xs text-red-600 space-y-1">
                          {state.validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {state.validationWarnings.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-orange-700 mb-2">Avertissements :</p>
                        <ul className="text-xs text-orange-600 space-y-1">
                          {state.validationWarnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zone centrale - Canvas */}
          <div className={state.isPreviewMode ? 'col-span-12' : 'col-span-6'}>
            <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
              {/* Header du canvas */}
              <div 
                className="p-6 border-b border-gray-200"
                style={{ 
                  background: `linear-gradient(135deg, ${state.formation.couleur_theme || colors.accent}, ${colors.secondary})`,
                  color: 'white'
                }}
              >
                <h2 className="text-xl font-bold">{state.formation.titre}</h2>
                <p className="opacity-90 mt-1">Mode {state.isPreviewMode ? 'Aperçu' : 'Édition'}</p>
              </div>

              {/* Onglets des modules */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex gap-2 flex-wrap">
                  {state.formation.modules?.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => updateState({ activeModule: index })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        index === state.activeModule
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {module.nom}
                    </button>
                  ))}
                  {!state.isPreviewMode && (
                    <button
                      onClick={addModule}
                      className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      + Module
                    </button>
                  )}
                </div>
              </div>

              {/* Contenu du module */}
              <div className="p-6">
                {getCurrentModule()?.chapitres?.length === 0 && !state.isPreviewMode ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Module vide</h3>
                    <p className="text-gray-600 mb-4">Ajoutez votre premier élément pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCurrentModule()?.chapitres?.map((chapter) => 
                      chapter.contenu?.map((contentBlock) => {
                        const element: ContentElement = {
                          id: contentBlock.id.toString(),
                          type: contentBlock.type as ContentElement['type'],
                          data: contentBlock.data,
                          ordre: contentBlock.ordre
                        };
                        return renderElement(element);
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar droite - Propriétés */}
          {!state.isPreviewMode && (
            <div className="col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">⚙️ Propriétés</h3>
                
                {state.selectedElement ? (
                  <ElementPropertiesPanel
                    element={state.selectedElement}
                    onUpdate={(newData) => updateElement(state.selectedElement!.id, newData)}
                    onClose={() => updateState({ selectedElement: null })}
                    onUpload={uploadFile}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Sélectionnez un élément pour modifier ses propriétés</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composants auxiliaires
const ElementRenderer: React.FC<{ 
  element: ContentElement; 
  isPreview: boolean 
}> = ({ element, isPreview }) => {
  switch (element.type) {
    case 'text':
      return (
        <div>
          <h3 className="font-bold text-lg mb-3">{element.data.titre}</h3>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: element.data.content }}
          />
        </div>
      );
    
    case 'video':
      return (
        <div className="text-center p-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg">
          <PlayCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{element.data.titre}</h3>
          <p className="opacity-90">
            {element.data.url ? (
              <>
                <a href={element.data.url} target="_blank" rel="noopener noreferrer" className="underline">
                  Voir la vidéo
                </a>
                {element.data.duree && ` • Durée: ${element.data.duree} min`}
              </>
            ) : (
              'Aucune vidéo configurée'
            )}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className="text-center">
          <h3 className="font-bold text-lg mb-3">{element.data.titre}</h3>
          {element.data.url ? (
            <img 
              src={element.data.url} 
              alt={element.data.alt || element.data.titre}
              className="max-w-full h-auto rounded-lg mx-auto"
            />
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune image sélectionnée</p>
            </div>
          )}
          {element.data.description && (
            <p className="text-gray-600 text-sm mt-2">{element.data.description}</p>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className="text-center p-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
          <Music className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{element.data.titre}</h3>
          <p className="opacity-90">
            {element.data.url ? (
              <>
                <audio controls className="mx-auto">
                  <source src={element.data.url} />
                  Votre navigateur ne supporte pas l'audio.
                </audio>
                {element.data.duree && <br />}
                {element.data.duree && `Durée: ${element.data.duree} min`}
              </>
            ) : (
              'Aucun fichier audio configuré'
            )}
          </p>
        </div>
      );
    
    case 'quiz':
      return (
        <div className="text-center p-8 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{element.data.titre}</h3>
          <p className="opacity-90">
            {element.data.questions?.length || 0} question(s) - {element.data.points} points
          </p>
        </div>
      );
    
    case 'document':
      return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FileText className="w-10 h-10 text-blue-600" />
          <div>
            <h3 className="font-bold">{element.data.titre}</h3>
            <p className="text-gray-600 text-sm">
              {element.data.filename || 'Aucun fichier sélectionné'}
            </p>
            {element.data.url && (
              <a 
                href={element.data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Télécharger
              </a>
            )}
          </div>
        </div>
      );
    
    default:
      return <div className="p-4 bg-gray-100 rounded-lg">Élément non reconnu</div>;
  }
};

const ElementPropertiesPanel: React.FC<{
  element: ContentElement;
  onUpdate: (data: any) => void;
  onClose: () => void;
  onUpload: (file: File, type: 'image' | 'video' | 'audio' | 'document') => Promise<MediaFile>;
}> = ({ element, onUpdate, onClose, onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'document') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedFile = await onUpload(file, type);
      
      handleInputChange('url', uploadedFile.url);
      handleInputChange('filename', uploadedFile.filename);
      
      if (type === 'video' || type === 'audio') {
        handleInputChange('duree', uploadedFile.duree || 0);
      }
      
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Édition: {element.type}</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={element.data.titre || ''}
          onChange={(e) => handleInputChange('titre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {element.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
          <textarea
            value={element.data.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      )}

      {(element.type === 'video' || element.type === 'audio') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier {element.type}
            </label>
            <input
              type="file"
              accept={element.type === 'video' ? 'video/*' : 'audio/*'}
              onChange={(e) => handleFileUpload(e, element.type as 'video' | 'audio')}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (ou upload ci-dessus)</label>
            <input
              type="url"
              value={element.data.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
            <input
              type="number"
              value={element.data.duree || ''}
              onChange={(e) => handleInputChange('duree', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </>
      )}

      {element.type === 'image' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (ou upload ci-dessus)</label>
            <input
              type="url"
              value={element.data.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
            <input
              type="text"
              value={element.data.alt || ''}
              onChange={(e) => handleInputChange('alt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={element.data.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </>
      )}

      {element.type === 'quiz' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input
              type="number"
              value={element.data.points || ''}
              onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tentatives max</label>
            <input
              type="number"
              value={element.data.tentatives_max || 3}
              onChange={(e) => handleInputChange('tentatives_max', parseInt(e.target.value) || 3)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Éditeur de questions avancé disponible bientôt
            </p>
          </div>
        </>
      )}

      {element.type === 'document' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, 'document')}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (ou upload ci-dessus)</label>
            <input
              type="url"
              value={element.data.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier</label>
            <input
              type="text"
              value={element.data.filename || ''}
              onChange={(e) => handleInputChange('filename', e.target.value)}
              placeholder="document.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={element.data.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FormationBuilderPage;