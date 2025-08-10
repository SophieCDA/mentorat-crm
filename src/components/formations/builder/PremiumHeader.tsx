import React from 'react';
import { 
  ArrowLeft, Sparkles, Save, Settings, Eye, Layout, TrendingUp, 
  Monitor, Tablet, Smartphone, Sun, Moon, CheckCircle, Loader, 
  AlertCircle, Award, Clock, Users, Star, Upload, Trash2, 
  ExternalLink, Share2
} from 'lucide-react';
import { Formation } from '@/types/formation.types';

interface PremiumHeaderProps {
  formation: Formation;
  activeView: 'builder' | 'preview' | 'analytics';
  setActiveView: (view: 'builder' | 'preview' | 'analytics') => void;
  previewMode: string;
  setPreviewMode: (mode: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  saving: boolean;
  saved: boolean;
  errors: string[];
  onSave: () => void;
  hasUnsavedChanges?: boolean;
  onPublish?: () => void;
  onDelete?: () => void;
  isNew?: boolean;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  formation,
  activeView,
  setActiveView,
  previewMode,
  setPreviewMode,
  darkMode,
  setDarkMode,
  showSettings,
  setShowSettings,
  saving,
  saved,
  errors,
  onSave,
  hasUnsavedChanges = false,
  onPublish,
  onDelete,
  isNew = false
}) => {
  const PREVIEW_MODES = {
    DESKTOP: 'desktop',
    TABLET: 'tablet', 
    MOBILE: 'mobile'
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?');
      if (!confirm) return;
    }
    window.history.back();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{formation.titre}</h1>
                {isNew && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Nouvelle
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{formation.modules.length} module{formation.modules.length > 1 ? 's' : ''}</span>
                <StatusBadge status={formation.statut} />
                {formation.certificate && <CertificateBadge />}
                <FormationStats formation={formation} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Indicateurs d'état */}
          <StatusIndicators 
            saving={saving} 
            saved={saved} 
            errors={errors} 
            hasUnsavedChanges={hasUnsavedChanges}
          />

          {/* Actions rapides */}
          <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3">
            {formation.statut === 'published' && (
              <button
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
                title="Voir la formation publiée"
              >
                <ExternalLink size={14} />
                Voir
              </button>
            )}
            
            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
              title="Partager"
            >
              <Share2 size={14} />
            </button>
          </div>

          {/* Mode sombre */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* Sélecteur de vue */}
          <ViewSelector 
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {/* Prévisualisation responsive */}
          {activeView === 'preview' && (
            <PreviewModeSelector
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              PREVIEW_MODES={PREVIEW_MODES}
            />
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Settings size={16} />
            Paramètres
          </button>

          {/* Actions principales */}
          <div className="flex items-center gap-2">
            {/* Bouton Supprimer (uniquement si pas nouveau et fonction disponible) */}
            {!isNew && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                title="Supprimer la formation"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            )}

            {/* Bouton Sauvegarder */}
            <button 
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : isNew ? 'Créer' : 'Sauvegarder'}
            </button>

            {/* Bouton Publier */}
            {onPublish && (
              <button
                onClick={onPublish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <Upload size={16} />
                {formation.statut === 'published' ? 'Republier' : 'Publier'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Badge de statut
const StatusBadge: React.FC<{ status: Formation['statut'] }> = ({ status }) => {
  const getStatusConfig = (status: Formation['statut']) => {
    switch (status) {
      case 'published':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Publié' };
      case 'draft':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Brouillon' };
      case 'archived':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Archivé' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Badge de certification
const CertificateBadge: React.FC = () => (
  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
    <Award className="w-3 h-3" />
    Certifiant
  </span>
);

// Statistiques de formation
const FormationStats: React.FC<{ formation: Formation }> = ({ formation }) => {
  const totalDuration = formation.modules.reduce((acc, module) => acc + module.duree_estimee, 0);
  
  return (
    <div className="flex items-center gap-3 text-xs">
      {formation.nombre_inscrits !== undefined && (
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formation.nombre_inscrits} inscrits
        </span>
      )}
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {Math.ceil(totalDuration / 60)}h
      </span>
      {formation.note_moyenne && (
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          {formation.note_moyenne.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Indicateurs d'état de sauvegarde
const StatusIndicators: React.FC<{ 
  saving: boolean; 
  saved: boolean; 
  errors: string[];
  hasUnsavedChanges: boolean;
}> = ({ saving, saved, errors, hasUnsavedChanges }) => (
  <div className="flex items-center gap-2">
    {hasUnsavedChanges && !saving && !saved && (
      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        Non sauvegardé
      </div>
    )}

    {saved && (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
        <CheckCircle size={16} />
        Sauvegardé
      </div>
    )}
    
    {saving && (
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
        <Loader className="w-4 h-4 animate-spin" />
        Sauvegarde...
      </div>
    )}

    {errors.length > 0 && (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
        <AlertCircle size={16} />
        {errors.length} erreur{errors.length > 1 ? 's' : ''}
      </div>
    )}
  </div>
);

// Sélecteur de vue
interface ViewSelectorProps {
  activeView: 'builder' | 'preview' | 'analytics';
  setActiveView: (view: 'builder' | 'preview' | 'analytics') => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ activeView, setActiveView }) => (
  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
    <ViewButton
      icon={Layout}
      label="Éditeur"
      isActive={activeView === 'builder'}
      onClick={() => setActiveView('builder')}
    />
    <ViewButton
      icon={Eye}
      label="Aperçu"
      isActive={activeView === 'preview'}
      onClick={() => setActiveView('preview')}
    />
    <ViewButton
      icon={TrendingUp}
      label="Analytics"
      isActive={activeView === 'analytics'}
      onClick={() => setActiveView('analytics')}
    />
  </div>
);

// Bouton de vue individuel
interface ViewButtonProps {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ViewButton: React.FC<ViewButtonProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      isActive 
        ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' 
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

// Sélecteur de mode de prévisualisation
interface PreviewModeSelectorProps {
  previewMode: string;
  setPreviewMode: (mode: string) => void;
  PREVIEW_MODES: { DESKTOP: string; TABLET: string; MOBILE: string };
}

const PreviewModeSelector: React.FC<PreviewModeSelectorProps> = ({
  previewMode, setPreviewMode, PREVIEW_MODES
}) => (
  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
    <PreviewModeButton
      icon={Monitor}
      mode={PREVIEW_MODES.DESKTOP}
      currentMode={previewMode}
      onClick={setPreviewMode}
      title="Vue desktop"
    />
    <PreviewModeButton
      icon={Tablet}
      mode={PREVIEW_MODES.TABLET}
      currentMode={previewMode}
      onClick={setPreviewMode}
      title="Vue tablette"
    />
    <PreviewModeButton
      icon={Smartphone}
      mode={PREVIEW_MODES.MOBILE}
      currentMode={previewMode}
      onClick={setPreviewMode}
      title="Vue mobile"
    />
  </div>
);

// Bouton de mode de prévisualisation
interface PreviewModeButtonProps {
  icon: React.ComponentType<{ size: number }>;
  mode: string;
  currentMode: string;
  onClick: (mode: string) => void;
  title: string;
}

const PreviewModeButton: React.FC<PreviewModeButtonProps> = ({
  icon: Icon, mode, currentMode, onClick, title
}) => (
  <button
    onClick={() => onClick(mode)}
    className={`p-2 rounded transition-colors ${
      currentMode === mode 
        ? 'bg-white dark:bg-gray-600 shadow-sm' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
    title={title}
  >
    <Icon size={16} />
  </button>
);