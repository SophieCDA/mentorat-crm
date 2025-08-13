// app/dashboard/formations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Formation } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';
import FormationsTable from '@/components/formations/FormationsTable';
import FormationModal from '@/components/formations/FormationModal';

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const data = await formationsAPI.getAll();
      setFormations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormation = async (data: Formation) => {
    await formationsAPI.create(data);
    setShowModal(false);
    await loadFormations();
  };

  const handleUpdateFormation = async (id: string | number, data: Formation) => {
    await formationsAPI.update(id, data);
    setEditingFormation(null);
    await loadFormations();
  };

  const handleDeleteFormation = async (id: string | number) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await formationsAPI.delete(id);
    await loadFormations();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formations</h2>
          <p className="text-sm text-gray-500">
            Gestion des formations disponibles dans la plateforme
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
        >
          Nouvelle formation
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-purple"></div>
        </div>
      ) : (
        <FormationsTable
          formations={formations}
          onEdit={(f) => setEditingFormation(f)}
          onDelete={handleDeleteFormation}
        />
      )}

      {showModal && (
        <FormationModal
          onSave={handleCreateFormation}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingFormation && (
        <FormationModal
          formation={editingFormation}
          onSave={(data) => handleUpdateFormation(editingFormation.id as string | number, data)}
          onClose={() => setEditingFormation(null)}
        />
      )}
    </div>
  );
}
