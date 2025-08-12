// components/editor/ContentEditor.tsx
import React, { useState, useEffect } from 'react';
import { Type, Video, HelpCircle, Edit3, Download, Layout, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { ContentBlock, ContentType } from '@/types/formation.types';
import { Button } from '../common';

interface ContentEditorProps {
  contents?: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ contents = [], onChange }) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(contents);

  useEffect(() => {
    setBlocks(contents);
  }, [contents]);

  const contentTypes = [
    { type: 'text' as ContentType, icon: Type, label: 'Texte', color: 'purple' },
    { type: 'video' as ContentType, icon: Video, label: 'Vidéo', color: 'pink' },
    { type: 'quiz' as ContentType, icon: HelpCircle, label: 'Quiz', color: 'purple' },
    { type: 'exercise' as ContentType, icon: Edit3, label: 'Exercice', color: 'green' },
    { type: 'download' as ContentType, icon: Download, label: 'Ressource', color: 'blue' },
  ];

  const addBlock = (type: ContentType) => {
    const newBlock: ContentBlock = {
      id: Date.now(),
      type,
      ordre: blocks.length,
      data: {},
      obligatoire: false,
      titre: '',
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    onChange(updatedBlocks);
  };

  const updateBlock = (index: number, updatedBlock: ContentBlock) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = updatedBlock;
    setBlocks(updatedBlocks);
    onChange(updatedBlocks);
  };

  const deleteBlock = (index: number) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(updatedBlocks);
    onChange(updatedBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const updatedBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedBlocks[index], updatedBlocks[newIndex]] = [updatedBlocks[newIndex], updatedBlocks[index]];
    setBlocks(updatedBlocks);
    onChange(updatedBlocks);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl">
        {contentTypes.map((contentType) => (
          <Button
            key={contentType.type}
            onClick={() => addBlock(contentType.type)}
            variant="secondary"
            icon={contentType.icon}
          >
            {contentType.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Layout size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun contenu pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">
              Cliquez sur un type de contenu ci-dessus pour commencer
            </p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <ContentBlockEditor
              key={block.id || index}
              block={block}
              onChange={(updatedBlock) => updateBlock(index, updatedBlock)}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, 'up')}
              onMoveDown={() => moveBlock(index, 'down')}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ContentBlockEditor Component
interface ContentBlockEditorProps {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({ 
  block, 
  onChange, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <textarea
                value={block.data.content || ''}
                onChange={(e) => onChange({ 
                  ...block, 
                  data: { ...block.data, content: e.target.value } 
                })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                placeholder="Entrez votre texte ici..."
              />
            ) : (
              <div className="prose max-w-none p-4 bg-gray-50 rounded-lg">
                {block.data.content || 'Cliquez pour éditer le texte...'}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="URL de la vidéo (YouTube, Vimeo...)"
                  value={block.data.url || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, url: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Titre de la vidéo"
                  value={block.data.titre || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, titre: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Video size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">{block.data.titre || 'Vidéo'}</p>
                {block.data.url && (
                  <p className="text-sm text-gray-500 mt-1">{block.data.url}</p>
                )}
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="bg-purple-50 rounded-lg p-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Titre du quiz"
                  value={block.data.titre || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, titre: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                />
                <textarea
                  placeholder="Description du quiz"
                  value={block.data.description || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, description: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </>
            ) : (
              <div className="flex items-start gap-3">
                <HelpCircle className="text-purple-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-purple-900">
                    {block.data.titre || 'Quiz'}
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    {block.data.description || 'Aucune description'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'exercise':
        return (
          <div className="bg-green-50 rounded-lg p-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Titre de l'exercice"
                  value={block.data.titre || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, titre: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                />
                <textarea
                  placeholder="Instructions de l'exercice"
                  value={block.data.instructions || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, instructions: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                />
              </>
            ) : (
              <div className="flex items-start gap-3">
                <Edit3 className="text-green-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900">
                    {block.data.titre || 'Exercice'}
                  </h4>
                  <p className="text-sm text-green-700 mt-1 whitespace-pre-wrap">
                    {block.data.instructions || 'Aucune instruction'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'download':
        return (
          <div className="bg-blue-50 rounded-lg p-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Titre de la ressource"
                  value={block.data.titre || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, titre: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                />
                <textarea
                  placeholder="Description de la ressource"
                  value={block.data.description || ''}
                  onChange={(e) => onChange({ 
                    ...block, 
                    data: { ...block.data, description: e.target.value } 
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </>
            ) : (
              <div className="flex items-start gap-3">
                <Download className="text-blue-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {block.data.titre || 'Ressource téléchargeable'}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {block.data.description || 'Aucune description'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Type de contenu non reconnu</div>;
    }
  };

  return (
    <div className="group relative bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors">
      <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && (
          <button
            onClick={onMoveUp}
            className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50"
            title="Monter"
          >
            <ArrowUp size={14} />
          </button>
        )}
        {!isLast && (
          <button
            onClick={onMoveDown}
            className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50"
            title="Descendre"
          >
            <ArrowDown size={14} />
          </button>
        )}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50"
          title="Éditer"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-red-50 text-red-500"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};