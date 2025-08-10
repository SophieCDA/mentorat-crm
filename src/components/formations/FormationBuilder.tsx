import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Eye, Settings, Layout, Type, Image, Video, FileText, Link, ChevronDown, ChevronRight, Trash2, Copy, GripVertical, ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react';
import { formationService } from '@/lib/services/formation.service';

// Types (à placer dans src/types/formation.types.ts)
interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'quiz' | 'file' | 'embed';
  ordre: number;
  data: any;
  obligatoire: boolean;
  titre?: string;
}

interface Chapter {
  id: number;
  titre: string;
  description?: string;
  ordre: number;
  duree_estimee: number;
  obligatoire: boolean;
  contenu: ContentBlock[];
}

interface Module {
  id: number;
  titre: string;
  description?: string;
  ordre: number;
  duree_estimee: number;
  obligatoire: boolean;
  chapitres: Chapter[];
}

interface Formation {
  id: number;
  titre: string;
  description?: string;
  statut: 'draft' | 'published' | 'archived';
  prix: number;
  duree_estimee: number;
  miniature?: string;
  modules: Module[];
  date_creation?: string;
  date_publication?: string;
  cree_par?: string;
  nombre_inscrits?: number;
  note_moyenne?: number;
}

interface FormationBuilderProps {
  initialFormation?: Formation;
}

