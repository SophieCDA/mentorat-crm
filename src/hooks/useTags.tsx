import { useState, useEffect } from 'react';
import { Tag, TagFilters } from '@/types/tag.types';
import { apiClient } from '@/lib/api/client';

export function useTags(initialFilters: TagFilters = {}) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TagFilters>(initialFilters);

    const loadTags = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.getTags(filters);
            setTags(Array.isArray(response) ? response : []);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des tags');
            setTags([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTags();
    }, [filters]);

    const createTag = async (data: { nom: string; couleur: string; description?: string }) => {
        try {
            await apiClient.createTag(data);
            await loadTags();
            return true;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création du tag');
            return false;
        }
    };

    const updateTag = async (tagId: number, data: { nom?: string; couleur?: string; description?: string }) => {
        try {
            await apiClient.updateTag(tagId, data);
            await loadTags();
            return true;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la modification du tag');
            return false;
        }
    };

    const deleteTag = async (tagId: number) => {
        try {
            await apiClient.deleteTag(tagId);
            await loadTags();
            return true;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression du tag');
            return false;
        }
    };

    return {
        tags,
        loading,
        error,
        filters,
        setFilters,
        loadTags,
        createTag,
        updateTag,
        deleteTag
    };
}

export function useTagStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.getTagStats();
            setStats(response);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des statistiques');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    return { stats, loading, error, loadStats };
}
