// hooks/useFormationBuilder.ts
import { useState, useCallback } from 'react';
import { Formation, Module, Chapter, ContentBlock } from '@/types/formation.types';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulation de progression
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Simuler l'upload (remplacer par votre API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setProgress(100);
      
      // URL simulée (remplacer par la vraie URL retournée par votre API)
      const mockUrl = URL.createObjectURL(file);
      
      return mockUrl;
    } catch (error) {
      throw new Error('Erreur lors du téléversement');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  return { uploadFile, uploading, progress };
};

export const useDragAndDrop = (items: any[], setItems: (items: any[]) => void) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, item: any, index: number) => {
    setDraggedItem({ ...item, originalIndex: index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.originalIndex === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const { originalIndex, ...itemWithoutIndex } = draggedItem;
    
    newItems.splice(originalIndex, 1);
    const finalDropIndex = originalIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newItems.splice(finalDropIndex, 0, itemWithoutIndex);

    newItems.forEach((item, index) => {
      item.ordre = index;
    });

    setItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};

export const useFormationActions = (formation: Formation, setFormation: (formation: Formation) => void) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addModule = useCallback(() => {
    const colors = ['#F22E77', '#42B4B7', '#7978E2'];
    const icons = ['📚', '🎯', '🚀', '💡', '🔥', '⭐'];
    
    const newModule: Module = {
      id: Date.now(),
      titre: `Module ${formation.modules.length + 1}`,
      description: 'Description du module',
      ordre: formation.modules.length,
      duree_estimee: 60,
      obligatoire: true,
      chapitres: [],
      color: colors[formation.modules.length % colors.length],
      icon: icons[formation.modules.length % icons.length],
      difficulty: 'beginner'
    };
    
    setFormation({
      ...formation,
      modules: [...formation.modules, newModule]
    });
  }, [formation, setFormation]);

  const addChapter = useCallback((moduleId: number) => {
    const module = formation.modules.find(m => m.id === moduleId);
    if (!module) return;

    const newChapter: Chapter = {
      id: Date.now(),
      titre: `Chapitre ${module.chapitres.length + 1}`,
      description: 'Description du chapitre',
      ordre: module.chapitres.length,
      duree_estimee: 15,
      obligatoire: true,
      contenu: [],
      completion_rate: 0,
      analytics: { views: 0, completions: 0, average_time: 0 }
    };

    setFormation({
      ...formation,
      modules: formation.modules.map(m => 
        m.id === moduleId 
          ? { ...m, chapitres: [...m.chapitres, newChapter] }
          : m
      )
    });
  }, [formation, setFormation]);

  const addContentBlock = useCallback((moduleId: number, chapterId: number, type: ContentBlock['type']) => {
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

    setFormation({
      ...formation,
      modules: formation.modules.map(m => 
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
    });
  }, [formation, setFormation, generateId]);

  const updateContentBlock = useCallback((moduleId: number, chapterId: number, blockId: string, updates: Partial<ContentBlock>) => {
    setFormation({
      ...formation,
      modules: formation.modules.map(m => 
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
    });
  }, [formation, setFormation]);

  const deleteContentBlock = useCallback((moduleId: number, chapterId: number, blockId: string) => {
    setFormation({
      ...formation,
      modules: formation.modules.map(m => 
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
    });
  }, [formation, setFormation]);

  return {
    addModule,
    addChapter,
    addContentBlock,
    updateContentBlock,
    deleteContentBlock
  };
};