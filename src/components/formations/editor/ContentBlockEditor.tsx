import { ContentBlock } from "@/types/formation.types";
import { PlayCircle, Upload, Check, Download, GripVertical, ChevronDown, ChevronRight, MoreVertical, Copy, Unlock, Trash2, Lock } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "@/components/formations/editor/RichTextEditor";
import { blockTypesConfig } from "@/types/editor.types";

export const ContentBlockEditor = ({ 
    block, 
    onUpdate, 
    onDelete, 
    onDuplicate,
    isDragging,
    isOver
  }: {
    block: ContentBlock;
    onUpdate: (block: ContentBlock) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    isDragging?: boolean;
    isOver?: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const blockType = blockTypesConfig[block.type];
  
    const handleDelete = () => {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete();
      }, 200);
    };
  
    const renderBlockContent = () => {
      switch (block.type) {
        case 'text':
          return (
            <RichTextEditor
              content={block.data?.content || ''}
              onChange={(content) => onUpdate({ ...block, data: { ...block.data, content } })}
              placeholder="Commencez à écrire votre contenu..."
            />
          );
        
        case 'video':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la vidéo
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={block.data?.url || ''}
                    onChange={(e) => onUpdate({ ...block, data: { ...block.data, url: e.target.value } })}
                    placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                  />
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Prévisualiser
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  value={block.data?.duration || ''}
                  onChange={(e) => onUpdate({ ...block, data: { ...block.data, duration: parseInt(e.target.value) } })}
                  placeholder="Ex: 15"
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                />
              </div>
              
              {block.data?.url && (
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-80" />
                </div>
              )}
            </div>
          );
        
        case 'image':
          return (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7978E2] transition-colors cursor-pointer bg-gray-50"
                onClick={() => {/* Logique d'upload */}}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez une image ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP jusqu'à 10MB</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte alternatif (SEO)
                  </label>
                  <input
                    type="text"
                    value={block.data?.alt || ''}
                    onChange={(e) => onUpdate({ ...block, data: { ...block.data, alt: e.target.value } })}
                    placeholder="Description de l'image"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Légende
                  </label>
                  <input
                    type="text"
                    value={block.data?.caption || ''}
                    onChange={(e) => onUpdate({ ...block, data: { ...block.data, caption: e.target.value } })}
                    placeholder="Légende optionnelle"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                  />
                </div>
              </div>
            </div>
          );
        
        case 'quiz':
          const questions = block.data?.questions || [{ question: '', answers: ['', '', '', ''], correct: 0 }];
          
          return (
            <div className="space-y-6">
              {questions.map((q: any, qIndex: number) => (
                <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[qIndex].question = e.target.value;
                        onUpdate({ ...block, data: { ...block.data, questions: newQuestions } });
                      }}
                      placeholder="Posez votre question..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Réponses
                    </label>
                    {q.answers.map((answer: string, aIndex: number) => (
                      <div key={aIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${block.id}-${qIndex}`}
                          checked={q.correct === aIndex}
                          onChange={() => {
                            const newQuestions = [...questions];
                            newQuestions[qIndex].correct = aIndex;
                            onUpdate({ ...block, data: { ...block.data, questions: newQuestions } });
                          }}
                          className="text-[#7978E2] focus:ring-[#7978E2]"
                        />
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[qIndex].answers[aIndex] = e.target.value;
                            onUpdate({ ...block, data: { ...block.data, questions: newQuestions } });
                          }}
                          placeholder={`Réponse ${aIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                        />
                        {aIndex === q.correct && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {questions.length > 1 && (
                    <button
                      onClick={() => {
                        const newQuestions = questions.filter((_: any, i: number) => i !== qIndex);
                        onUpdate({ ...block, data: { ...block.data, questions: newQuestions } });
                      }}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Supprimer cette question
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newQuestions = [...questions, { question: '', answers: ['', '', '', ''], correct: 0 }];
                  onUpdate({ ...block, data: { ...block.data, questions: newQuestions } });
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#7978E2] hover:text-[#7978E2] transition-colors"
              >
                + Ajouter une question
              </button>
            </div>
          );
        
        case 'download':
          return (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7978E2] transition-colors cursor-pointer bg-gray-50"
              >
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez un fichier ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-500">PDF, ZIP, DOC, XLS jusqu'à 50MB</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du fichier
                  </label>
                  <input
                    type="text"
                    value={block.data?.title || ''}
                    onChange={(e) => onUpdate({ ...block, data: { ...block.data, title: e.target.value } })}
                    placeholder="Ex: Guide pratique"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille du fichier
                  </label>
                  <input
                    type="text"
                    value={block.data?.size || ''}
                    readOnly
                    placeholder="Automatique"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={block.data?.description || ''}
                  onChange={(e) => onUpdate({ ...block, data: { ...block.data, description: e.target.value } })}
                  placeholder="Décrivez le contenu du fichier..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                />
              </div>
            </div>
          );
        
        case 'exercise':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions de l'exercice
                </label>
                <textarea
                  value={block.data?.instructions || ''}
                  onChange={(e) => onUpdate({ ...block, data: { ...block.data, instructions: e.target.value } })}
                  placeholder="Décrivez l'exercice à réaliser..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  value={block.data?.estimatedTime || ''}
                  onChange={(e) => onUpdate({ ...block, data: { ...block.data, estimatedTime: parseInt(e.target.value) } })}
                  placeholder="Ex: 30"
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7978E2]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critères de validation
                </label>
                <textarea
                  value={block.data?.criteria || ''}
                  onChange={(e) => onUpdate({ ...block, data: { ...block.data, criteria: e.target.value } })}
                  placeholder="Comment l'exercice sera-t-il évalué ?"
                  rows={3}
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
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={block.data?.allowFileUpload || false}
                    onChange={(e) => onUpdate({ ...block, data: { ...block.data, allowFileUpload: e.target.checked } })}
                    className="rounded border-gray-300 text-[#7978E2] focus:ring-[#7978E2] mr-2"
                  />
                  <span className="text-sm text-gray-700">Autoriser l'upload de fichier</span>
                </label>
              </div>
            </div>
          );
        
        default:
          return null;
      }
    };
  
    return (
      <div 
        className={`
          bg-white border rounded-lg overflow-hidden transition-all duration-200
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${isOver ? 'border-[#7978E2] border-2' : 'border-gray-200'}
          ${isDeleting ? 'opacity-0 scale-95' : ''}
        `}
        draggable
      >
        {/* Header du bloc */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="cursor-move hover:bg-gray-200 p-1 rounded transition-colors">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className={`p-1.5 rounded ${blockType.color}`}>
              <blockType.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={block.titre}
                onChange={(e) => onUpdate({ ...block, titre: e.target.value })}
                placeholder={`${blockType.label} - Cliquez pour renommer`}
                className="font-medium text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 w-full"
              />
              <p className="text-xs text-gray-500">{blockType.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {block.obligatoire && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center">
                <Lock className="w-3 h-3 mr-1" />
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
                      onDuplicate();
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Dupliquer
                  </button>
                  
                  <button
                    onClick={() => {
                      onUpdate({ ...block, obligatoire: !block.obligatoire });
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    {block.obligatoire ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {block.obligatoire ? 'Rendre optionnel' : 'Rendre obligatoire'}
                  </button>
                  
                  <div className="border-t border-gray-200 my-2" />
                  
                  <button
                    onClick={() => {
                      handleDelete();
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
            {renderBlockContent()}
          </div>
        )}
      </div>
    );
  };