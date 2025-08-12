// components/preview/StudentPreview.tsx
import React, { useState } from 'react';
import { 
  Video, PlayCircle, Download, BookOpen, Clock, BarChart, 
  CheckCircle, Circle, ChevronRight, ChevronLeft, HelpCircle, Edit3 
} from 'lucide-react';
import { Formation, ContentBlock } from '@/types/formation.types';
import { Card, Button } from '@/components/formations/common';

interface StudentPreviewProps {
  formation: Formation;
}

export const StudentPreview: React.FC<StudentPreviewProps> = ({ formation }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState(new Set<string>());

  const activeModule = formation.modules[activeModuleIndex];
  const activeChapter = activeModule?.chapitres?.[activeChapterIndex];

  const totalChapters = formation.modules.reduce(
    (acc, m) => acc + (m.chapitres?.length || 0), 
    0
  );
  const progress = totalChapters > 0 
    ? (completedChapters.size / totalChapters) * 100 
    : 0;

  const markAsComplete = () => {
    const chapterId = `${activeModuleIndex}-${activeChapterIndex}`;
    setCompletedChapters(new Set([...completedChapters, chapterId]));
    
    // Navigate to next chapter
    if (activeChapter && activeModuleIndex < formation.modules.length) {
      if (activeChapterIndex < activeModule.chapitres.length - 1) {
        setActiveChapterIndex(activeChapterIndex + 1);
      } else if (activeModuleIndex < formation.modules.length - 1) {
        setActiveModuleIndex(activeModuleIndex + 1);
        setActiveChapterIndex(0);
      }
    }
  };

  const renderContent = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            {block.data.content || ''}
          </div>
        );
      
      case 'video':
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <Video size={48} className="text-gray-400" />
          </div>
        );
      
      case 'quiz':
        return (
          <Card className="p-6 bg-purple-50">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-purple-600 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{block.data.titre || 'Quiz'}</h4>
                <p className="text-gray-600 mb-4">{block.data.description}</p>
                <Button icon={PlayCircle}>Commencer le quiz</Button>
              </div>
            </div>
          </Card>
        );
      
      case 'exercise':
        return (
          <Card className="p-6 bg-green-50">
            <div className="flex items-start gap-3">
              <Edit3 className="text-green-600 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{block.data.titre || 'Exercice'}</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{block.data.instructions}</p>
              </div>
            </div>
          </Card>
        );
      
      case 'download':
        return (
          <Card className="p-6 bg-blue-50">
            <div className="flex items-start gap-3">
              <Download className="text-blue-600 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">
                  {block.data.titre || 'Ressources'}
                </h4>
                <p className="text-gray-600 mb-4">{block.data.description}</p>
                <Button variant="secondary" icon={Download}>
                  Télécharger
                </Button>
              </div>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  const navigatePrevious = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(activeChapterIndex - 1);
    } else if (activeModuleIndex > 0) {
      setActiveModuleIndex(activeModuleIndex - 1);
      const prevModule = formation.modules[activeModuleIndex - 1];
      setActiveChapterIndex(prevModule.chapitres.length - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <Card className="p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{formation.titre}</h1>
          <p className="text-gray-600 mb-4">{formation.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock size={16} />
                {formation.duree_estimee} heures
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <BarChart size={16} />
                Niveau {formation.niveau}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Progression</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{Math.round(progress)}%</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            <Card className="overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <h3 className="font-semibold">Contenu du cours</h3>
              </div>
              <div className="p-4 space-y-2">
                {formation.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex}>
                    <div 
                      className={`
                        p-3 rounded-lg cursor-pointer transition-colors
                        ${activeModuleIndex === moduleIndex 
                          ? 'bg-purple-50 text-purple-600' 
                          : 'hover:bg-gray-50'
                        }
                      `}
                      onClick={() => {
                        setActiveModuleIndex(moduleIndex);
                        setActiveChapterIndex(0);
                      }}
                    >
                      <h4 className="font-medium text-sm">{module.titre}</h4>
                    </div>
                    {activeModuleIndex === moduleIndex && module.chapitres && (
                      <div className="ml-4 mt-2 space-y-1">
                        {module.chapitres.map((chapter, chapterIndex) => {
                          const isCompleted = completedChapters.has(
                            `${moduleIndex}-${chapterIndex}`
                          );
                          return (
                            <div
                              key={chapterIndex}
                              className={`
                                p-2 rounded cursor-pointer text-sm flex items-center gap-2
                                ${activeChapterIndex === chapterIndex 
                                  ? 'bg-purple-500 text-white' 
                                  : 'hover:bg-gray-100'
                                }
                              `}
                              onClick={() => setActiveChapterIndex(chapterIndex)}
                            >
                              {isCompleted ? (
                                <CheckCircle size={14} className="text-green-500" />
                              ) : (
                                <Circle size={14} />
                              )}
                              <span>{chapter.titre}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            <Card className="p-8">
              {activeChapter ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{activeChapter.titre}</h2>
                    <p className="text-gray-600">
                      Module {activeModuleIndex + 1} • Chapitre {activeChapterIndex + 1}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {activeChapter.contenu && activeChapter.contenu.map((block, index) => (
                      <div key={index}>
                        {renderContent(block)}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t flex justify-between">
                    <Button 
                      variant="secondary"
                      icon={ChevronLeft}
                      onClick={navigatePrevious}
                      disabled={activeModuleIndex === 0 && activeChapterIndex === 0}
                    >
                      Précédent
                    </Button>
                    <Button 
                      icon={CheckCircle}
                      onClick={markAsComplete}
                    >
                      Marquer comme terminé
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Sélectionnez un chapitre pour commencer</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};