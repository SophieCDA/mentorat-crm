// hooks/useFormations.ts
import { useState, useEffect, useCallback } from 'react';
import { Formation } from '@/types/formation.types'; // Adjust the import path as necessary
import { formationsAPI } from '@/lib/services/formation.service'; // Adjust the import path as necessary

interface UseFormationsReturn {
  formations: Formation[];
  loading: boolean;
  error: string | null;
  refreshFormations: () => Promise<void>;
  createFormation: (formation: Formation) => Promise<boolean>;
  updateFormation: (id: string | number, formation: Formation) => Promise<boolean>;
  deleteFormation: (id: string | number) => Promise<boolean>;
  publishFormation: (id: string | number) => Promise<boolean>;
  archiveFormation: (id: string | number) => Promise<boolean>;
}

export const useFormations = (): UseFormationsReturn => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFormations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await formationsAPI.getAll();
      setFormations(data);
    } catch (err) {
      setError('Erreur lors du chargement des formations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFormation = useCallback(async (formation: Formation): Promise<boolean> => {
    try {
      const result = await formationsAPI.create(formation);
      if (result) {
        await refreshFormations();
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la création de la formation');
      console.error(err);
      return false;
    }
  }, [refreshFormations]);

  const updateFormation = useCallback(async (id: string | number, formation: Formation): Promise<boolean> => {
    try {
      const result = await formationsAPI.update(id, formation);
      if (result) {
        await refreshFormations();
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la mise à jour de la formation');
      console.error(err);
      return false;
    }
  }, [refreshFormations]);

  const deleteFormation = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const result = await formationsAPI.delete(id);
      if (result) {
        await refreshFormations();
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la suppression de la formation');
      console.error(err);
      return false;
    }
  }, [refreshFormations]);

  const publishFormation = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const result = await formationsAPI.publish(id);
      if (result) {
        await refreshFormations();
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la publication de la formation');
      console.error(err);
      return false;
    }
  }, [refreshFormations]);

  const archiveFormation = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const result = await formationsAPI.archive(id);
      if (result) {
        await refreshFormations();
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de l\'archivage de la formation');
      console.error(err);
      return false;
    }
  }, [refreshFormations]);

  useEffect(() => {
    refreshFormations();
  }, [refreshFormations]);

  return {
    formations,
    loading,
    error,
    refreshFormations,
    createFormation,
    updateFormation,
    deleteFormation,
    publishFormation,
    archiveFormation
  };
};