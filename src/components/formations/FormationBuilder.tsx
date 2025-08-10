import React, { useState, useEffect } from 'react';
import { Crown, Layout, Eye, TrendingUp, Users, Target, Star, Heart, Sparkles, Plus } from 'lucide-react';

// Import des types et constantes
import { Formation, COLORS, PREVIEW_MODES } from '@/types/formation.types';

// Import des hooks
import { useFormationActions } from '@/hooks/useFormationBuilder';

// Import des composants
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import { PremiumHeader } from '@/components/formations/builder/PremiumHeader';
import { PremiumImageUploader } from '@/components/formations/builder/ImageUploader';
import { PremiumTextEditor } from '@/components/formations/builder/TextEditor';
import { PremiumQuizEditor } from '@/components/formations/builder/QuizEditor';
import { BuilderView } from '@/components/formations/builder/BuilderView';
import { PreviewView } from '@/components/formations/builder/PreviewView';
import { AnalyticsView } from '@/components/formations/builder/AnalyticsView';

// Types pour la page d'édition
interface FormationFromAPI {
  id: number;
  titre: string;
  description?: string;
  statut: 'draft' | 'published' | 'archived';
  prix: number;
  duree_estimee: number;
  miniature?: string;
  modules: any[];
  date_creation?: string;
  date_publication?: string;
  cree_par?: string;
  nombre_inscrits?: number;
  note_moyenne?: number;
  tags?: string[];
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  certificate?: boolean;
}

interface FormationBuilderProps {
  initialFormation?: FormationFromAPI;
  onSave?: (formation: Formation) => Promise<void>;
  onPublish?: (formation: Formation) => Promise<void>;
  onDelete?: (formationId: number) => Promise<void>;
  isNew?: boolean;
}

// ======= FONCTION DE CONVERSION DES DONNÉES =======
const convertApiFormationToBuilderFormat = (apiFormation: FormationFromAPI): Formation => {
  return {
    id: apiFormation.id,
    titre: apiFormation.titre,
    description: apiFormation.description,
    statut: apiFormation.statut,
    prix: apiFormation.prix,
    duree_estimee: apiFormation.duree_estimee,
    miniature: apiFormation.miniature,
    modules: apiFormation.modules?.map(module => ({
      ...module,
      chapitres: module.chapitres?.map((chapter: any) => ({
        ...chapter,
        contenu: chapter.contenu?.map((content: any) => ({
          ...content,
          // Assurer la compatibilité des types de contenu
          type: content.type || 'text',
          data: content.data || {},
          obligatoire: content.obligatoire || false,
          ordre: content.ordre || 0
        })) || []
      })) || []
    })) || [],
    date_creation: apiFormation.date_creation,
    date_publication: apiFormation.date_publication,
    cree_par: apiFormation.cree_par,
    nombre_inscrits: apiFormation.nombre_inscrits,
    note_moyenne: apiFormation.note_moyenne,
    tags: apiFormation.tags || [],
    category: apiFormation.category || 'development',
    level: apiFormation.level || 'beginner',
    language: apiFormation.language || 'fr',
    certificate: apiFormation.certificate || false
  };
};

