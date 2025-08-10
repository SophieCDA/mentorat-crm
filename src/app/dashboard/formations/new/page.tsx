// src/app/dashboard/formations/new/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { formationService } from '@/lib/services/formation.service';
import FormationBuilder from '@/components/formations/FormationBuilder';

export default function NewFormationPage() {
  const router = useRouter();

  // Fonction pour créer une nouvelle formation
  const handleSave = async (newFormation: any) => {
    try {
      const response = await formationService.createFormation({
        titre: newFormation.titre,
        description: newFormation.description,
        statut: newFormation.statut,
        prix: newFormation.prix,
        duree_estimee: newFormation.duree_estimee,
        miniature: newFormation.miniature,
        modules: newFormation.modules,
        tags: newFormation.tags,
        category: newFormation.category,
        level: newFormation.level,
        language: newFormation.language,
        certificate: newFormation.certificate
      });
      
      // Rediriger vers la page d'édition de la formation créée
      router.push(`/dashboard/formations/${response.formation.id}/edit`);
      // No need to return the response as onSave expects a Promise<void>
      return;
    } catch (error) {
      console.error('Erreur création formation:', error);
      throw new Error('Erreur lors de la création');
    }
  };

  // Fonction de publication directe (création + publication)
  const handlePublish = async (newFormation: any) => {
    try {
      // Créer d'abord la formation
      const response = await formationService.createFormation({
        ...newFormation,
        statut: 'published'
      });
      
      // Rediriger vers la page d'édition
      router.push(`/dashboard/formations/${response.formation.id}/edit`);
      return;
    } catch (error) {
      console.error('Erreur création/publication formation:', error);
      throw new Error('Erreur lors de la création/publication');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FormationBuilder 
        onSave={handleSave}
        onPublish={handlePublish}
        isNew={true}
      />
    </div>
  );
}