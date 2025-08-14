// src/app/dashboard/formations/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, ArrowLeft, Plus, MoreVertical, GripVertical, Trash2, Eye, 
  Type, Image, Video, HelpCircle, Download, Code, List, CheckSquare,
  ChevronDown, ChevronRight, Settings, Copy, Move, X, Upload,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight,
  Palette, Clock, Star, Lock, Unlock, BookOpen, FileText, PlayCircle,
  Layers, Grid, AlertCircle, Check, Loader2
} from 'lucide-react';
import { Formation, Module, Chapter, ContentBlock, ContentType } from '@/types/formation.types';
import { formationsAPI } from '@/lib/services/formation.service';
import FormationEditor from '@/components/formations/FormationEditor';

export default function EditFormationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState<Formation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadFormation(params.id as string);
    }
  }, [params.id]);

  const loadFormation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await formationsAPI.getById(id);
      
      if (!data) {
        setError('Formation introuvable');
        return;
      }
      
      setFormation(data);
    } catch (err) {
      console.error('Erreur lors du chargement de la formation:', err);
      setError('Erreur lors du chargement de la formation');
    } finally {
      setLoading(false);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7978E2] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Formation introuvable'}</p>
          <button
            onClick={() => router.push('/dashboard/formations')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux formations
          </button>
        </div>
      </div>
    );
  }

  // Rendu du composant éditeur
  return <FormationEditor formationId={params.id as string} />;
}