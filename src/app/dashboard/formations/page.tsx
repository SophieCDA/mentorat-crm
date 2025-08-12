// pages/FormationsDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, X } from 'lucide-react';
import { Formation } from '@/types/formation.types'; // Adjust the import path as necessary
import { formationsAPI } from '@/lib/services/formation.service'; // Adjust the import path as necessary
import { Button, Card } from '@/components/formations/common';
import { FormationCard } from '@/components/formations/FormationCard';
import { FormationEditor } from '@/components/formations/editor/FormationEditor';
import { StudentPreview } from '@/components/formations/preview/StudentPreview';

const FormationsDashboard: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormation, setPreviewFormation] = useState<Formation | null>(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const data = await formationsAPI.getAll();
      setFormations(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormation = () => {
    setEditingFormation({
      titre: 'Nouvelle Formation',
      description: '',
      prix: 0,
      duree_estimee: 0,
      niveau: 'debutant',
      modules: []
    });
    setShowEditor(true);
  };

  const handleEditFormation = async (id: string | number) => {
    const formation = await formationsAPI.getById(id);
    if (formation) {
      setEditingFormation(formation);
      setShowEditor(true);
    }
  };

  const handleSaveFormation = async (formData: Formation) => {
    if (formData.id) {
      await formationsAPI.update(formData.id, formData);
    } else {
      await formationsAPI.create(formData);
    }
    await fetchFormations();
    setShowEditor(false);
    setEditingFormation(null);
  };

  const handleDeleteFormation = async (id: string | number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;
    
    const success = await formationsAPI.delete(id);
    if (success) {
      await fetchFormations();
    }
  };

  const handlePublishFormation = async (id: string | number) => {
    const success = await formationsAPI.publish(id);
    if (success) {
      await fetchFormations();
    }
  };

  const handlePreview = (formation: Formation) => {
    setPreviewFormation(formation);
    setShowPreview(true);
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || formation.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Render Editor View
  if (showEditor) {
    return (
      <FormationEditor
        formation={editingFormation || {
          titre: '',
          description: '',
          prix: 0,
          duree_estimee: 0,
          niveau: 'debutant',
          modules: []
        }}
        onSave={handleSaveFormation}
        onCancel={() => {
          setShowEditor(false);
          setEditingFormation(null);
        }}
      />
    );
  }

  // Render Preview View
  if (showPreview && previewFormation) {
    return (
      <div>
        <button
          onClick={() => {
            setShowPreview(false);
            setPreviewFormation(null);
          }}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg flex items-center gap-2"
        >
          <X size={20} />
          Fermer l'aperçu
        </button>
        <StudentPreview formation={previewFormation} />
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Formations</h1>
              <p className="text-gray-500 mt-1">
                Gérez vos formations et contenus pédagogiques
              </p>
            </div>
            <Button onClick={handleCreateFormation} icon={Plus}>
              Nouvelle formation
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="brouillon">Brouillons</option>
              <option value="archivee">Archivées</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredFormations.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Aucune formation trouvée</p>
            <Button onClick={handleCreateFormation} icon={Plus}>
              Créer votre première formation
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                onEdit={handleEditFormation}
                onPreview={handlePreview}
                onPublish={handlePublishFormation}
                onDelete={handleDeleteFormation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationsDashboard;