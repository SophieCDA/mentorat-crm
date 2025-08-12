// components/formations/FormationCard.tsx
import React from 'react';
import { Edit, Eye, Send, Trash2 } from 'lucide-react';
import { Formation, FormationStatus } from '@/types/formation.types';
import { Card, Badge, Button } from '@/components/formations/common';

interface FormationCardProps {
  formation: Formation;
  onEdit: (id: string | number) => void;
  onPreview: (formation: Formation) => void;
  onPublish: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

export const FormationCard: React.FC<FormationCardProps> = ({
  formation,
  onEdit,
  onPreview,
  onPublish,
  onDelete
}) => {
  const getStatusBadge = (status: FormationStatus) => {
    const config: Record<FormationStatus, 'success' | 'warning' | 'default'> = {
      active: 'success',
      brouillon: 'warning',
      archivee: 'default'
    };
    const labels: Record<FormationStatus, string> = {
      active: 'Active',
      brouillon: 'Brouillon',
      archivee: 'Archivée'
    };
    return <Badge variant={config[status]}>{labels[status]}</Badge>;
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 relative">
        <div className="absolute top-4 right-4">
          {getStatusBadge((formation.statut ?? 'brouillon') as FormationStatus)}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{formation.titre}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {formation.description || 'Aucune description'}
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formation.nombre_inscrits || 0}
            </div>
            <div className="text-xs text-gray-500">Inscrits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {formation.duree_estimee || 0}h
            </div>
            <div className="text-xs text-gray-500">Durée</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {formation.prix || 0}€
            </div>
            <div className="text-xs text-gray-500">Prix</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => formation.id && onEdit(formation.id)}
            variant="ghost"
            size="sm"
            icon={Edit}
          >
            Éditer
          </Button>
          <Button
            onClick={() => onPreview(formation)}
            variant="ghost"
            size="sm"
            icon={Eye}
          >
            Aperçu
          </Button>
          {formation.statut === 'brouillon' && (
            <Button
              onClick={() => formation.id && onPublish(formation.id)}
              variant="ghost"
              size="sm"
              icon={Send}
            >
              Publier
            </Button>
          )}
          <Button
            onClick={() => formation.id && onDelete(formation.id)}
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-500 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};