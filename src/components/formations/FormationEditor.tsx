import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, ArrowLeft, Plus, MoreVertical, GripVertical, Trash2, Eye, 
  Type, Image, Video, HelpCircle, Download, Code, List, CheckSquare,
  ChevronDown, ChevronRight, Settings, Copy, Move, X, Upload,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight,
  Palette, Clock, Star, Lock, Unlock, BookOpen, FileText, PlayCircle,
  Layers, Grid, AlertCircle, Check
} from 'lucide-react';
import { Formation, Module, Chapter, ContentBlock, ContentType } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';

// Types pour les blocs de contenu
interface BlockType {
  type: ContentType;
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  description: string;
}

const blockTypes: { [key: string]: BlockType } = {
  text: { 
    type: 'text', 
    icon: Type, 
    label: 'Texte', 
    color: 'bg-blue-500',
    description: 'Paragraphe, titre ou liste'
  },
  video: { 
    type: 'video', 
    icon: Video, 
    label: 'Vidéo', 
    color: 'bg-red-500',
    description: 'YouTube, Vimeo ou upload'
  },
  image: { 
    type: 'image', 
    icon: Image, 
    label: 'Image', 
    color: 'bg-green-500',
    description: 'Image ou galerie'
  },
  quiz: { 
    type: 'quiz', 
    icon: HelpCircle, 
    label: 'Quiz', 
    color: 'bg-purple-500',
    description: 'Questions à choix multiples'
  },
  download: { 
    type: 'download', 
    icon: Download, 
    label: 'Fichier', 
    color: 'bg-yellow-500',
    description: 'PDF, ZIP ou autres'
  },
  exercise: { 
    type: 'exercise', 
    icon: CheckSquare, 
    label: 'Exercice', 
    color: 'bg-indigo-500',
    description: 'Travail pratique'
  }
};

// Composant pour l'éditeur de texte riche
const RichTextEditor = ({ content, onChange }: { content: string; onChange: (content: string) => void }) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
        <button
          onClick={() => execCommand('bold')}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${isBold ? 'bg-gray-200' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${isItalic ? 'bg-gray-200' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('underline')}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${isUnderline ? 'bg-gray-200' : ''}`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => execCommand('justifyLeft')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => {
            const url = prompt('Entrez l\'URL du lien:');
            if (url) execCommand('createLink', url);
          }}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] focus:outline-none"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

// Composant pour un bloc de contenu
const ContentBlockEditor = ({ 
  block, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown 
}: {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const blockType = blockTypes[block.type];

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <RichTextEditor
            content={block.data?.content || ''}
            onChange={(content) => onUpdate({ ...block, data: { ...block.data, content } })}
          />
        );
      
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de la vidéo</label>
              <input
                type="text"
                value={block.data?.url || ''}
                onChange={(e) => onUpdate({ ...block, data: { ...block.data, url: e.target.value } })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
              />
            </div>
            {block.data?.url && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">Cliquez pour uploader une image</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
            </div>
            <input
              type="text"
              value={block.data?.alt || ''}
              onChange={(e) => onUpdate({ ...block, data: { ...block.data, alt: e.target.value } })}
              placeholder="Texte alternatif (SEO)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
            />
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={block.data?.question || ''}
                onChange={(e) => onUpdate({ ...block, data: { ...block.data, question: e.target.value } })}
                placeholder="Quelle est votre question ?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Réponses</label>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${block.id}`}
                      className="text-[#7978E2] focus:ring-[#7978E2]"
                    />
                    <input
                      type="text"
                      placeholder={`Réponse ${i}`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'download':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">Cliquez pour uploader un fichier</p>
              <p className="text-xs text-gray-500">PDF, ZIP, DOC jusqu'à 50MB</p>
            </div>
            <input
              type="text"
              value={block.data?.title || ''}
              onChange={(e) => onUpdate({ ...block, data: { ...block.data, title: e.target.value } })}
              placeholder="Titre du fichier"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
            />
          </div>
        );
      
      case 'exercise':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
              <textarea
                value={block.data?.instructions || ''}
                onChange={(e) => onUpdate({ ...block, data: { ...block.data, instructions: e.target.value } })}
                placeholder="Décrivez l'exercice à réaliser..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={block.obligatoire}
                  onChange={(e) => onUpdate({ ...block, obligatoire: e.target.checked })}
                  className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2] mr-2"
                />
                <span className="text-sm text-gray-700">Obligatoire pour continuer</span>
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
      {/* Header du bloc */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="cursor-move">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
          <div className={`p-1.5 rounded ${blockType.color}`}>
            <blockType.icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{block.titre || blockType.label}</p>
            <p className="text-xs text-gray-500">{blockType.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {block.obligatoire && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              Obligatoire
            </span>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-10">
                <button
                  onClick={() => {
                    onMoveUp();
                    setShowSettings(false);
                  }}
                  disabled={!canMoveUp}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Move className="w-4 h-4 mr-2" />
                  Monter
                </button>
                <button
                  onClick={() => {
                    onMoveDown();
                    setShowSettings(false);
                  }}
                  disabled={!canMoveDown}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Move className="w-4 h-4 mr-2 rotate-180" />
                  Descendre
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Dupliquer
                </button>
                <div className="border-t border-gray-200 my-2" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenu du bloc */}
      {isExpanded && (
        <div className="p-4">
          {/* Titre du bloc */}
          <div className="mb-4">
            <input
              type="text"
              value={block.titre}
              onChange={(e) => onUpdate({ ...block, titre: e.target.value })}
              placeholder="Titre du bloc (optionnel)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
            />
          </div>
          
          {/* Contenu spécifique au type */}
          {renderBlockContent()}
        </div>
      )}
    </div>
  );
};

