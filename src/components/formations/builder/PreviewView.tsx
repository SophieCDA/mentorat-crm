import React from 'react';
import { 
  BookOpen, Users, Clock, Star, Award, HelpCircle, 
  Image, Video, Music, FileText, Globe, Download,
  Play, Pause, Volume2, VolumeX, Heart, Share2,
  ChevronRight, Target, Calendar, TrendingUp
} from 'lucide-react';
import { Formation, ContentBlock, COLORS, PREVIEW_MODES } from '@/types/formation.types';

interface PreviewViewProps {
  formation: Formation;
  previewMode: string;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ formation, previewMode }) => {
  const getPreviewClasses = () => {
    switch (previewMode) {
      case PREVIEW_MODES.MOBILE:
        return "max-w-sm mx-auto";
      case PREVIEW_MODES.TABLET:
        return "max-w-2xl mx-auto";
      default:
        return "max-w-6xl mx-auto";
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      {/* Indicateur de mode de prévisualisation */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
          👁️ Mode Aperçu - {previewMode === PREVIEW_MODES.MOBILE ? 'Mobile' : 
                            previewMode === PREVIEW_MODES.TABLET ? 'Tablette' : 'Desktop'}
        </span>
      </div>

      <div className={`${getPreviewClasses()} transition-all duration-300`}>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <FormationPreviewHeader formation={formation} />
          <FormationPreviewContent formation={formation} />
        </div>
      </div>
    </div>
  );
};

// ======= EN-TÊTE DE L'APERÇU =======
const FormationPreviewHeader: React.FC<{ formation: Formation }> = ({ formation }) => (
  <div className="relative">
    {/* Image de couverture */}
    {formation.miniature ? (
      <img 
        src={formation.miniature} 
        alt={formation.titre}
        className="w-full h-64 object-cover"
      />
    ) : (
      <div className="w-full h-64 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-xl font-semibold">Formation Premium</p>
        </div>
      </div>
    )}
    
    {/* Overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
    
    {/* Contenu superposé */}
    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {formation.certificate && (
          <div className="flex items-center gap-1 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
            <Award className="w-4 h-4" />
            Certifiant
          </div>
        )}
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium capitalize">
          {formation.level || 'Débutant'}
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
          {formation.category || 'Développement'}
        </div>
        {formation.tags && formation.tags.length > 0 && (
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {formation.tags[0]}
          </div>
        )}
      </div>
      
      {/* Titre et description */}
      <h1 className="text-3xl font-bold mb-2">{formation.titre}</h1>
      <p className="text-lg opacity-90 mb-4 line-clamp-2">{formation.description}</p>
      
      {/* Statistiques */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="text-2xl font-bold">
          {formation.prix > 0 ? `${formation.prix}€` : 'Gratuit'}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{formation.nombre_inscrits || 0} inscrits</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{Math.ceil(formation.modules.reduce((acc, m) => acc + m.duree_estimee, 0) / 60)}h de contenu</span>
        </div>
        {formation.note_moyenne && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span>{formation.note_moyenne.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{formation.modules.length} modules</span>
        </div>
      </div>
    </div>
  </div>
);

// ======= CONTENU DE L'APERÇU =======
const FormationPreviewContent: React.FC<{ formation: Formation }> = ({ formation }) => (
  <div className="p-8">
    {/* Résumé de la formation */}
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ce que vous allez apprendre</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {formation.modules.slice(0, 3).map((module, index) => (
            <div key={module.id} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{module.titre}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {formation.modules.slice(3, 6).map((module, index) => (
            <div key={module.id} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{module.titre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Plan de cours */}
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan de cours</h2>
      
      {formation.modules.map((module, moduleIndex) => (
        <ModulePreview key={module.id} module={module} moduleIndex={moduleIndex} />
      ))}
    </div>

    {/* Section bonus si certificat */}
    {formation.certificate && (
      <div className="mt-12 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Certification incluse</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          Obtenez un certificat officiel à la fin de cette formation. 
          Démontrez vos nouvelles compétences et ajoutez de la valeur à votre profil professionnel.
        </p>
      </div>
    )}

    {/* CTA Final */}
    <div className="mt-12 text-center p-8 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Prêt à commencer votre apprentissage ?
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Rejoignez {formation.nombre_inscrits || 0} autres apprenants dans cette formation premium
      </p>
      <div className="flex justify-center gap-4">
        <button className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
          Commencer maintenant
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <Heart className="w-4 h-4" />
          Ajouter aux favoris
        </button>
      </div>
    </div>
  </div>
);

// ======= APERÇU DE MODULE =======
interface ModulePreviewProps {
  module: any;
  moduleIndex: number;
}

const ModulePreview: React.FC<ModulePreviewProps> = ({ module, moduleIndex }) => {
  const [isExpanded, setIsExpanded] = React.useState(moduleIndex === 0);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        style={{ backgroundColor: module.color || COLORS.accent }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{module.icon || '📚'}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">
                Module {moduleIndex + 1}: {module.titre}
              </h3>
              {module.description && (
                <p className="mt-2 opacity-90">{module.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm opacity-75">
                <span>{module.chapitres.length} chapitre{module.chapitres.length > 1 ? 's' : ''}</span>
                <span>{module.duree_estimee} minutes</span>
                <span className="capitalize">{module.difficulty || 'Débutant'}</span>
              </div>
            </div>
          </div>
          <ChevronRight 
            className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
          {module.chapitres.map((chapter: any, chapterIndex: number) => (
            <ChapterPreview 
              key={chapter.id} 
              chapter={chapter} 
              chapterIndex={chapterIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ======= APERÇU DE CHAPITRE =======
interface ChapterPreviewProps {
  chapter: any;
  chapterIndex: number;
}

const ChapterPreview: React.FC<ChapterPreviewProps> = ({ chapter, chapterIndex }) => {
  return (
    <div className="border-l-4 border-cyan-500 pl-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
            {chapterIndex + 1}. {chapter.titre}
          </h4>
          {chapter.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{chapter.description}</p>
          )}
          
          {/* Statistiques du chapitre */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {chapter.duree_estimee} min
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {chapter.contenu.length} élément{chapter.contenu.length > 1 ? 's' : ''}
            </span>
            {chapter.obligatoire && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Obligatoire
              </span>
            )}
          </div>
          
          {/* Aperçu du contenu */}
          <div className="space-y-3">
            {chapter.contenu.map((block: ContentBlock) => (
              <ContentBlockPreview key={block.id} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ======= APERÇU DES BLOCS DE CONTENU =======
const ContentBlockPreview: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'quiz': return <HelpCircle className="w-5 h-5 text-pink-500" />;
      case 'exercise': return <BookOpen className="w-5 h-5 text-cyan-500" />;
      case 'text': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-indigo-500" />;
      case 'file': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'embed': return <Globe className="w-5 h-5 text-gray-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBlockLabel = (type: ContentBlock['type']) => {
    switch (type) {
      case 'quiz': return 'Quiz Interactif';
      case 'exercise': return 'Exercice Pratique';
      case 'text': return 'Contenu Texte';
      case 'image': return 'Image';
      case 'video': return 'Vidéo';
      case 'audio': return 'Audio';
      case 'file': return 'Fichier';
      case 'embed': return 'Contenu Intégré';
      default: return 'Contenu';
    }
  };

  const getBlockDetails = (block: ContentBlock) => {
    switch (block.type) {
      case 'quiz':
        return `${block.data.questions?.length || 0} questions`;
      case 'exercise':
        return `${block.data.steps?.length || 0} étapes`;
      case 'text':
        const wordCount = block.data.content ? 
          block.data.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;
        return `${wordCount} mots`;
      case 'video':
        return block.data.url ? 'Configurée' : 'À configurer';
      case 'image':
        return block.data.url ? 'Image ajoutée' : 'Image manquante';
      default:
        return 'Contenu disponible';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex-shrink-0">
        {getBlockIcon(block.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {block.titre || getBlockLabel(block.type)}
          </p>
          {block.obligatoire && (
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
              Obligatoire
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getBlockDetails(block)}
        </p>
      </div>
      
      {/* Actions spécifiques au type */}
      <div className="flex items-center gap-2">
        {block.type === 'quiz' && (
          <div className="flex items-center gap-1 text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
            <Award className="w-3 h-3" />
            {block.data.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0} pts
          </div>
        )}
        {block.type === 'video' && block.data.url && (
          <button className="p-1 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors">
            <Play className="w-4 h-4" />
          </button>
        )}
        {block.type === 'file' && block.data.url && (
          <button className="p-1 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};