// ======= COMPOSANT PRINCIPAL =======
const FormationBuilder: React.FC<FormationBuilderProps> = ({ 
  initialFormation, 
  onSave,
  onPublish,
  onDelete,
  isNew = false 
}) => {
  const [formation, setFormation] = useState<Formation>(() => {
    if (initialFormation) {
      return convertApiFormationToBuilderFormat(initialFormation);
    }
    return {
      id: 0,
      titre: 'Ma Nouvelle Formation Premium',
      description: 'Une formation moderne et interactive',
      statut: 'draft',
      prix: 0,
      duree_estimee: 0,
      modules: [],
      tags: [],
      category: 'development',
      level: 'beginner',
      language: 'fr',
      certificate: true
    };
  });

  const [activeView, setActiveView] = useState<'builder' | 'preview' | 'analytics'>('builder');
  const [previewMode, setPreviewMode] = useState(PREVIEW_MODES.DESKTOP);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { addNotification } = useNotifications();
  const { addModule, addChapter, addContentBlock, updateContentBlock, deleteContentBlock } = 
    useFormationActions(formation, setFormation);

  // Détecter les changements non sauvegardés
  useEffect(() => {
    if (initialFormation) {
      setHasUnsavedChanges(true);
    }
  }, [formation]);

  // Sauvegarder automatiquement en mode brouillon
  useEffect(() => {
    if (hasUnsavedChanges && formation.statut === 'draft' && !isNew) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save après 30 secondes d'inactivité

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formation, hasUnsavedChanges]);

  // ======= FONCTIONS DE SAUVEGARDE =======
  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(formation);
        setHasUnsavedChanges(false);
        setSaved(true);
        addNotification('Formation sauvegardée avec succès', 'success');
        setTimeout(() => setSaved(false), 3000);
      } else {
        // Fallback pour la démo
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSaved(true);
        addNotification('Formation sauvegardée avec succès', 'success');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      addNotification('Erreur lors de la sauvegarde', 'error');
      setErrors(['Erreur lors de la sauvegarde']);
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    try {
      if (onSave && formation.statut === 'draft') {
        await onSave(formation);
        setHasUnsavedChanges(false);
        addNotification('Sauvegarde automatique effectuée', 'info');
      }
    } catch (error) {
      console.error('Erreur sauvegarde automatique:', error);
    }
  };

  const handlePublish = async () => {
    // Validation avant publication
    const validationErrors = validateFormation(formation);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      addNotification('Veuillez corriger les erreurs avant de publier', 'error');
      return;
    }

    setSaving(true);
    try {
      const publishedFormation = { ...formation, statut: 'published' as const };
      setFormation(publishedFormation);
      
      if (onPublish) {
        await onPublish(publishedFormation);
      } else if (onSave) {
        await onSave(publishedFormation);
      }
      
      setHasUnsavedChanges(false);
      addNotification('Formation publiée avec succès', 'success');
    } catch (error) {
      addNotification('Erreur lors de la publication', 'error');
      console.error('Erreur publication:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        if (onDelete) {
          await onDelete(formation.id);
          addNotification('Formation supprimée avec succès', 'success');
          // Redirection sera gérée par le parent
        }
      } catch (error) {
        addNotification('Erreur lors de la suppression', 'error');
        console.error('Erreur suppression:', error);
      }
    }
  };

  // ======= VALIDATION =======
  const validateFormation = (formation: Formation): string[] => {
    const errors: string[] = [];
    
    if (!formation.titre.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    if (!formation.description?.trim()) {
      errors.push('La description est obligatoire');
    }
    
    if (formation.modules.length === 0) {
      errors.push('Au moins un module est requis');
    }
    
    formation.modules.forEach((module, moduleIndex) => {
      if (module.chapitres.length === 0) {
        errors.push(`Le module ${moduleIndex + 1} doit contenir au moins un chapitre`);
      }
      
      module.chapitres.forEach((chapter, chapterIndex) => {
        if (chapter.contenu.length === 0) {
          errors.push(`Le chapitre ${chapterIndex + 1} du module ${moduleIndex + 1} doit contenir du contenu`);
        }
      });
    });
    
    return errors;
  };

  // ======= GESTION DES ÉVÉNEMENTS =======
  const handleFormationUpdate = (updates: Partial<Formation>) => {
    setFormation(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  // ======= RENDU PRINCIPAL =======
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <PremiumHeader
        formation={formation}
        activeView={activeView}
        setActiveView={setActiveView}
        previewMode={previewMode}
        setPreviewMode={(mode: string) => setPreviewMode(mode as typeof PREVIEW_MODES.DESKTOP)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        saving={saving}
        saved={saved}
        errors={errors}
        onSave={handleSave}
        hasUnsavedChanges={hasUnsavedChanges}
        onPublish={handlePublish}
        onDelete={onDelete ? handleDelete : undefined}
        isNew={isNew}
      />
      
      <div className="flex">
        {/* Sidebar des paramètres */}
        {showSettings && (
          <SettingsSidebar 
            formation={formation} 
            setFormation={handleFormationUpdate}
            initialFormation={initialFormation}
          />
        )}

        {/* Zone principale */}
        <div className="flex-1 max-h-screen overflow-y-auto">
          {activeView === 'builder' ? (
            <BuilderView 
              formation={formation}
              addModule={addModule}
              addChapter={addChapter}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              selectedChapter={selectedChapter}
              setSelectedChapter={setSelectedChapter}
              onFormationUpdate={handleFormationUpdate}
            />
          ) : activeView === 'preview' ? (
            <PreviewView formation={formation} previewMode={previewMode} />
          ) : (
            <AnalyticsView formation={formation} />
          )}
        </div>
      </div>

      {/* Indicateur de changements non sauvegardés */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg animate-fadeInUp">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Modifications non sauvegardées</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ======= COMPOSANT WRAPPER AVEC NOTIFICATIONS =======
const FormationBuilderWithNotifications: React.FC<FormationBuilderProps> = (props) => {
  return (
    <NotificationProvider>
      <FormationBuilder {...props} />
    </NotificationProvider>
  );
};

// ======= SIDEBAR DES PARAMÈTRES AMÉLIORÉE =======
interface SettingsSidebarProps {
  formation: Formation;
  setFormation: (updates: Partial<Formation>) => void;
  initialFormation?: FormationFromAPI;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ formation, setFormation, initialFormation }) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 space-y-6 max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Paramètres</h2>
        {initialFormation && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            ID: {initialFormation.id}
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Informations générales</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Titre</label>
            <input
              type="text"
              value={formation.titre}
              onChange={(e) => setFormation({ titre: e.target.value })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={formation.description || ''}
              onChange={(e) => setFormation({ description: e.target.value })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Décrivez votre formation..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prix (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formation.prix}
                onChange={(e) => setFormation({ prix: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Niveau</label>
              <select
                value={formation.level || 'beginner'}
                onChange={(e) => setFormation({ level: e.target.value as Formation['level'] })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Statut</label>
            <select
              value={formation.statut}
              onChange={(e) => setFormation({ statut: e.target.value as Formation['statut'] })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Image de couverture</label>
            <PremiumImageUploader
              currentImage={formation.miniature}
              onImageUploaded={(url) => setFormation({ miniature: url })}
              placeholder="Image de couverture de la formation"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formation.certificate || false}
                onChange={(e) => setFormation({ certificate: e.target.checked })}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Formation certifiante</span>
            </label>
          </div>
        </div>

        {/* Métadonnées de l'API */}
        {initialFormation && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Métadonnées</h3>
            <div className="space-y-2 text-sm">
              {initialFormation.date_creation && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Créée le:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(initialFormation.date_creation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {initialFormation.cree_par && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Créée par:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{initialFormation.cree_par}</span>
                </div>
              )}
              {initialFormation.nombre_inscrits !== undefined && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Inscrits:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{initialFormation.nombre_inscrits}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <FormationStatistics formation={formation} />
      </div>
    </div>
  );
};

// ======= STATISTIQUES DE FORMATION =======
const FormationStatistics: React.FC<{ formation: Formation }> = ({ formation }) => {
  const totalModules = formation.modules.length;
  const totalChapters = formation.modules.reduce((acc, module) => acc + module.chapitres.length, 0);
  const totalContent = formation.modules.reduce((acc, module) => 
    acc + module.chapitres.reduce((chAcc, chapter) => chAcc + chapter.contenu.length, 0), 0);
  const totalDuration = Math.ceil(formation.modules.reduce((acc, module) => acc + module.duree_estimee, 0) / 60);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Statistiques</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalModules}</div>
          <div className="text-gray-600 dark:text-gray-400">Modules</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{totalChapters}</div>
          <div className="text-gray-600 dark:text-gray-400">Chapitres</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{totalContent}</div>
          <div className="text-gray-600 dark:text-gray-400">Contenus</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{totalDuration}h</div>
          <div className="text-gray-600 dark:text-gray-400">Durée</div>
        </div>
      </div>
    </div>
  );
};

// Composants restants (BuilderView, PreviewView, etc.) restent identiques
// ... (inclure les autres composants du FormationBuilder original)

export default FormationBuilderWithNotifications;