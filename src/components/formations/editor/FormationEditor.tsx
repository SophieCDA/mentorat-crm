// components/editor/FormationEditor.tsx
import React, { useState } from 'react';
import { Save, Plus, BookOpen, FileText, X, FolderPlus, FilePlus, Trash2 } from 'lucide-react';
import { Formation, Module, Chapter, ContentBlock } from '@/types/formation.types';
import { Button, Card, Tabs } from '../common';
import { ContentEditor } from '@/components/formations/editor/ContentEditor';
import { StudentPreview } from '@/components/formations/preview/StudentPreview';

interface FormationEditorProps {
  formation: Formation;
  onSave: (formData: Formation) => Promise<void>;
  onCancel: () => void;
}

export const FormationEditor: React.FC<FormationEditorProps> = ({ 
  formation, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Formation>(formation || {
    titre: 'Nouvelle Formation',
    description: '',
    prix: 0,
    duree_estimee: 0,
    niveau: 'debutant',
    modules: []
  });
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setIsSaving] = useState(false);

  const activeModule = formData.modules[activeModuleIndex];
  const activeChapter = activeModule?.chapitres?.[activeChapterIndex];

  const addModule = () => {
    const newModule: Module = {
      id: Date.now(),
      titre: `Module ${formData.modules.length + 1}`,
      description: '',
      ordre: formData.modules.length,
      chapitres: []
    };
    setFormData({
      ...formData,
      modules: [...formData.modules, newModule]
    });
    setActiveModuleIndex(formData.modules.length);
  };

  const addChapter = () => {
    if (!activeModule) return;
    
    const updatedModules = [...formData.modules];
    const newChapter: Chapter = {
      id: Date.now(),
      titre: `Chapitre ${activeModule.chapitres.length + 1}`,
      description: '',
      ordre: activeModule.chapitres.length,
      contenu: []
    };
    updatedModules[activeModuleIndex].chapitres = [
      ...(activeModule.chapitres || []),
      newChapter
    ];
    setFormData({ ...formData, modules: updatedModules });
    setActiveChapterIndex(activeModule.chapitres.length);
  };

  const updateModuleTitle = (index: number, title: string) => {
    const updatedModules = [...formData.modules];
    updatedModules[index].titre = title;
    setFormData({ ...formData, modules: updatedModules });
  };

  const updateChapterTitle = (moduleIndex: number, chapterIndex: number, title: string) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].chapitres[chapterIndex].titre = title;
    setFormData({ ...formData, modules: updatedModules });
  };

  const updateChapterContent = (content: ContentBlock[]) => {
    if (!activeModule || !activeChapter) return;
    
    const updatedModules = [...formData.modules];
    updatedModules[activeModuleIndex].chapitres[activeChapterIndex].contenu = content;
    setFormData({ ...formData, modules: updatedModules });
  };

  const deleteModule = (index: number) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updatedModules });
    if (activeModuleIndex >= updatedModules.length) {
      setActiveModuleIndex(Math.max(0, updatedModules.length - 1));
    }
  };

  const deleteChapter = (moduleIndex: number, chapterIndex: number) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].chapitres = updatedModules[moduleIndex].chapitres.filter(
      (_, i) => i !== chapterIndex
    );
    setFormData({ ...formData, modules: updatedModules });
    if (activeChapterIndex >= updatedModules[moduleIndex].chapitres.length) {
      setActiveChapterIndex(Math.max(0, updatedModules[moduleIndex].chapitres.length - 1));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNiveauChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Formation['niveau'];
    setFormData({ ...formData, niveau: value });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Structure */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Structure de la formation</h3>
          
          <div className="space-y-4">
            {formData.modules.map((module, moduleIndex) => (
              <Card key={module.id || moduleIndex} className="overflow-hidden">
                <div 
                  className={`
                    p-3 cursor-pointer flex items-center justify-between
                    ${activeModuleIndex === moduleIndex 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setActiveModuleIndex(moduleIndex)}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span className="font-medium text-sm">{module.titre}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteModule(moduleIndex);
                    }}
                    className="p-1 hover:bg-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {activeModuleIndex === moduleIndex && module.chapitres && (
                  <div className="bg-white border-t">
                    {module.chapitres.map((chapter, chapterIndex) => (
                      <div
                        key={chapter.id || chapterIndex}
                        className={`
                          px-8 py-2 cursor-pointer flex items-center justify-between
                          ${activeChapterIndex === chapterIndex 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'hover:bg-gray-50'
                          }
                        `}
                        onClick={() => setActiveChapterIndex(chapterIndex)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} />
                          <span className="text-sm">{chapter.titre}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(moduleIndex, chapterIndex);
                          }}
                          className="p-1 hover:bg-red-500 hover:text-white rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addChapter}
                      className="w-full px-8 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Ajouter un chapitre
                    </button>
                  </div>
                )}
              </Card>
            ))}
            
            <button
              onClick={addModule}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-gray-600"
            >
              <Plus size={20} />
              Ajouter un module
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre de la formation"
                className="text-2xl font-bold outline-none bg-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.modules.length} modules • {' '}
                {formData.modules.reduce((acc, m) => acc + (m.chapitres?.length || 0), 0)} chapitres
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onCancel} variant="secondary">
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} icon={Save}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="px-8">
            <Tabs
              tabs={[
                { id: 'content', label: 'Contenu' },
                { id: 'settings', label: 'Paramètres' },
                { id: 'preview', label: 'Aperçu' }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'content' && (
            <div>
              {activeModule ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du module
                    </label>
                    <input
                      type="text"
                      value={activeModule.titre}
                      onChange={(e) => updateModuleTitle(activeModuleIndex, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {activeChapter ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre du chapitre
                        </label>
                        <input
                          type="text"
                          value={activeChapter.titre}
                          onChange={(e) => updateChapterTitle(
                            activeModuleIndex, 
                            activeChapterIndex, 
                            e.target.value
                          )}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu du chapitre
                        </label>
                        <ContentEditor
                          contents={activeChapter.contenu || []}
                          onChange={updateChapterContent}
                        />
                      </div>
                    </div>
                  ) : (
                    <Card className="text-center py-12 bg-gray-50">
                      <FilePlus size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">Aucun chapitre sélectionné</p>
                      <Button onClick={addChapter} icon={Plus}>
                        Créer un chapitre
                      </Button>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="text-center py-12 bg-gray-50">
                  <FolderPlus size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Aucun module sélectionné</p>
                  <Button onClick={addModule} icon={Plus}>
                    Créer un module
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Décrivez votre formation..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    value={formData.prix}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      prix: parseFloat(e.target.value) || 0 
                    })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    value={formData.duree_estimee}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      duree_estimee: parseFloat(e.target.value) || 0 
                    })}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={formData.niveau}
                  onChange={handleNiveauChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <StudentPreview formation={formData} />
          )}
        </div>
      </div>
    </div>
  );
};