'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Formation } from '@/types/formation.types';
import { formationService } from '@/lib/services/formation.service';
import FormationBuilder from '@/components/formations/FormationBuilder';

export default function EditFormationPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = parseInt(params.id as string);
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (formationId) {
      loadFormation();
    }
  }, [formationId]);

  const loadFormation = async () => {
    try {
      setLoading(true);
      const response = await formationService.getFormation(formationId);
      setFormation(response.formation);
    } catch (error) {
      console.error('Erreur chargement formation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formationData: Formation) => {
    try {
      // Convertir les données du FormationBuilder vers le format API
      const apiData = convertBuilderDataToApiFormat(formationData);
      const response = await formationService.updateFormation(formationId, apiData) as { formation: Formation };
      
      if (response?.formation) {
        setFormation(response.formation);
        console.log('Formation sauvegardée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handlePublish = async (formationData: Formation) => {
    try {
      // D'abord sauvegarder si nécessaire
      if (formationData) {
        await handleSave(formationData);
      }
      
      // Puis publier
      const response = await formationService.publishFormation(formationId) as { formation: Formation };
      
      if (response?.formation) {
        setFormation(response.formation);
        console.log('Formation publiée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await formationService.deleteFormation(id) as { message: string };
      
      if (response.message === "Formation supprimée avec succès") {
        // Rediriger vers la liste des formations après suppression
        router.push('/dashboard/formations');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  };

  // Fonction pour convertir les données du FormationBuilder vers le format API
  const convertBuilderDataToApiFormat = (builderData: any) => {
    return {
      nom: builderData.titre,
      description: builderData.description,
      prix: builderData.prix,
      duree_heures: builderData.duree_estimee,
      status: builderData.statut === 'draft' ? 'DRAFT' : 
              builderData.statut === 'published' ? 'PUBLISHED' : 'ARCHIVED',
      image_couverture: builderData.miniature,
      modules: builderData.modules?.map((module: any) => ({
        nom: module.nom || module.titre,
        description: module.description,
        ordre: module.ordre,
        duree_estimee: module.duree_estimee,
        chapitres: module.chapitres?.map((chapitre: any) => ({
          nom: chapitre.nom || chapitre.titre,
          type: chapitre.type,
          ordre: chapitre.ordre,
          contenu: JSON.stringify(chapitre.contenu || []),
          duree_estimee: chapitre.duree_estimee,
          requis_pour_progression: chapitre.requis_pour_progression || false
        })) || []
      })) || []
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7978E2]"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Formation non trouvée</h2>
        <p className="text-gray-600">La formation demandée n'existe pas ou a été supprimée.</p>
      </div>
    );
  }

  return (
    <FormationBuilder
      initialFormation={formation}
      onSave={handleSave}
      onPublish={handlePublish}
      onDelete={handleDelete}
      isNew={false}
    />
  );
}