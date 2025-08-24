import { ContentBlock } from "@/types/formation.types";
import { PlayCircle, Upload, Check, Download, GripVertical, ChevronDown, ChevronRight, MoreVertical, Copy, Unlock, Trash2, Lock, Image } from "lucide-react";
import { useState } from "react";
import RichTextEditor from "@/components/formations/editor/RichTextEditor";
import { blockTypesConfig } from "@/types/editor.types";
import { uploadService } from '@/lib/services/upload.service';
import { getMediaUrl, getFileUrl, extractYouTubeId, extractVimeoId, formatFileSize } from '@/utils/mediaHelpers';
import { MediaGallery } from "@/components/formations/editor/MediaGallery";

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
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);

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
            value={block.data?.content || ''}
            onChange={(content) => onUpdate({ ...block, data: { ...block.data, content } })}
            placeholder="Commencez à écrire votre contenu..."
          />
        );

      case 'video':
        const handleVideoPreview = () => {
          if (block.data?.url) {
            // Ouvrir la vidéo dans un nouvel onglet ou modal
            window.open(block.data.url, '_blank');
          }
        };

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
                <button
                  onClick={handleVideoPreview}
                  disabled={!block.data?.url}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
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
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {(block.data.url.includes('youtube.com') || block.data.url.includes('youtu.be')) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(block.data.url)}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : block.data.url.includes('vimeo.com') ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${extractVimeoId(block.data.url)}`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PlayCircle className="w-16 h-16 text-white opacity-80" />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'image':
        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setIsUploading(true);
          try {
            const result = await uploadService.uploadImage(file);
            if (result.success && result.urls) {
              onUpdate({
                ...block,
                data: {
                  ...block.data,
                  url: result.urls.original,
                  thumbnail: result.urls.thumbnail,
                  medium: result.urls.medium
                }
              });
            } else {
              console.error('Erreur upload:', result.error);
            }
          } catch (error) {
            console.error('Erreur upload:', error);
          } finally {
            setIsUploading(false);
          }
        };

        const handleMediaSelect = (media: any) => {
          onUpdate({
            ...block,
            data: {
              ...block.data,
              url: media.url,
              thumbnail: media.thumbnail,
              medium: media.medium || media.url,
              alt: media.alt || '',
              filename: media.filename
            }
          });
        };

        return (
          <div className="space-y-4">
            {/* Boutons d'action */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMediaGallery(true)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#7978E2] to-[#42B4B7] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Image className="w-4 h-4 inline-block mr-2" />
                Choisir depuis la bibliothèque
              </button>

              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4 inline-block mr-2" />
                  Uploader une nouvelle image
                </button>
              </div>
            </div>

            {/* Affichage de l'image sélectionnée */}
            {block.data?.url && (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={getMediaUrl(block.data.url)}
                  alt={block.data.alt || ''}
                  className="w-full h-auto"
                  onError={(e) => {
                    console.error('Erreur chargement image:', block.data.url);
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
                <button
                  onClick={() => {
                    onUpdate({
                      ...block,
                      data: {
                        ...block.data,
                        url: '',
                        thumbnail: '',
                        medium: ''
                      }
                    });
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Badge avec le nom du fichier */}
                {block.data.filename && (
                  <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 text-white text-xs rounded">
                    {block.data.filename}
                  </div>
                )}
              </div>
            )}

            {/* Champs alt et caption */}
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

            <MediaGallery
              isOpen={showMediaGallery}
              onClose={() => setShowMediaGallery(false)}
              onSelect={handleMediaSelect}
              type="image"
            />

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
        const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setIsUploading(true);
          try {
            const result = await uploadService.uploadFile(file);
            if (result.success && result.url) {
              onUpdate({
                ...block,
                data: {
                  ...block.data,
                  url: result.url,
                  filename: file.name,
                  title: block.data?.title || file.name.replace(/\.[^/.]+$/, ""), // Nom sans extension
                  size: file.size
                }
              });
            }
          } catch (error) {
            console.error('Erreur upload fichier:', error);
          } finally {
            setIsUploading(false);
          }
        };

        const formatFileSize = (bytes: number): string => {
          if (!bytes) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        };

        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7978E2] transition-colors bg-gray-50 ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7978E2] mb-4"></div>
                    <p className="text-sm text-gray-600">Upload en cours...</p>
                  </div>
                ) : block.data?.url ? (
                  <div className="flex items-center justify-center">
                    <Download className="w-8 h-8 text-gray-600 mr-3" />
                    <div className="text-left">
                      <span className="text-sm font-medium">{block.data.filename || 'Fichier uploadé'}</span>
                      {block.data?.size && (
                        <p className="text-xs text-gray-500">{formatFileSize(block.data.size)}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({
                          ...block,
                          data: {
                            ...block.data,
                            url: '',
                            filename: '',
                            size: 0
                          }
                        });
                      }}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Glissez-déposez un fichier ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-gray-500">PDF, ZIP, DOC, XLS jusqu'à 50MB</p>
                  </>
                )}
              </div>
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
      draggable={isDraggable} // <- plus "toujours draggable"
      onDragStart={(e) => {
        // Ne pas démarrer un drag si on part de l'éditeur de texte
        if ((e.target as HTMLElement).closest('[data-rte]')) {
          e.preventDefault();
          return;
        }
        setIsDraggable(true); // Enable dragging
      }}
      onDragEnd={() => setIsDraggable(false)}
    >
      {/* Header du bloc */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* POIGNÉE DE DRAG SEULEMENT */}
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing hover:bg-gray-200 p-1 rounded transition-colors"
            onMouseDown={() => setIsDraggable(true)}
            onMouseUp={() => setIsDraggable(false)}
            onBlur={() => setIsDraggable(false)}
            title="Glisser pour réordonner"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
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