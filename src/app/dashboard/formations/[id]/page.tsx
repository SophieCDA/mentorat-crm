// app/dashboard/formations/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormationBuilder from '@/components/formations/FormationBuilder';
import { Formation } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';

export default function FormationBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await formationsAPI.getById(id);
      if (data) setFormation(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!formation) return;
    await formationsAPI.update(formation.id as string | number, formation);
    router.push('/dashboard/formations');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
      </div>
    );
  }

  if (!formation) {
    return <p className="p-6">Formation introuvable</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Composer la formation</h2>
      <FormationBuilder formation={formation} onChange={setFormation} />
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={() => router.push('/dashboard/formations')}
          className="px-4 py-2 rounded bg-gray-200"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-gradient-to-r from-crm-pink to-crm-purple text-white"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

