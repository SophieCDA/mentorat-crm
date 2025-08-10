// src/app/dashboard/formations/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Formation } from '@/types/formation.types';
import { formationService } from '@/lib/services/formation.service';
import FormationBuilder from '@/components/formations/FormationBuilder';

export default function EditFormationPage() {
  const params = useParams();
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

  return <FormationBuilder initialFormation={formation} />;
}