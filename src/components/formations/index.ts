// src/components/formations/index.ts

import { PremiumImageGallery } from './builder/ImageGallery';

// Types et constantes
export * from '@/types/formation.types';

// Hooks personnalisés
export * from '@/hooks/useFormationBuilder';

// Composants principaux
export { default as FormationBuilder } from '@/components/formations/FormationBuilder';
export { PremiumHeader } from '@/components/formations/builder/PremiumHeader';
export { BuilderView } from '@/components/formations/builder/BuilderView';
export { PreviewView } from '@/components/formations/builder/PreviewView';
export { AnalyticsView } from '@/components/formations/builder/AnalyticsView';

// Composants d'édition
export { PremiumTextEditor } from '@/components/formations/builder/TextEditor';
export { PremiumQuizEditor } from '@/components/formations/builder/QuizEditor';
export { ContentBlockEditor } from '@/components/formations/builder/ContentBlockEditor';
export { ContentToolbar } from '@/components/formations/builder/ContentToolbar';

// Composants d'upload
export { PremiumImageUploader } from '@/components/formations/builder/ImageUploader';
export { PremiumImageGallery } from '@/components/formations/builder/ImageGallery';

// Système de notifications
export { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';

// Styles CSS (à importer dans votre app)
// import './styles/formation-builder.css';