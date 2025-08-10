import React, { useState } from 'react';
import { 
  GripVertical, Edit3, Eye, Trash2, Copy, Settings, 
  HelpCircle, BookOpen, Type, Image, Video, Music, 
  FileText, Globe, ChevronDown, ChevronRight, Clock,
  Target, Award, Users, TrendingUp, BarChart3
} from 'lucide-react';
import { ContentBlock } from '@/types/formation.types';
import { PremiumImageUploader } from './ImageUploader';
import { PremiumTextEditor } from './TextEditor';
import { PremiumQuizEditor } from './QuizEditor';

interface ContentBlockEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, block: ContentBlock, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  index: number;
}

export const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  block,
  onUpdate,
  onDelete,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  index
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getBlockConfig = (type: ContentBlock['type']) => {
    const configs = {
      quiz: { 
        icon: HelpCircle, 
        label: 'Quiz Interactif', 
        color: 'from-pink-500 to-purple-600',
        emoji: '❓',
        stats: `${block.data.questions?.length || 0} questions`
      },
      exercise: { 
        icon: BookOpen, 
        label: 'Exercice Pratique', 
        color: 'from-cyan-500 to-blue-600',
        emoji: '📝',
        stats: `${block.data.steps?.length || 0} étapes`
      },
      text: { 
        icon: Type, 
        label: 'Contenu Texte', 
        color: 'from-blue-500 to-indigo-600',
        emoji: '📄',
        stats: `${(block.data.content?.replace(/<[^>]*>/g, '')?.length || 0)} caractères`
      },
      image: { 
        icon: Image, 
        label: 'Image', 
        color: 'from-green-500 to-emerald-600',
        emoji: '🖼️',
        stats: block.data.url ? 'Configurée' : 'À configurer'
      },
      video: { 
        icon: Video, 
        label: 'Vidéo', 
        color: 'from-purple-500 to-violet-600',
        emoji: '🎥',
        stats: block.data.url ? 'Configurée' : 'À configurer'
      },
      audio: { 
        icon: Music, 
        label: 'Audio', 
        color: 'from-indigo-500 to-purple-600',
        emoji: '🎵',
        stats: block.data.url ? 'Configuré' : 'À configurer'
      },
      file: { 
        icon: FileText, 
        label: 'Fichier', 
        color: 'from-orange-500 to-red-600',
        emoji: '📎',
        stats: block.data.filename || 'Aucun fichier'
      },
      embed: { 
        icon: Globe, 
        label: 'Code Embed', 
        color: 'from-gray-500 to-gray-600',
        emoji: '🌐',
        stats: block.data.code ? 'Configuré' : 'À configurer'
      }
    };
    return configs[type as keyof typeof configs] || {
      icon: Type,
      label: 'Contenu Inconnu',
      color: 'from-gray-500 to-gray-600',
      emoji: '❓',
      stats: 'Non configuré'
    };
  };

  const config = getBlockConfig(block.type);

  const renderEditor = () => {
    switch (block.type) {
      case 'quiz':
        return <PremiumQuizEditor block={block} onUpdate={onUpdate} />;
      case 'text':
        return <PremiumTextEditor block={block} onUpdate={onUpdate} />;
      case 'image':
        return <ImageEditor block={block} onUpdate={onUpdate} />;
      case 'video':
        return <VideoEditor block={block} onUpdate={onUpdate} />;
      case 'audio':
        return <AudioEditor block={block} onUpdate={onUpdate} />;
      case 'file':
        return <FileEditor block={block} onUpdate={onUpdate} />;
      case 'embed':
        return <EmbedEditor block={block} onUpdate={onUpdate} />;
      default:
        return <DefaultEditor block={block} onUpdate={onUpdate} />;
    }
  };

  const renderPreview = () => {
    switch (block.type) {
      case 'quiz':
        return <QuizPreview block={block} />;
      case 'text':
        return <TextPreview block={block} />;
      case 'image':
        return <ImagePreview block={block} />;
      case 'video':
        return <VideoPreview block={block} />;
      case 'audio':
        return <AudioPreview block={block} />;
      case 'file':
        return <FilePreview block={block} />;
      case 'embed':
        return <EmbedPreview block={block} />;
      default:
        return <DefaultPreview block={block} />;
    }
  };

  return (
    <div 
      className={`border rounded-xl bg-white dark:bg-gray-800 overflow-hidden transition-all shadow-sm hover:shadow-lg ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDragOver ? 'border-blue-400 shadow-xl ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
      }`}
      draggable
      onDragStart={(e) => onDragStart?.(e, block, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, index)}
    >
      {/* En-tête du bloc */}
      <BlockHeader
        block={block}
        config={config}
        isEditing={isEditing}
        showAdvanced={showAdvanced}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        onDelete={onDelete}
        onDuplicate={() => console.log('Duplicate block:', block.id)}
      />

      {/* Options avancées */}
      {showAdvanced && (
        <BlockAdvancedOptions block={block} onUpdate={onUpdate} />
      )}
      
      {/* Contenu du bloc */}
      <div className="p-6">
        {isEditing ? renderEditor() : renderPreview()}
      </div>

      {/* Analytics du bloc */}
      {!isEditing && <BlockAnalytics block={block} />}
    </div>
  );
};

