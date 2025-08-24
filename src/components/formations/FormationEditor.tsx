

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Save, ArrowLeft, Plus, MoreVertical, GripVertical, Trash2, Eye, 
  Type, Image, Video, HelpCircle, Download, Code, List, CheckSquare,
  ChevronDown, ChevronRight, Settings, Copy, Move, X, Upload,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight,
  Palette, Clock, Star, Lock, Unlock, BookOpen, FileText, PlayCircle,
  Layers, Grid, AlertCircle, Check, Loader2, RefreshCw, AlertTriangle,
  Archive, Send
} from 'lucide-react';

// Import des types depuis le fichier de types
import { 
  Formation, 
  Module, 
  Chapter, 
  ContentBlock, 
  ContentType,
  FormationStatus,
  FormationNiveau
} from '@/types/formation.types';

import { formationsAPI } from '@/lib/services/formation.service';

import { useAutoSave, useDragAndDrop } from '@/hooks/useEditor';
import { Toast } from '@/components/formations/editor/Toast';
import { ContentBlockEditor } from './editor/ContentBlockEditor';
import { blockTypesConfig } from '@/types/editor.types';

export default function FormationEditor({ formationId }: { formationId?: string | number }) {
  const [formation, setFormation] = useState<Formation>({
    titre: '',
    description: '',
    prix: 0,
    duree_estimee: 0,
    niveau: 'debutant',
    statut: 'brouillon',
    modules: []
  });
  
  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger la formation si ID fourni, sinon créer une nouvelle
  useEffect(() => {
    if (formationId) {
      loadFormation();
    } else {
      // Créer une formation vide avec un module et chapitre par défaut
      setFormation({
        titre: '',
        description: '',
        prix: 0,
        duree_estimee: 0,
        niveau: 'debutant',
        statut: 'brouillon',
        modules: [{
          id: Date.now(),
          titre: 'Introduction',
          description: '',
          ordre: 1,
          chapitres: [{
            id: Date.now() + 1,
            titre: 'Bienvenue',
            description: '',
            ordre: 1,
            contenu: []
          }]
        }]
      });
    }
  }, [formationId]);

  // Fonction pour charger une formation existante
  const loadFormation = async () => {
    if (!formationId) return;
    
    setIsLoading(true);
    try {
      const data = await formationsAPI.getById(formationId);
      
      if (data) {
        setFormation(data);
        setToast({ message: 'Formation chargée avec succès', type: 'success' });
      } else {
        throw new Error('Formation non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setToast({ message: 'Erreur lors du chargement de la formation', type: 'error' });
      
      // Redirection vers la liste des formations après 2 secondes
      setTimeout(() => {
        window.location.href = '/dashboard/formations';
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save hook
  const handleSave = useCallback(async () => {
    // Validation minimale
    if (!formation.titre.trim()) {
      setToast({ message: 'Le titre est requis', type: 'warning' });
      return;
    }

    setIsSaving(true);
    try {
      let savedFormation;
      
      if (formation.id || formationId) {
        // Mise à jour d'une formation existante
        const id = formation.id || formationId;
        savedFormation = await formationsAPI.update(id!, formation);
        
        if (savedFormation) {
          setFormation(savedFormation);
          setToast({ message: 'Formation mise à jour avec succès', type: 'success' });
        } else {
          throw new Error('Erreur lors de la mise à jour');
        }
      } else {
        // Création d'une nouvelle formation
        savedFormation = await formationsAPI.create(formation);
        
        if (savedFormation && savedFormation.id) {
          setFormation(savedFormation);
          // Mettre à jour l'URL sans recharger la page
          window.history.replaceState({}, '', `/dashboard/formations/${savedFormation.id}/edit`);
          setToast({ message: 'Formation créée avec succès', type: 'success' });
        } else {
          throw new Error('Erreur lors de la création');
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setToast({ message: 'Erreur lors de la sauvegarde. Veuillez réessayer.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [formation, formationId]);

  const { triggerAutoSave, hasChanges } = useAutoSave(formation, handleSave, 500000);

  // Déclencher l'auto-save à chaque modification
  useEffect(() => {
    if (formation.titre) {
      triggerAutoSave();
    }
  }, [formation, triggerAutoSave]);

  // Validation de la formation
  const validateFormation = useCallback((): boolean => {
    const newErrors: string[] = [];
    
    if (!formation.titre) newErrors.push('Le titre est requis');
    if (!formation.description) newErrors.push('La description est requise');
    if (formation.prix < 0) newErrors.push('Le prix doit être positif');
    if (formation.modules.length === 0) newErrors.push('Au moins un module est requis');
    
    formation.modules.forEach((module, mIndex) => {
      if (!module.titre) newErrors.push(`Le titre du module ${mIndex + 1} est requis`);
      if (module.chapitres.length === 0) newErrors.push(`Le module ${mIndex + 1} doit avoir au moins un chapitre`);
      
      module.chapitres.forEach((chapter, cIndex) => {
        if (!chapter.titre) newErrors.push(`Le titre du chapitre ${cIndex + 1} du module ${mIndex + 1} est requis`);
      });
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formation]);

  // Publier la formation
  const handlePublish = useCallback(async () => {
    if (validateFormation()) {
      if (!formation.id && !formationId) {
        setToast({ message: 'Veuillez d\'abord sauvegarder la formation', type: 'warning' });
        return;
      }

      setIsSaving(true);
      try {
        const id = formation.id || formationId;
        const success = await formationsAPI.publish(id!);
        
        if (success) {
          setFormation({ ...formation, statut: 'active' });
          setToast({ message: 'Formation publiée avec succès', type: 'success' });
        } else {
          throw new Error('Erreur lors de la publication');
        }
      } catch (error) {
        console.error('Erreur lors de la publication:', error);
        setToast({ message: 'Erreur lors de la publication', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    } else {
      setToast({ message: 'Veuillez corriger les erreurs avant de publier', type: 'warning' });
    }
  }, [formation, formationId, validateFormation]);

  // Archiver la formation
  const handleArchive = useCallback(async () => {
    if (!formation.id && !formationId) {
      setToast({ message: 'Veuillez d\'abord sauvegarder la formation', type: 'warning' });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir archiver cette formation ?')) {
      setIsSaving(true);
      try {
        const id = formation.id || formationId;
        const success = await formationsAPI.archive(id!);
        
        if (success) {
          setFormation({ ...formation, statut: 'archivee' });
          setToast({ message: 'Formation archivée avec succès', type: 'success' });
        } else {
          throw new Error('Erreur lors de l\'archivage');
        }
      } catch (error) {
        console.error('Erreur lors de l\'archivage:', error);
        setToast({ message: 'Erreur lors de l\'archivage', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  }, [formation, formationId]);

  // Supprimer la formation
  const handleDelete = useCallback(async () => {
    if (!formation.id && !formationId) {
      // Si pas encore sauvegardée, juste rediriger
      window.location.href = '/dashboard/formations';
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
      setIsSaving(true);
      try {
        const id = formation.id || formationId;
        const success = await formationsAPI.delete(id!);
        
        if (success) {
          setToast({ message: 'Formation supprimée avec succès', type: 'success' });
          // Redirection après suppression
          setTimeout(() => {
            window.location.href = '/dashboard/formations';
          }, 1000);
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setToast({ message: 'Erreur lors de la suppression', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  }, [formation, formationId]);

  const currentModule = formation.modules[selectedModule];
  const currentChapter = currentModule?.chapitres[selectedChapter];

  // Drag & Drop pour les blocs
  const {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDrop
  } = useDragAndDrop(
    currentChapter?.contenu || [],
    (reorderedBlocks) => {
      const updatedModules = [...formation.modules];
      updatedModules[selectedModule].chapitres[selectedChapter].contenu = reorderedBlocks;
      setFormation({ ...formation, modules: updatedModules });
    }
  );

  // Gestion des modules
  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      titre: `Module ${formation.modules.length + 1}`,
      description: '',
      ordre: formation.modules.length + 1,
      chapitres: [{
        id: Date.now().toString(),
        titre: 'Nouveau chapitre',
        description: '',
        ordre: 1,
        contenu: []
      }]
    };
    setFormation({ ...formation, modules: [...formation.modules, newModule] });
    setSelectedModule(formation.modules.length);
    setSelectedChapter(0);
  };

  // Gestion des chapitres
  const addChapter = () => {
    if (!currentModule) return;
    
    const newChapter: Chapter = {
      id: Date.now().toString(),
      titre: `Chapitre ${currentModule.chapitres.length + 1}`,
      description: '',
      ordre: currentModule.chapitres.length + 1,
      contenu: []
    };
    
    const updatedModules = [...formation.modules];
    updatedModules[selectedModule].chapitres.push(newChapter);
    setFormation({ ...formation, modules: updatedModules });
    setSelectedChapter(currentModule.chapitres.length);
  };

  // Gestion des blocs
  const addContentBlock = (type: ContentBlock['type']) => {
    if (!currentChapter) return;
    
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      ordre: currentChapter.contenu.length + 1,
      data: {},
      obligatoire: false,
      titre: '',
      description: ''
    };
    
    const updatedModules = [...formation.modules];
    updatedModules[selectedModule].chapitres[selectedChapter].contenu.push(newBlock);
    setFormation({ ...formation, modules: updatedModules });
    setShowBlockSelector(false);
    setToast({ message: 'Bloc ajouté', type: 'success' });
  };

  const updateContentBlock = (blockIndex: number, updatedBlock: ContentBlock) => {
    const updatedModules = [...formation.modules];
    updatedModules[selectedModule].chapitres[selectedChapter].contenu[blockIndex] = updatedBlock;
    setFormation({ ...formation, modules: updatedModules });
  };

  const deleteContentBlock = (blockIndex: number) => {
    const updatedModules = [...formation.modules];
    updatedModules[selectedModule].chapitres[selectedChapter].contenu.splice(blockIndex, 1);
    setFormation({ ...formation, modules: updatedModules });
    setToast({ message: 'Bloc supprimé', type: 'success' });
  };

  const duplicateContentBlock = (blockIndex: number) => {
    const block = currentChapter?.contenu[blockIndex];
    if (!block) return;
    
    const newBlock = { 
      ...block, 
      id: Date.now(),
      titre: `${block.titre} (copie)`
    };
    const updatedModules = [...formation.modules];
    updatedModules[selectedModule].chapitres[selectedChapter].contenu.splice(blockIndex + 1, 0, newBlock);
    setFormation({ ...formation, modules: updatedModules });
    setToast({ message: 'Bloc dupliqué', type: 'success' });
  };

  // Calculer la durée totale
  const totalDuration = useMemo(() => {
    let duration = 0;
    formation.modules.forEach(module => {
      module.chapitres.forEach(chapter => {
        chapter.contenu.forEach(block => {
          if (block.type === 'video' && block.data?.duration) {
            duration += block.data.duration;
          } else if (block.type === 'exercise' && block.data?.estimatedTime) {
            duration += block.data.estimatedTime;
          }
        });
      });
    });
    return Math.round(duration / 60); // Convertir en heures
  }, [formation]);

  // Mettre à jour automatiquement la durée estimée
  useEffect(() => {
    if (totalDuration > 0) {
      setFormation(prev => ({ ...prev, duree_estimee: totalDuration }));
    }
  }, [totalDuration]);

  const blockTypes: ContentType[] = ['text', 'video', 'image', 'quiz', 'download', 'exercise'];

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7978E2] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => window.location.href = '/dashboard/formations'}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <div className="flex items-center space-x-2">
              {hasChanges && !isSaving && (
                <span className="text-xs text-yellow-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non sauvegardé
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || !formation.titre}
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    {formationId ? 'Mettre à jour' : 'Sauvegarder'}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {lastSaved && (
            <p className="text-xs text-gray-500 flex items-center">
              <Check className="w-3 h-3 mr-1 text-green-500" />
              {formationId ? 'Mis à jour' : 'Sauvegardé'} à {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Informations de la formation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            value={formation.titre}
            onChange={(e) => setFormation({ ...formation, titre: e.target.value })}
            placeholder="Nom de la formation"
            className="w-full text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
          />
          <textarea
            value={formation.description}
            onChange={(e) => setFormation({ ...formation, description: e.target.value })}
            placeholder="Description courte"
            rows={2}
            className="w-full mt-2 text-sm text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
          />
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs text-gray-500">Prix</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formation.prix}
                  onChange={(e) => setFormation({ ...formation, prix: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
                />
                <span className="text-sm text-gray-500">€</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Durée</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formation.duree_estimee}
                  onChange={(e) => setFormation({ ...formation, duree_estimee: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
                />
                <span className="text-sm text-gray-500">h</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Niveau</label>
              <select
                value={formation.niveau}
                onChange={(e) => setFormation({ ...formation, niveau: e.target.value as any })}
                className="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
              >
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Statut</label>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  formation.statut === 'active' ? 'bg-green-500' : 
                  formation.statut === 'archivee' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm capitalize">{
                  formation.statut === 'active' ? 'Active' :
                  formation.statut === 'archivee' ? 'Archivée' : 'Brouillon'
                }</span>
              </div>
            </div>
          </div>
        </div>

        {/* Structure */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Structure</h3>
              <button
                onClick={addModule}
                className="text-sm text-[#7978E2] hover:text-[#F22E77] transition-colors"
              >
                + Module
              </button>
            </div>
            
            <div className="space-y-2">
              {formation.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSelectedModule(moduleIndex)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      selectedModule === moduleIndex ? 'bg-gradient-to-r from-[#7978E2]/10 to-[#42B4B7]/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{module.titre}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                      selectedModule === moduleIndex ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {selectedModule === moduleIndex && (
                    <div className="bg-gray-50 px-3 py-2">
                      {module.chapitres.map((chapter, chapterIndex) => (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedChapter(chapterIndex)}
                          className={`w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-white rounded transition-colors ${
                            selectedChapter === chapterIndex ? 'bg-white shadow-sm' : ''
                          }`}
                        >
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{chapter.titre}</span>
                          {chapter.contenu.length > 0 && (
                            <span className="ml-auto text-xs text-gray-500">
                              {chapter.contenu.length}
                            </span>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={addChapter}
                        className="w-full px-3 py-2 text-left text-sm text-[#7978E2] hover:text-[#F22E77] transition-colors"
                      >
                        + Ajouter un chapitre
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          {formation.statut === 'brouillon' && (
            <button
              onClick={handlePublish}
              disabled={isSaving || !formation.titre}
              className="w-full py-2 bg-gradient-to-r from-[#42B4B7] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publier la formation
                </>
              )}
            </button>
          )}
          
          {formation.statut === 'active' && (
            <button
              onClick={handleArchive}
              disabled={isSaving}
              className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2" />
                  Archiver la formation
                </>
              )}
            </button>
          )}
          
          {formation.statut === 'archivee' && (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Republier la formation
                </>
              )}
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer la formation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentChapter?.titre || 'Sélectionnez un chapitre'}
              </h2>
              {currentChapter && (
                <p className="text-sm text-gray-500 mt-1">
                  {currentModule?.titre} • {currentChapter.contenu.length} bloc{currentChapter.contenu.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Éditer' : 'Prévisualiser'}
              </button>
              <button
                onClick={() => setShowBlockSelector(!showBlockSelector)}
                disabled={!currentChapter}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#42B4B7] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un bloc
              </button>
            </div>
          </div>
        </div>

        {/* Sélecteur de blocs */}
        {showBlockSelector && currentChapter && (
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Choisir un type de bloc</h3>
              <button
                onClick={() => setShowBlockSelector(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {blockTypes.map((type) => {
                const config = blockTypesConfig[type];
                return (
                  <button
                    key={type}
                    onClick={() => addContentBlock(type)}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#7978E2] hover:bg-gradient-to-r hover:from-[#7978E2]/5 hover:to-[#42B4B7]/5 transition-all group"
                  >
                    <div className={`p-2 rounded-lg ${config.color} mr-3`}>
                      <config.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{config.label}</p>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Veuillez corriger les erreurs suivantes :</p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Zone de contenu */}
        <div className="flex-1 overflow-y-auto">
          {currentChapter ? (
            <div className="max-w-4xl mx-auto px-8 py-6">
              {/* Informations du chapitre */}
              <div className="mb-6">
                <input
                  type="text"
                  value={currentChapter.titre}
                  onChange={(e) => {
                    const updatedModules = [...formation.modules];
                    updatedModules[selectedModule].chapitres[selectedChapter].titre = e.target.value;
                    setFormation({ ...formation, modules: updatedModules });
                  }}
                  className="w-full text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                  placeholder="Titre du chapitre"
                />
                <textarea
                  value={currentChapter.description || ''}
                  onChange={(e) => {
                    const updatedModules = [...formation.modules];
                    updatedModules[selectedModule].chapitres[selectedChapter].description = e.target.value;
                    setFormation({ ...formation, modules: updatedModules });
                  }}
                  placeholder="Description du chapitre (optionnel)"
                  rows={2}
                  className="w-full mt-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Blocs de contenu */}
              {currentChapter.contenu.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucun contenu pour le moment</p>
                  <button
                    onClick={() => setShowBlockSelector(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#42B4B7] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter votre premier bloc
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentChapter.contenu.map((block, index) => (
                    <div
                      key={block.id}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <ContentBlockEditor
                        block={block}
                        onUpdate={(updatedBlock) => updateContentBlock(index, updatedBlock)}
                        onDelete={() => deleteContentBlock(index)}
                        onDuplicate={() => duplicateContentBlock(index)}
                        isDragging={draggedItem === index}
                        isOver={dragOverItem === index}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-2">Sélectionnez un chapitre</p>
                <p className="text-sm text-gray-400">Choisissez un module et un chapitre dans la barre latérale</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}