import React, { useState, useEffect } from 'react';
import { 
  Crown, Layout, Plus, Sparkles, ChevronDown, ChevronRight, 
  BookOpen, Move, Trash2, Edit3, GripVertical, Clock, Award,
  Eye, Settings, Target, Users, BarChart3
} from 'lucide-react';
import { Formation, Module, Chapter, ContentBlock, COLORS } from '@/types/formation.types';
import { useDragAndDrop } from '@/hooks/useFormationBuilder';
import { ContentToolbar } from '@/components/formations/builder/ContentToolbar';
import { ContentBlockEditor } from '@/components/formations/builder/ContentBlockEditor';

interface BuilderViewProps {
  formation: Formation;
  addModule: () => void;
  addChapter: (moduleId: number) => void;
  selectedModule: number | null;
  setSelectedModule: (id: number | null) => void;
  selectedChapter: number | null;
  setSelectedChapter: (id: number | null) => void;
  onFormationUpdate: (updates: Partial<Formation>) => void;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  formation,
  addModule,
  addChapter,
  selectedModule,
  setSelectedModule,
  selectedChapter,
  setSelectedChapter,
  onFormationUpdate
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addContentBlock = (moduleId: number, chapterId: number, type: ContentBlock['type']) => {
    const getDefaultContentData = (type: ContentBlock['type']) => {
      switch (type) {
        case 'text':
          return { content: '<p>Votre contenu texte ici...</p>', formatting: 'html' };
        case 'image':
          return { url: '', alt: '', caption: '' };
        case 'video':
          return { url: '', poster: '', autoplay: false };
        case 'quiz':
          return { 
            titre: 'Nouveau Quiz',
            description: 'Description du quiz',
            questions: [],
            temps_limite: 0,
            note_passage: 70,
            tentatives_max: 3
          };
        case 'exercise':
          return {
            titre: 'Nouvel Exercice',
            description: 'Description de l\'exercice',
            steps: [],
            difficulty: 'beginner',
            estimated_time: 30
          };
        default:
          return {};
      }
    };

    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      ordre: 0,
      obligatoire: false,
      data: getDefaultContentData(type)
    };

    const updatedModules = formation.modules.map(m => 
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
    );

    onFormationUpdate({ modules: updatedModules });
  };

  const updateContentBlock = (moduleId: number, chapterId: number, blockId: string, updates: Partial<ContentBlock>) => {
    const updatedModules = formation.modules.map(m => 
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
    );

    onFormationUpdate({ modules: updatedModules });
  };

  const deleteContentBlock = (moduleId: number, chapterId: number, blockId: string) => {
    const updatedModules = formation.modules.map(m => 
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
    );

    onFormationUpdate({ modules: updatedModules });
  };

  const deleteModule = (moduleId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      const updatedModules = formation.modules.filter(m => m.id !== moduleId);
      onFormationUpdate({ modules: updatedModules });
    }
  };

  const deleteChapter = (moduleId: number, chapterId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      const updatedModules = formation.modules.map(m => 
        m.id === moduleId 
          ? { ...m, chapitres: m.chapitres.filter(c => c.id !== chapterId) }
          : m
      );
      onFormationUpdate({ modules: updatedModules });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            Structure Premium de la Formation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Créez une expérience d'apprentissage interactive avec quiz et exercices • Glissez-déposez pour réorganiser
          </p>
        </div>
        <button
          onClick={addModule}
          className="flex items-center gap-3 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Plus size={20} />
          <span>Ajouter un Module</span>
          <Sparkles size={16} />
        </button>
      </div>

      <div className="space-y-6">
        {formation.modules.map((module, index) => (
          <ModuleEditor
            key={module.id}
            module={module}
            index={index}
            isSelected={selectedModule === module.id}
            onSelect={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
            onAddChapter={() => addChapter(module.id)}
            onDelete={() => deleteModule(module.id)}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            addContentBlock={addContentBlock}
            updateContentBlock={updateContentBlock}
            deleteContentBlock={deleteContentBlock}
            deleteChapter={deleteChapter}
          />
        ))}
        
        {formation.modules.length === 0 && (
          <EmptyFormationState onAddModule={addModule} />
        )}
      </div>
    </div>
  );
};

// ======= ÉDITEUR DE MODULE =======
interface ModuleEditorProps {
  module: Module;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onAddChapter: () => void;
  onDelete: () => void;
  selectedChapter: number | null;
  setSelectedChapter: (id: number | null) => void;
  addContentBlock: (moduleId: number, chapterId: number, type: ContentBlock['type']) => void;
  updateContentBlock: (moduleId: number, chapterId: number, blockId: string, updates: Partial<ContentBlock>) => void;
  deleteContentBlock: (moduleId: number, chapterId: number, blockId: string) => void;
  deleteChapter: (moduleId: number, chapterId: number) => void;
}