// Composant principal
const FormationBuilder: React.FC<FormationBuilderProps> = ({ initialFormation }) => {
  const router = useRouter();
  
  const [formation, setFormation] = useState<Formation>(
    initialFormation || {
      id: 0,
      titre: 'Ma Nouvelle Formation',
      description: 'Description de ma formation',
      statut: 'draft',
      prix: 0,
      duree_estimee: 0,
      modules: []
    }
  );

  const [activeView, setActiveView] = useState<'builder' | 'preview'>('builder');
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    if (!formation.id) return;
    
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [formation]);

  // Fonctions utilitaires
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSave = async () => {
    setSaving(true);
    try {
      
      if (formation.id) {
        await formationService.updateFormation(formation.id, formation);
      } else {
        const response = await formationService.createFormation(formation);
        setFormation(response.formation);
        router.replace(`/dashboard/formations/${response.formation.id}/edit`);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setErrors(['Erreur lors de la sauvegarde']);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!formation.id) return;
    
    try {
      await formationService.autoSave(formation.id, formation);
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now(),
      titre: `Module ${formation.modules.length + 1}`,
      description: '',
      ordre: formation.modules.length,
      duree_estimee: 0,
      obligatoire: true,
      chapitres: []
    };
    setFormation(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const addChapter = (moduleId: number) => {
    const module = formation.modules.find(m => m.id === moduleId);
    if (!module) return;

    const newChapter: Chapter = {
      id: Date.now(),
      titre: `Chapitre ${module.chapitres.length + 1}`,
      description: '',
      ordre: module.chapitres.length,
      duree_estimee: 0,
      obligatoire: true,
      contenu: []
    };

    setFormation(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, chapitres: [...m.chapitres, newChapter] }
          : m
      )
    }));
  };

  const addContentBlock = (moduleId: number, chapterId: number, type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      ordre: 0,
      obligatoire: false,
      data: getDefaultContentData(type)
    };

    setFormation(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? {
              ...m,
              chapitres: m.chapitres.map(c => 
                c.id === chapterId 
                  ? { ...c, contenu: [...c.contenu, newBlock] }
                  : c
              )
            }
          : m
      )
    }));
  };

  const getDefaultContentData = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return { content: '<p>Votre contenu texte ici...</p>', formatting: 'html' };
      case 'image':
        return { url: '', alt: '', caption: '' };
      case 'video':
        return { url: '', poster: '', autoplay: false };
      case 'audio':
        return { url: '', autoplay: false };
      case 'quiz':
        return { questions: [], type: 'multiple' };
      case 'file':
        return { url: '', filename: '', size: 0 };
      case 'embed':
        return { code: '', height: 400 };
      default:
        return {};
    }
  };

  const updateContentBlock = (moduleId: number, chapterId: number, blockId: string, updates: Partial<ContentBlock>) => {
    setFormation(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? {
              ...m,
              chapitres: m.chapitres.map(c => 
                c.id === chapterId 
                  ? {
                      ...c,
                      contenu: c.contenu.map(block => 
                        block.id === blockId 
                          ? { ...block, ...updates }
                          : block
                      )
                    }
                  : c
              )
            }
          : m
      )
    }));
  };

  const deleteContentBlock = (moduleId: number, chapterId: number, blockId: string) => {
    setFormation(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? {
              ...m,
              chapitres: m.chapitres.map(c => 
                c.id === chapterId 
                  ? {
                      ...c,
                      contenu: c.contenu.filter(block => block.id !== blockId)
                    }
                  : c
              )
            }
          : m
      )
    }));
  };

  const deleteModule = (moduleId: number) => {
    setFormation(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId)
    }));
  };

  const deleteChapter = (moduleId: number, chapterId: number) => {
    setFormation(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, chapitres: m.chapitres.filter(c => c.id !== chapterId) }
          : m
      )
    }));
  };

  // Composant pour la barre d'outils de contenu
  const ContentToolbar = ({ onAddContent }: { onAddContent: (type: ContentBlock['type']) => void }) => (
    <div className="flex flex-wrap gap-2 p-4 bg-white border rounded-lg shadow-sm">
      <button
        onClick={() => onAddContent('text')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Type size={16} />
        Texte
      </button>
      <button
        onClick={() => onAddContent('image')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Image size={16} />
        Image
      </button>
      <button
        onClick={() => onAddContent('video')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Video size={16} />
        Vidéo
      </button>
      <button
        onClick={() => onAddContent('file')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FileText size={16} />
        Fichier
      </button>
      <button
        onClick={() => onAddContent('embed')}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Link size={16} />
        Embed
      </button>
    </div>
  );

  // Composant pour éditer un bloc de contenu
  const ContentBlockEditor = ({ block, onUpdate, onDelete }: {
    block: ContentBlock;
    onUpdate: (updates: Partial<ContentBlock>) => void;
    onDelete: () => void;
  }) => {
    const [isEditing, setIsEditing] = useState(false);

    const renderEditor = () => {
      switch (block.type) {
        case 'text':
          return (
            <div className="space-y-3">
              <textarea
                value={block.data.content?.replace(/<[^>]*>/g, '') || ''}
                onChange={(e) => onUpdate({ data: { ...block.data, content: `<p>${e.target.value}</p>` } })}
                className="w-full p-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Saisissez votre texte..."
              />
            </div>
          );

        case 'image':
          return (
            <div className="space-y-3">
              <input
                type="url"
                value={block.data.url || ''}
                onChange={(e) => onUpdate({ data: { ...block.data, url: e.target.value } })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="URL de l'image"
              />
              <input
                type="text"
                value={block.data.alt || ''}
                onChange={(e) => onUpdate({ data: { ...block.data, alt: e.target.value } })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Texte alternatif"
              />
            </div>
          );

        case 'video':
          return (
            <div className="space-y-3">
              <input
                type="url"
                value={block.data.url || ''}
                onChange={(e) => onUpdate({ data: { ...block.data, url: e.target.value } })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="URL de la vidéo (YouTube, Vimeo, etc.)"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={block.data.autoplay || false}
                  onChange={(e) => onUpdate({ data: { ...block.data, autoplay: e.target.checked } })}
                  className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                Lecture automatique
              </label>
            </div>
          );

        case 'file':
          return (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600">Glissez un fichier ici ou cliquez pour sélectionner</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUpdate({ 
                        data: { 
                          ...block.data, 
                          filename: file.name,
                          size: file.size,
                          url: URL.createObjectURL(file)
                        } 
                      });
                    }
                  }}
                />
              </div>
              {block.data.filename && (
                <p className="text-sm text-gray-600">
                  Fichier sélectionné: {block.data.filename}
                </p>
              )}
            </div>
          );

        case 'embed':
          return (
            <div className="space-y-3">
              <textarea
                value={block.data.code || ''}
                onChange={(e) => onUpdate({ data: { ...block.data, code: e.target.value } })}
                className="w-full p-3 border rounded-lg font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Collez votre code HTML d'intégration ici..."
              />
            </div>
          );

        default:
          return <div>Type de contenu non supporté</div>;
      }
    };

    const renderPreview = () => {
      switch (block.type) {
        case 'text':
          return (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
            />
          );

        case 'image':
          return block.data.url ? (
            <img 
              src={block.data.url} 
              alt={block.data.alt || ''} 
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
              <Image className="text-gray-400" size={48} />
            </div>
          );

        case 'video':
          return block.data.url ? (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <Video className="text-gray-400" size={48} />
              <span className="ml-2 text-gray-600">Vidéo: {block.data.url}</span>
            </div>
          ) : (
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
              <Video className="text-gray-400" size={48} />
            </div>
          );

        case 'file':
          return block.data.filename ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="text-gray-400" size={24} />
              <div>
                <p className="font-medium">{block.data.filename}</p>
                <p className="text-sm text-gray-600">
                  {(block.data.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 h-24 rounded-lg flex items-center justify-center">
              <FileText className="text-gray-400" size={32} />
            </div>
          );

        case 'embed':
          return block.data.code ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm">{block.data.code.substring(0, 100)}...</code>
            </div>
          ) : (
            <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
              <Link className="text-gray-400" size={32} />
            </div>
          );

        default:
          return <div>Contenu non supporté</div>;
      }
    };

    return (
      <div className="border rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <GripVertical className="text-gray-400 cursor-move" size={16} />
            <span className="text-sm font-medium capitalize">{block.type}</span>
            {block.titre && (
              <span className="text-sm text-gray-600">- {block.titre}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm px-2 py-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isEditing ? 'Aperçu' : 'Modifier'}
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {isEditing ? renderEditor() : renderPreview()}
        </div>
      </div>
    );
  };

  // Composant pour afficher un chapitre
  const ChapterEditor = ({ module, chapter }: { module: Module; chapter: Chapter }) => {
    const [isExpanded, setIsExpanded] = useState(selectedChapter === chapter.id);

    useEffect(() => {
      setIsExpanded(selectedChapter === chapter.id);
    }, [selectedChapter, chapter.id]);

    return (
      <div className="border rounded-lg bg-white overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => {
            setIsExpanded(!isExpanded);
            setSelectedChapter(isExpanded ? null : chapter.id);
          }}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h4 className="font-medium">{chapter.titre}</h4>
            <span className="text-sm text-gray-500">
              {chapter.contenu.length} élément(s)
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteChapter(module.id, chapter.id);
            }}
            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4">
            <ContentToolbar 
              onAddContent={(type) => addContentBlock(module.id, chapter.id, type)} 
            />
            
            <div className="space-y-4">
              {chapter.contenu.map((block) => (
                <ContentBlockEditor
                  key={block.id}
                  block={block}
                  onUpdate={(updates) => updateContentBlock(module.id, chapter.id, block.id, updates)}
                  onDelete={() => deleteContentBlock(module.id, chapter.id, block.id)}
                />
              ))}
              
              {chapter.contenu.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun contenu. Utilisez la barre d'outils ci-dessus pour ajouter du contenu.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Composant pour afficher un module
  const ModuleEditor = ({ module }: { module: Module }) => {
    const [isExpanded, setIsExpanded] = useState(selectedModule === module.id);

    useEffect(() => {
      setIsExpanded(selectedModule === module.id);
    }, [selectedModule, module.id]);

    return (
      <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ backgroundColor: isExpanded ? '#42B4B7' : 'white', color: isExpanded ? 'white' : 'black' }}
          onClick={() => {
            setIsExpanded(!isExpanded);
            setSelectedModule(isExpanded ? null : module.id);
          }}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <h3 className="font-semibold text-lg">{module.titre}</h3>
            <span className="text-sm opacity-75">
              {module.chapitres.length} chapitre(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addChapter(module.id);
              }}
              className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors"
              style={{ backgroundColor: isExpanded ? 'rgba(255,255,255,0.2)' : '#F22E77', color: 'white' }}
            >
              <Plus size={16} />
              Chapitre
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteModule(module.id);
              }}
              className="p-1 rounded transition-colors"
              style={{ backgroundColor: isExpanded ? 'rgba(255,255,255,0.2)' : 'transparent' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4 bg-gray-50">
            {module.chapitres.map((chapter) => (
              <ChapterEditor key={chapter.id} module={module} chapter={chapter} />
            ))}
            
            {module.chapitres.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun chapitre. Cliquez sur "Chapitre" pour en ajouter un.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Interface principale
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              Retour
            </button>
            <div>
              <h1 className="text-xl font-bold">{formation.titre}</h1>
              <p className="text-sm text-gray-600">
                {formation.modules.length} module(s) • Statut: {formation.statut}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Indicateur de sauvegarde */}
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check size={16} />
                Sauvegardé
              </div>
            )}
            
            {errors.length > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                Erreurs
              </div>
            )}
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('builder')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'builder' 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout className="inline mr-2" size={16} />
                Éditeur
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'preview' 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="inline mr-2" size={16} />
                Aperçu
              </button>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings size={16} />
              Paramètres
            </button>
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar des paramètres */}
        {showSettings && (
          <div className="w-80 bg-white border-r p-6 space-y-6 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold">Paramètres de la formation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <input
                  type="text"
                  value={formation.titre}
                  onChange={(e) => setFormation(prev => ({ ...prev, titre: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formation.description || ''}
                  onChange={(e) => setFormation(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Prix (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formation.prix}
                  onChange={(e) => setFormation(prev => ({ ...prev, prix: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Statut</label>
                <select
                  value={formation.statut}
                  onChange={(e) => setFormation(prev => ({ ...prev, statut: e.target.value as Formation['statut'] }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Zone principale */}
        <div className="flex-1 p-6 max-h-screen overflow-y-auto">
          {activeView === 'builder' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Structure de la formation</h2>
                <button
                  onClick={addModule}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: '#F22E77' }}
                >
                  <Plus size={20} />
                  Ajouter un Module
                </button>
              </div>

              <div className="space-y-6">
                {formation.modules.map((module) => (
                  <ModuleEditor key={module.id} module={module} />
                ))}
                
                {formation.modules.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Layout className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Votre formation est vide
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Commencez par ajouter votre premier module
                    </p>
                    <button
                      onClick={addModule}
                      className="px-6 py-3 rounded-lg text-white font-medium"
                      style={{ backgroundColor: '#F22E77' }}
                    >
                      Créer mon premier module
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Vue Aperçu
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-4">{formation.titre}</h1>
                  <p className="text-gray-600 text-lg">{formation.description}</p>
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <span className="text-2xl font-bold" style={{ color: '#F22E77' }}>
                      {formation.prix > 0 ? `${formation.prix}€` : 'Gratuit'}
                    </span>
                    <span className="text-gray-600">
                      {formation.modules.length} module(s)
                    </span>
                  </div>
                </div>

                <div className="space-y-8">
                  {formation.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-6 text-white"
                        style={{ backgroundColor: '#7978E2' }}
                      >
                        <h2 className="text-xl font-bold">
                          Module {moduleIndex + 1}: {module.titre}
                        </h2>
                        {module.description && (
                          <p className="mt-2 opacity-90">{module.description}</p>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        {module.chapitres.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="border-l-4 pl-4" style={{ borderColor: '#42B4B7' }}>
                            <h3 className="font-semibold text-lg mb-2">
                              {chapterIndex + 1}. {chapter.titre}
                            </h3>
                            <div className="space-y-4">
                              {chapter.contenu.map((block) => (
                                <div key={block.id} className="bg-gray-50 p-4 rounded-lg">
                                  {/* Aperçu du contenu */}
                                  {block.type === 'text' && (
                                    <div 
                                      className="prose max-w-none"
                                      dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
                                    />
                                  )}
                                  {block.type === 'image' && block.data.url && (
                                    <img 
                                      src={block.data.url} 
                                      alt={block.data.alt || ''} 
                                      className="max-w-full h-auto rounded"
                                    />
                                  )}
                                  {block.type === 'video' && (
                                    <div className="bg-gray-200 rounded p-4 text-center">
                                      <Video size={32} className="mx-auto mb-2 text-gray-500" />
                                      <p className="text-sm text-gray-600">Vidéo: {block.data.url || 'Non configurée'}</p>
                                    </div>
                                  )}
                                  {block.type === 'file' && (
                                    <div className="bg-gray-200 rounded p-4 text-center">
                                      <FileText size={32} className="mx-auto mb-2 text-gray-500" />
                                      <p className="text-sm text-gray-600">Fichier: {block.data.filename || 'Non configuré'}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationBuilder;