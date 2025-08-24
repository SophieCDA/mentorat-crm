import { Type, Video, HelpCircle, Download, CheckSquare, Image } from "lucide-react";
import { ContentType } from "@/types/formation.types";

export const blockTypesConfig: Record<ContentType, {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  description: string;
}> = {
  text: { 
    icon: Type, 
    label: 'Texte', 
    color: 'bg-blue-500',
    description: 'Contenu textuel riche'
  },
  video: { 
    icon: Video, 
    label: 'Vidéo', 
    color: 'bg-red-500',
    description: 'Intégration vidéo'
  },
  image: { 
    icon: Image, 
    label: 'Image', 
    color: 'bg-green-500',
    description: 'Image ou galerie'
  },
  quiz: { 
    icon: HelpCircle, 
    label: 'Quiz', 
    color: 'bg-purple-500',
    description: 'Questions interactives'
  },
  download: { 
    icon: Download, 
    label: 'Fichier', 
    color: 'bg-yellow-500',
    description: 'Ressource téléchargeable'
  },
  exercise: { 
    icon: CheckSquare, 
    label: 'Exercice', 
    color: 'bg-indigo-500',
    description: 'Activité pratique'
  }
};