const ModuleEditor: React.FC<ModuleEditorProps> = ({
  module,
  index,
  isSelected,
  onSelect,
  onAddChapter,
  onDelete,
  selectedChapter,
  setSelectedChapter,
  addContentBlock,
  updateContentBlock,
  deleteContentBlock,
  deleteChapter
}) => {
  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer transition-all duration-300"
        style={{ 
          background: isSelected 
            ? `linear-gradient(135deg, ${module.color || COLORS.secondary} 0%, ${module.color || COLORS.secondary}dd 100%)`
            : 'transparent'
        }}
        onClick={onSelect}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl transform transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
              {module.icon || '📚'}
            </div>
            <div>
              <h3 className={`font-bold text-xl transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                Module {index + 1}: {module.titre}
              </h3>
              <div className={`flex items-center gap-4 mt-1 text-sm transition-colors duration-300 ${isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                <span>{module.chapitres.length} chapitre{module.chapitres.length > 1 ? 's' : ''}</span>
                <span>{module.duree_estimee} min</span>
                <span className="capitalize">{module.difficulty || 'Débutant'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChapter();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
              isSelected 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            <Plus size={16} />
            Chapitre
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`p-2 rounded-lg transition-all ${
              isSelected 
                ? 'text-white/80 hover:bg-white/20' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 space-y-6 animate-slideDown">
          {module.chapitres.map((chapter) => (
            <ChapterEditor
              key={chapter.id}
              module={module}
              chapter={chapter}
              isSelected={selectedChapter === chapter.id}
              onSelect={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
              addContentBlock={addContentBlock}
              updateContentBlock={updateContentBlock}
              deleteContentBlock={deleteContentBlock}
              onDelete={() => deleteChapter(module.id, chapter.id)}
            />
          ))}
          
          {module.chapitres.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Module vide</h3>
              <p className="text-gray-500 mb-6">Ajoutez votre premier chapitre pour commencer</p>
              <button
                onClick={onAddChapter}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Créer un chapitre
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ======= ÉDITEUR DE CHAPITRE =======
interface ChapterEditorProps {
  module: Module;
  chapter: Chapter;
  isSelected: boolean;
  onSelect: () => void;
  addContentBlock: (moduleId: number, chapterId: number, type: ContentBlock['type']) => void;
  updateContentBlock: (moduleId: number, chapterId: number, blockId: string, updates: Partial<ContentBlock>) => void;
  deleteContentBlock: (moduleId: number, chapterId: number, blockId: string) => void;
  onDelete: () => void;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({
  module,
  chapter,
  isSelected,
  onSelect,
  addContentBlock,
  updateContentBlock,
  deleteContentBlock,
  onDelete
}) => {
  const {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(chapter.contenu, (newContent) => {
    // Cette fonction sera appelée pour mettre à jour l'ordre des contenus
    // mais nous devons la connecter avec updateContentBlock
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          {isSelected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {chapter.ordre + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{chapter.titre}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{chapter.contenu.length} élément{chapter.contenu.length > 1 ? 's' : ''}</span>
              <span>{chapter.duree_estimee} min</span>
              {chapter.completion_rate !== undefined && (
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {chapter.completion_rate}%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {chapter.obligatoire ? 'Obligatoire' : 'Optionnel'}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-4">
          <ContentToolbar 
            onAddContent={(type) => addContentBlock(module.id, chapter.id, type)} 
          />
          
          <div className="space-y-4">
            {chapter.contenu.map((block, index) => (
              <ContentBlockEditor
                key={block.id}
                block={block}
                index={index}
                isDragging={draggedItem?.id === block.id}
                isDragOver={dragOverIndex === index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onUpdate={(updates) => updateContentBlock(module.id, chapter.id, block.id, updates)}
                onDelete={() => deleteContentBlock(module.id, chapter.id, block.id)}
              />
            ))}
            
            {chapter.contenu.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex flex-col items-center gap-3">
                  <Move className="text-gray-400" size={32} />
                  <div>
                    <p className="font-medium">Chapitre vide</p>
                    <p className="text-sm">Utilisez la barre d'outils ci-dessus pour ajouter du contenu</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ======= ÉTAT VIDE DE FORMATION =======
const EmptyFormationState: React.FC<{ onAddModule: () => void }> = ({ onAddModule }) => {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Layout className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Votre formation premium vous attend
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Créez une expérience d'apprentissage exceptionnelle avec des quiz interactifs, 
          des exercices pratiques et du contenu multimédia de qualité professionnelle.
        </p>
        <div className="space-y-3">
          <button
            onClick={onAddModule}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all mx-auto"
          >
            <Crown className="w-6 h-6" />
            <span>Créer mon premier module</span>
            <Sparkles className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ✨ Fonctionnalités premium : Quiz interactifs • Exercices guidés • Analytics avancées
          </p>
        </div>
      </div>
    </div>
  );
};