// En-tête du bloc
interface BlockHeaderProps {
  block: ContentBlock;
  config: any;
  isEditing: boolean;
  showAdvanced: boolean;
  onToggleEdit: () => void;
  onToggleAdvanced: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const BlockHeader: React.FC<BlockHeaderProps> = ({
  block,
  config,
  isEditing,
  showAdvanced,
  onToggleEdit,
  onToggleAdvanced,
  onDelete,
  onDuplicate
}) => (
  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
    <div className="flex items-center gap-3">
      <GripVertical className="text-gray-400 cursor-move hover:text-gray-600 transition-colors" size={16} />
      
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br ${config.color}`}>
        {config.emoji}
      </div>
      
      <div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {config.label}
          </span>
          {block.titre && (
            <span className="text-sm text-gray-600 dark:text-gray-400">- {block.titre}</span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{config.stats}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {block.obligatoire && (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full font-medium">
            Obligatoire
          </span>
        )}
        {(block.type === 'quiz' || block.type === 'exercise') && (
          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
            <Award className="w-3 h-3" />
            Premium
          </span>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleAdvanced}
        className={`p-2 rounded-lg transition-all ${
          showAdvanced 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}
        title="Options avancées"
      >
        <Settings size={14} />
      </button>
      
      <button
        onClick={onToggleEdit}
        className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all ${
          isEditing 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}
      >
        {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
        {isEditing ? 'Aperçu' : 'Modifier'}
      </button>
      
      <button
        onClick={onDuplicate}
        className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
        title="Dupliquer"
      >
        <Copy size={14} />
      </button>
      
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
        title="Supprimer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

// Options avancées du bloc
const BlockAdvancedOptions: React.FC<{
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}> = ({ block, onUpdate }) => (
  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Titre du bloc</label>
        <input
          type="text"
          value={block.titre || ''}
          onChange={(e) => onUpdate({ titre: e.target.value })}
          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          placeholder="Titre optionnel"
        />
      </div>
      
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.obligatoire}
            onChange={(e) => onUpdate({ obligatoire: e.target.checked })}
            className="rounded text-blue-500"
          />
          <span className="text-sm">Contenu obligatoire</span>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Ordre</label>
        <input
          type="number"
          value={block.ordre}
          onChange={(e) => onUpdate({ ordre: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

// Analytics du bloc
const BlockAnalytics: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const analytics = {
    views: Math.floor(Math.random() * 500) + 100,
    completions: Math.floor(Math.random() * 400) + 50,
    avgTime: Math.floor(Math.random() * 300) + 30,
    engagement: Math.floor(Math.random() * 40) + 60
  };

  return (
    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{analytics.views} vues</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{analytics.completions} complétions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{analytics.avgTime}s</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{analytics.engagement}% engagement</span>
          </div>
        </div>
        
        <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
          <BarChart3 className="w-3 h-3" />
          Détails
        </button>
      </div>
    </div>
  );
};

// ======= ÉDITEURS SPÉCIALISÉS =======

const ImageEditor: React.FC<{ block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void }> = ({ block, onUpdate }) => (
  <div className="space-y-4">
    <PremiumImageUploader
      currentImage={block.data.url}
      onImageUploaded={(url) => onUpdate({ data: { ...block.data, url } })}
      placeholder="Sélectionnez une image pour ce contenu"
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Texte alternatif</label>
        <input
          type="text"
          value={block.data.alt || ''}
          onChange={(e) => onUpdate({ data: { ...block.data, alt: e.target.value } })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Description de l'image"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Légende</label>
        <input
          type="text"
          value={block.data.caption || ''}
          onChange={(e) => onUpdate({ data: { ...block.data, caption: e.target.value } })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Légende (optionnelle)"
        />
      </div>
    </div>
  </div>
);

const VideoEditor: React.FC<{ block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void }> = ({ block, onUpdate }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">URL de la vidéo</label>
      <input
        type="url"
        value={block.data.url || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, url: e.target.value } })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="https://www.youtube.com/watch?v=... ou Vimeo, etc."
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={block.data.autoplay || false}
          onChange={(e) => onUpdate({ data: { ...block.data, autoplay: e.target.checked } })}
          className="rounded text-blue-500"
        />
        <span className="text-sm">Lecture automatique</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={block.data.controls !== false}
          onChange={(e) => onUpdate({ data: { ...block.data, controls: e.target.checked } })}
          className="rounded text-blue-500"
        />
        <span className="text-sm">Afficher les contrôles</span>
      </label>
    </div>
  </div>
);

const AudioEditor: React.FC<{ block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void }> = ({ block, onUpdate }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">URL de l'audio</label>
      <input
        type="url"
        value={block.data.url || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, url: e.target.value } })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="URL du fichier audio (MP3, WAV, etc.)"
      />
    </div>
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={block.data.autoplay || false}
        onChange={(e) => onUpdate({ data: { ...block.data, autoplay: e.target.checked } })}
        className="rounded text-blue-500"
      />
      <span className="text-sm">Lecture automatique</span>
    </label>
  </div>
);

const FileEditor: React.FC<{ block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void }> = ({ block, onUpdate }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">URL du fichier</label>
      <input
        type="url"
        value={block.data.url || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, url: e.target.value } })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="URL du fichier à télécharger"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Nom du fichier</label>
        <input
          type="text"
          value={block.data.filename || ''}
          onChange={(e) => onUpdate({ data: { ...block.data, filename: e.target.value } })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="document.pdf"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Taille (MB)</label>
        <input
          type="number"
          step="0.1"
          value={block.data.size || ''}
          onChange={(e) => onUpdate({ data: { ...block.data, size: parseFloat(e.target.value) } })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

const EmbedEditor: React.FC<{ block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void }> = ({ block, onUpdate }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">Code HTML</label>
      <textarea
        value={block.data.code || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, code: e.target.value } })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm h-32"
        placeholder="<iframe src=... ou autre code HTML"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Hauteur (px)</label>
      <input
        type="number"
        value={block.data.height || 400}
        onChange={(e) => onUpdate({ data: { ...block.data, height: parseInt(e.target.value) } })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

const DefaultEditor: React.FC<{ block: ContentBlock; onUpdate: (updates: Partial<ContentBlock>) => void }> = ({ block }) => (
  <div className="p-4 text-center text-gray-500">
    Éditeur pour {block.type} en développement
  </div>
);

// ======= APERÇUS SPÉCIALISÉS =======

const QuizPreview: React.FC<{ block: ContentBlock }> = ({ block }) => (
  <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
        <HelpCircle className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{block.data.titre || 'Quiz sans titre'}</h3>
        <p className="text-sm text-gray-600">{block.data.questions?.length || 0} question(s)</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Note de passage:</span>
        <span className="ml-2 font-medium">{block.data.note_passage || 70}%</span>
      </div>
      <div>
        <span className="text-gray-600">Tentatives:</span>
        <span className="ml-2 font-medium">{block.data.tentatives_max || 3}</span>
      </div>
      <div>
        <span className="text-gray-600">Total points:</span>
        <span className="ml-2 font-medium">
          {block.data.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0}
        </span>
      </div>
    </div>
  </div>
);

const TextPreview: React.FC<{ block: ContentBlock }> = ({ block }) => (
  <div 
    className="prose prose-lg max-w-none dark:prose-invert"
    dangerouslySetInnerHTML={{ __html: block.data.content || '<p class="text-gray-400">Aucun contenu texte</p>' }}
  />
);

const ImagePreview: React.FC<{ block: ContentBlock }> = ({ block }) => 
  block.data.url ? (
    <div>
      <img 
        src={block.data.url} 
        alt={block.data.alt || ''} 
        className="w-full h-auto rounded-lg shadow-sm max-h-96 object-cover"
      />
      {block.data.caption && (
        <p className="text-sm text-gray-600 text-center mt-2 italic">{block.data.caption}</p>
      )}
    </div>
  ) : (
    <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Image size={48} className="mx-auto mb-2" />
        <p>Aucune image sélectionnée</p>
      </div>
    </div>
  );

const VideoPreview: React.FC<{ block: ContentBlock }> = ({ block }) => 
  block.data.url ? (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
      <div className="text-center">
        <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Lecteur vidéo</p>
        <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">{block.data.url}</p>
      </div>
    </div>
  ) : (
    <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Video size={48} className="mx-auto mb-2" />
        <p>Aucune vidéo configurée</p>
      </div>
    </div>
  );

const AudioPreview: React.FC<{ block: ContentBlock }> = ({ block }) => 
  block.data.url ? (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-medium">Fichier audio</p>
          <p className="text-sm text-gray-600">{block.data.url}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Music size={32} className="mx-auto mb-2" />
        <p>Aucun fichier audio</p>
      </div>
    </div>
  );

const FilePreview: React.FC<{ block: ContentBlock }> = ({ block }) => 
  block.data.url ? (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-medium">{block.data.filename || 'Fichier'}</p>
            <p className="text-sm text-gray-600">
              {block.data.size ? `${block.data.size} MB` : 'Taille inconnue'}
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Télécharger
        </button>
      </div>
    </div>
  ) : (
    <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <FileText size={32} className="mx-auto mb-2" />
        <p>Aucun fichier configuré</p>
      </div>
    </div>
  );

const EmbedPreview: React.FC<{ block: ContentBlock }> = ({ block }) => 
  block.data.code ? (
    <div 
      className="border rounded-lg overflow-hidden"
      style={{ height: `${block.data.height || 400}px` }}
      dangerouslySetInnerHTML={{ __html: block.data.code }}
    />
  ) : (
    <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Globe size={48} className="mx-auto mb-2" />
        <p>Aucun code embed configuré</p>
      </div>
    </div>
  );

const DefaultPreview: React.FC<{ block: ContentBlock }> = ({ block }) => (
  <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
    Aperçu pour {block.type} non disponible
  </div>
);