// Composant principal de l'éditeur
export default function FormationEditor({ formationId }: { formationId?: string }) {
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

  // Charger la formation si ID fourni
  useEffect(() => {
    if (formationId) {
      loadFormation();
    } else {
      // Créer une formation vide avec un module et un chapitre par défaut
      setFormation({
        ...formation,
        modules: [{
          id: '1',
          titre: 'Module 1',
          description: '',
          ordre: 1,
          chapitres: [{
            id: '1',
            titre: 'Chapitre 1',
            description: '',
            ordre: 1,
            contenu: []
          }]
        }]
      });
    }
  }, [formationId]);

  const loadFormation = async () => {
    if (!formationId) return;
    const data = await formationsAPI.getById(formationId);
    if (data) {
      setFormation(data);
    }
  };

  // Sauvegarder automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (formation.titre) {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formation]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (formationId) {
        await formationsAPI.update(formationId, formation);
      } else {
        const newFormation = await formationsAPI.create(formation);
        if (newFormation?.id) {
          window.history.replaceState({}, '', `/dashboard/formations/${newFormation.id}/edit`);
        }
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentModule = formation.modules[selectedModule];
  const currentChapter = currentModule?.chapitres[selectedChapter];

  // Gestion des modules
  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      titre: `Module ${formation.modules.length + 1}`,
      description: '',
      ordre: formation.modules.length + 1,
      chapitres: [{
        id: Date.now().toString(),
        titre: 'Chapitre 1',
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

  // Gestion des blocs de contenu
  const addContentBlock = (type: ContentType) => {
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
  };

  const duplicateContentBlock = (blockIndex: number) => {
    const block = currentChapter?.contenu[blockIndex];
    if (!block) return;
    
    const newBlock = { ...block, id: Date.now().toString() };
    const updatedModules = [...formation.modules];
    updatedModules[selectedModule].chapitres[selectedChapter].contenu.splice(blockIndex + 1, 0, newBlock);
    setFormation({ ...formation, modules: updatedModules });
  };

  const moveContentBlock = (blockIndex: number, direction: 'up' | 'down') => {
    const updatedModules = [...formation.modules];
    const content = updatedModules[selectedModule].chapitres[selectedChapter].contenu;
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    if (newIndex >= 0 && newIndex < content.length) {
      [content[blockIndex], content[newIndex]] = [content[newIndex], content[blockIndex]];
      setFormation({ ...formation, modules: updatedModules });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar gauche - Structure */}
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
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
          
          {lastSaved && (
            <p className="text-xs text-gray-500 flex items-center">
              <Check className="w-3 h-3 mr-1 text-green-500" />
              Sauvegardé à {lastSaved.toLocaleTimeString()}
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
                  onChange={(e) => setFormation({ ...formation, prix: parseFloat(e.target.value) })}
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
                  onChange={(e) => setFormation({ ...formation, duree_estimee: parseFloat(e.target.value) })}
                  className="w-full text-sm font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
                />
                <span className="text-sm text-gray-500">h</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
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
        </div>

        {/* Structure de la formation */}
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
            
            {/* Liste des modules */}
            <div className="space-y-2">
              {formation.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSelectedModule(moduleIndex)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      selectedModule === moduleIndex ? 'bg-[#7978E2]/10' : ''
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
                  
                  {/* Liste des chapitres */}
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
      </div>

      {/* Zone principale - Éditeur de contenu */}
      <div className="flex-1 flex flex-col">
        {/* Header de l'éditeur */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentChapter?.titre || 'Sélectionnez un chapitre'}
              </h2>
              {currentChapter && (
                <p className="text-sm text-gray-500 mt-1">
                  {currentModule?.titre} • {currentChapter.contenu.length} blocs
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
              {Object.values(blockTypes).map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addContentBlock(blockType.type)}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#7978E2] hover:bg-[#7978E2]/5 transition-all group"
                >
                  <div className={`p-2 rounded-lg ${blockType.color} mr-3`}>
                    <blockType.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{blockType.label}</p>
                    <p className="text-xs text-gray-500">{blockType.description}</p>
                  </div>
                </button>
              ))}
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
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
                    <ContentBlockEditor
                      key={block.id}
                      block={block}
                      onUpdate={(updatedBlock) => updateContentBlock(index, updatedBlock)}
                      onDelete={() => deleteContentBlock(index)}
                      onDuplicate={() => duplicateContentBlock(index)}
                      onMoveUp={() => moveContentBlock(index, 'up')}
                      onMoveDown={() => moveContentBlock(index, 'down')}
                      canMoveUp={index > 0}
                      canMoveDown={index < currentChapter.contenu.length - 1}
                    />
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
    </div>
  );
}