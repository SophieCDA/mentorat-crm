import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, PlayCircle, CheckCircle, Lock, Clock, 
  BookOpen, Download, HelpCircle, Award, Home, User, LogOut,
  Menu, X, FileText, Video, Image, Type, Star,
  ChevronDown, Circle, CheckCircle2, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Formation, Module, Chapter, ContentBlock } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';

interface StudentProgress {
  moduleId: string | number;
  chapterId: string | number;
  completed: boolean;
  progress: number;
  lastAccessed?: Date;
}

export default function StudentFormationView({ formationId }: { formationId: string }) {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [globalProgress, setGlobalProgress] = useState(0);

  // Fonction pour nettoyer et formater le HTML
  const cleanHTML = (html: string): string => {
    // Remplacer les Apple-converted-space par des espaces normaux
    let cleaned = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/g, ' ');
    
    // Supprimer les styles inline qui pourraient casser le design
    cleaned = cleaned.replace(/style="[^"]*"/g, '');
    
    // Supprimer les attributs dir
    cleaned = cleaned.replace(/dir="[^"]*"/g, '');
    
    // Nettoyer les espaces multiples
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    
    // Supprimer les paragraphes vides
    cleaned = cleaned.replace(/<p[^>]*><\/p>/g, '');
    
    return cleaned;
  };

  useEffect(() => {
    loadFormation();
    loadStudentProgress();
  }, [formationId]);

  const loadFormation = async () => {
    setLoading(true);
    try {
      const data = await formationsAPI.getById(formationId);
      if (data) {
        setFormation(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la formation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = () => {
    // Simuler le chargement de la progression
    setStudentProgress([
      { moduleId: '1', chapterId: '1', completed: true, progress: 100 },
      { moduleId: '1', chapterId: '2', completed: true, progress: 100 },
      { moduleId: '1', chapterId: '3', completed: false, progress: 45 },
    ]);
    setGlobalProgress(35);
  };

  const isChapterCompleted = (moduleId: string | number, chapterId: string | number) => {
    return studentProgress.some(
      p => p.moduleId === moduleId && p.chapterId === chapterId && p.completed
    );
  };

  const isChapterLocked = (moduleIndex: number, chapterIndex: number) => {
    // Logique pour déterminer si un chapitre est verrouillé
    if (moduleIndex === 0 && chapterIndex === 0) return false;
    
    if (chapterIndex > 0) {
      const prevChapter = formation?.modules[moduleIndex].chapitres[chapterIndex - 1];
      return prevChapter ? !isChapterCompleted(formation.modules[moduleIndex].id, prevChapter.id) : false;
    }
    
    if (moduleIndex > 0) {
      const prevModule = formation?.modules[moduleIndex - 1];
      const lastChapter = prevModule?.chapitres[prevModule.chapitres.length - 1];
      return lastChapter ? !isChapterCompleted(prevModule.id, lastChapter.id) : false;
    }
    
    return false;
  };

  const navigateToChapter = (moduleIndex: number, chapterIndex: number) => {
    if (!isChapterLocked(moduleIndex, chapterIndex)) {
      setCurrentModuleIndex(moduleIndex);
      setCurrentChapterIndex(chapterIndex);
      if (window.innerWidth < 768) {
        setMobileMenuOpen(false);
      }
    }
  };

  const navigatePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = formation?.modules[currentModuleIndex - 1];
      if (prevModule) {
        setCurrentModuleIndex(currentModuleIndex - 1);
        setCurrentChapterIndex(prevModule.chapitres.length - 1);
      }
    }
  };

  const navigateNext = () => {
    const currentModule = formation?.modules[currentModuleIndex];
    if (!currentModule) return;

    if (currentChapterIndex < currentModule.chapitres.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    } else if (currentModuleIndex < formation.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentChapterIndex(0);
    }
  };

  const markAsCompleted = () => {
    if (!formation) return;
    
    const currentModule = formation.modules[currentModuleIndex];
    const currentChapter = currentModule.chapitres[currentChapterIndex];
    
    setStudentProgress(prev => {
      const existing = prev.find(
        p => p.moduleId === currentModule.id && p.chapterId === currentChapter.id
      );
      
      if (existing) {
        return prev.map(p => 
          p.moduleId === currentModule.id && p.chapterId === currentChapter.id
            ? { ...p, completed: true, progress: 100 }
            : p
        );
      } else {
        return [...prev, {
          moduleId: currentModule.id,
          chapterId: currentChapter.id,
          completed: true,
          progress: 100,
          lastAccessed: new Date()
        }];
      }
    });

    // Naviguer automatiquement au chapitre suivant
    setTimeout(() => navigateNext(), 500);
  };

  const renderContentBlock = (block: ContentBlock) => {
    const getBlockIcon = (type: string) => {
      switch (type) {
        case 'text': return <Type className="w-5 h-5" />;
        case 'video': return <Video className="w-5 h-5" />;
        case 'image': return <Image className="w-5 h-5" />;
        case 'quiz': return <HelpCircle className="w-5 h-5" />;
        case 'download': return <Download className="w-5 h-5" />;
        case 'exercise': return <FileText className="w-5 h-5" />;
        default: return <FileText className="w-5 h-5" />;
      }
    };

    return (
      <div key={block.id} className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {block.titre && (
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-[#7978E2] to-[#42B4B7] rounded-lg text-white mr-3">
              {getBlockIcon(block.type)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{block.titre}</h3>
            {block.obligatoire && (
              <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                Obligatoire
              </span>
            )}
          </div>
        )}
        
        {/* Contenu simulé selon le type */}
        {block.type === 'text' && (
          <div 
            className="prose prose-lg max-w-none text-gray-700 
                       prose-headings:text-gray-900 prose-headings:font-bold
                       prose-p:text-gray-700 prose-p:leading-relaxed
                       prose-strong:text-gray-900 prose-strong:font-semibold
                       prose-a:text-[#7978E2] prose-a:no-underline hover:prose-a:underline
                       prose-ul:list-disc prose-ul:pl-6
                       prose-ol:list-decimal prose-ol:pl-6
                       prose-blockquote:border-l-4 prose-blockquote:border-[#42B4B7] prose-blockquote:pl-4 prose-blockquote:italic
                       [&_p]:mb-4 [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl
                       [&_*]:max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: cleanHTML(block.data?.content || '<p>Contenu du texte ici...</p>')
            }}
          />
        )}
        
        {block.type === 'video' && (
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-white opacity-80" />
          </div>
        )}
        
        {block.type === 'image' && (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <Image className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {block.type === 'quiz' && (
          <div className="bg-[#7978E2]/5 rounded-lg p-6">
            <p className="text-gray-700 mb-4">{block.data?.question || 'Question du quiz'}</p>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <label key={i} className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="radio" name="quiz" className="text-[#7978E2]" />
                  <span className="ml-3">Réponse {i}</span>
                </label>
              ))}
            </div>
            <button className="mt-4 px-6 py-2 bg-gradient-to-r from-[#7978E2] to-[#42B4B7] text-white rounded-lg hover:shadow-lg transition-all">
              Valider la réponse
            </button>
          </div>
        )}
        
        {block.type === 'download' && (
          <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-[#42B4B7] mr-3" />
              <div>
                <p className="font-medium text-gray-900">{block.data?.title || 'Document à télécharger'}</p>
                <p className="text-sm text-gray-500">PDF • 2.5 MB</p>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-[#42B4B7] text-white rounded-lg hover:bg-[#42B4B7]/90 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </button>
          </div>
        )}
        
        {block.type === 'exercise' && (
          <div className="bg-gradient-to-r from-[#F22E77]/5 to-[#7978E2]/5 rounded-lg p-6">
            <p className="text-gray-700 mb-4">{block.data?.instructions || 'Instructions de l\'exercice'}</p>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
              rows={4}
              placeholder="Écrivez votre réponse ici..."
            />
            <button className="mt-3 px-6 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all">
              Soumettre l'exercice
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading || !formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7978E2]"></div>
      </div>
    );
  }

  const currentModule = formation.modules[currentModuleIndex];
  const currentChapter = currentModule?.chapitres[currentChapterIndex];
  const hasPrevious = currentModuleIndex > 0 || currentChapterIndex > 0;
  const hasNext = currentModuleIndex < formation.modules.length - 1 || 
                  currentChapterIndex < (currentModule?.chapitres.length - 1 || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 fixed h-full z-20 lg:relative overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#7978E2] to-[#42B4B7]">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg truncate">
                {formation.titre}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Barre de progression globale */}
            <div className="mt-4">
              <div className="flex justify-between text-white/80 text-sm mb-2">
                <span>Progression</span>
                <span>{globalProgress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${globalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation de la formation */}
          <div className="flex-1 overflow-y-auto py-4">
            {formation.modules.map((module, moduleIndex) => (
              <div key={module.id} className="mb-2">
                <div className="px-6 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 text-sm">
                      Module {module.ordre}: {module.titre}
                    </h3>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  {module.description && (
                    <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                  )}
                </div>
                
                <div className="mt-2">
                  {module.chapitres.map((chapter, chapterIndex) => {
                    const isCompleted = isChapterCompleted(module.id, chapter.id);
                    const isLocked = isChapterLocked(moduleIndex, chapterIndex);
                    const isCurrent = moduleIndex === currentModuleIndex && chapterIndex === currentChapterIndex;
                    
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => navigateToChapter(moduleIndex, chapterIndex)}
                        disabled={isLocked}
                        className={`w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors group ${
                          isCurrent ? 'bg-gradient-to-r from-[#7978E2]/10 to-[#42B4B7]/10 border-l-3 border-[#7978E2]' : ''
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center flex-1">
                          <div className="mr-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : isCurrent ? (
                              <div className="w-5 h-5 rounded-full border-2 border-[#7978E2] bg-white">
                                <div className="w-2 h-2 bg-[#7978E2] rounded-full m-1" />
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <p className={`text-sm ${isCurrent ? 'font-medium text-[#7978E2]' : 'text-gray-700'}`}>
                              {chapter.titre}
                            </p>
                            {chapter.duree_estimee && (
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {chapter.duree_estimee} min
                              </p>
                            )}
                          </div>
                        </div>
                        {chapter.contenu && (
                          <span className="text-xs text-gray-400">
                            {chapter.contenu.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer de la sidebar */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-[#F22E77] to-[#7978E2] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  JD
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Jean Dupont</p>
                  <p className="text-xs text-gray-500">Étudiant</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <button
              onClick={() => window.location.href = '/dashboard/formations'}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Quitter le mode étudiant
            </button>
          </div>
        </div>
      </div>

      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col">
        {/* Header du contenu */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            )}
            
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span>{currentModule?.titre}</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span>Chapitre {currentChapterIndex + 1}</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentChapter?.titre}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{currentChapter?.duree_estimee || 0} min</span>
            </div>
            
            {/* Indicateur de progression du chapitre */}
            <div className="flex items-center space-x-1">
              {currentChapter?.contenu.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-[#7978E2]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Contenu du chapitre */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {currentChapter?.description && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#7978E2]/5 to-[#42B4B7]/5 rounded-lg">
                <p className="text-gray-700">{currentChapter.description}</p>
              </div>
            )}
            
            {/* Blocs de contenu */}
            {currentChapter?.contenu && currentChapter.contenu.length > 0 ? (
              currentChapter.contenu.map(block => renderContentBlock(block))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun contenu disponible pour ce chapitre</p>
              </div>
            )}
            
            {/* Bouton de complétion */}
            {currentChapter?.contenu && currentChapter.contenu.length > 0 && (
              <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Marquer ce chapitre comme terminé
                    </h3>
                    <p className="text-sm text-gray-500">
                      Assurez-vous d'avoir complété tous les éléments obligatoires
                    </p>
                  </div>
                  <button
                    onClick={markAsCompleted}
                    className="px-6 py-3 bg-gradient-to-r from-[#42B4B7] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Marquer comme terminé
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation en bas */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={navigatePrevious}
              disabled={!hasPrevious}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                hasPrevious
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Chapitre {currentChapterIndex + 1} sur {currentModule?.chapitres.length}
              </span>
            </div>
            
            <button
              onClick={navigateNext}
              disabled={!hasNext}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                hasNext
                  ? 'bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white hover:shadow-lg'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}