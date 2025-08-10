import React from 'react';
import { 
  Type, Image, Video, FileText, Link, HelpCircle, 
  BookOpen, Sparkles, Music, Play, Code, Globe
} from 'lucide-react';
import { ContentBlock } from '@/types/formation.types';

interface ContentToolbarProps {
  onAddContent: (type: ContentBlock['type']) => void;
}

export const ContentToolbar: React.FC<ContentToolbarProps> = ({ onAddContent }) => {
  const tools = [
    { 
      type: 'text' as const, 
      icon: Type, 
      label: 'Texte', 
      color: 'blue',
      description: 'Éditeur de texte riche avec formatage avancé'
    },
    { 
      type: 'image' as const, 
      icon: Image, 
      label: 'Image', 
      color: 'green',
      description: 'Upload d\'images avec galerie intégrée'
    },
    { 
      type: 'video' as const, 
      icon: Video, 
      label: 'Vidéo', 
      color: 'purple',
      description: 'Intégration vidéo YouTube, Vimeo, etc.'
    },
    { 
      type: 'quiz' as const, 
      icon: HelpCircle, 
      label: 'Quiz', 
      color: 'pink',
      description: 'Quiz interactifs avec scoring'
    },
    { 
      type: 'exercise' as const, 
      icon: BookOpen, 
      label: 'Exercice', 
      color: 'cyan',
      description: 'Exercices pratiques guidés'
    },
    { 
      type: 'audio' as const, 
      icon: Music, 
      label: 'Audio', 
      color: 'indigo',
      description: 'Lecteur audio intégré'
    },
    { 
      type: 'file' as const, 
      icon: FileText, 
      label: 'Fichier', 
      color: 'orange',
      description: 'Documents PDF, ZIP, etc.'
    },
    { 
      type: 'embed' as const, 
      icon: Globe, 
      label: 'Embed', 
      color: 'gray',
      description: 'Code HTML personnalisé'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Ajouter du contenu</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choisissez le type de contenu à insérer</p>
        </div>
        <div className="flex items-center gap-2 text-yellow-500">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">Premium</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {tools.map((tool) => (
          <ContentToolButton
            key={tool.type}
            tool={tool}
            onClick={() => onAddContent(tool.type)}
          />
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Conseils Pro</h5>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Alternez entre différents types de contenu pour maintenir l'engagement. 
              Utilisez les quiz pour valider les acquis et les exercices pour la pratique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bouton individuel pour chaque type de contenu
interface ContentToolButtonProps {
  tool: {
    type: ContentBlock['type'];
    icon: React.ComponentType<{ className: string }>;
    label: string;
    color: string;
    description: string;
  };
  onClick: () => void;
}

const ContentToolButton: React.FC<ContentToolButtonProps> = ({ tool, onClick }) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 group-hover:text-blue-600',
      green: 'hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:border-green-800 group-hover:text-green-600',
      purple: 'hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-800 group-hover:text-purple-600',
      pink: 'hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-900/20 dark:hover:border-pink-800 group-hover:text-pink-600',
      cyan: 'hover:bg-cyan-50 hover:border-cyan-200 dark:hover:bg-cyan-900/20 dark:hover:border-cyan-800 group-hover:text-cyan-600',
      indigo: 'hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-800 group-hover:text-indigo-600',
      orange: 'hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-800 group-hover:text-orange-600',
      gray: 'hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-600 group-hover:text-gray-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-500',
      green: 'text-green-500', 
      purple: 'text-purple-500',
      pink: 'text-pink-500',
      cyan: 'text-cyan-500',
      indigo: 'text-indigo-500',
      orange: 'text-orange-500',
      gray: 'text-gray-500'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md border-2 border-transparent bg-gray-50 dark:bg-gray-700 ${getColorClasses(tool.color)}`}
      title={tool.description}
    >
      <div className="relative">
        <tool.icon className={`w-6 h-6 transition-colors duration-200 ${getIconColor(tool.color)}`} />
        
        {/* Badge premium pour certains types */}
        {(tool.type === 'quiz' || tool.type === 'exercise') && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
          {tool.label}
        </span>
      </div>

      {/* Tooltip au hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {tool.description}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  );
};

// Toolbar spécialisée pour les quiz
export const QuizToolbar: React.FC = () => {
  const quizTools = [
    { icon: HelpCircle, label: 'Question', action: 'add_question' },
    { icon: Type, label: 'Texte libre', action: 'add_text_question' },
    { icon: Play, label: 'Vrai/Faux', action: 'add_boolean_question' },
    { icon: Code, label: 'Code', action: 'add_code_question' }
  ];

  return (
    <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
      <span className="text-sm font-medium text-pink-800 dark:text-pink-200">Types de questions :</span>
      {quizTools.map((tool, index) => (
        <button
          key={index}
          className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-700 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors text-sm"
        >
          <tool.icon className="w-4 h-4 text-pink-600" />
          {tool.label}
        </button>
      ))}
    </div>
  );
};

// Toolbar spécialisée pour les exercices
export const ExerciseToolbar: React.FC = () => {
  const exerciseTools = [
    { icon: BookOpen, label: 'Étape', action: 'add_step' },
    { icon: Code, label: 'Code', action: 'add_code_step' },
    { icon: Image, label: 'Image', action: 'add_image_step' },
    { icon: Video, label: 'Vidéo', action: 'add_video_step' }
  ];

  return (
    <div className="flex items-center gap-2 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
      <span className="text-sm font-medium text-cyan-800 dark:text-cyan-200">Types d'étapes :</span>
      {exerciseTools.map((tool, index) => (
        <button
          key={index}
          className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 border border-cyan-200 dark:border-cyan-700 rounded-md hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors text-sm"
        >
          <tool.icon className="w-4 h-4 text-cyan-600" />
          {tool.label}
        </button>
      ))}
    </div>
  );
};