// src/lib/services/formation.service.ts
import { apiClient } from '@/lib/api/client';
import { Formation, Module, Chapter, ContentBlock, FormationFilters, FormationStats } from '@/types/formation.types';

class FormationService {
  // Formations
  async getFormations(filters?: FormationFilters) {
    return await apiClient.get<{ formations: Formation[]; total: number }>('/api/formations', {
      params: filters
    });
  }

  async getFormation(id: number) {
    return await apiClient.get<{ formation: Formation }>(`/api/formations/${id}`);
  }

  async createFormation(data: Partial<Formation>) {
    return await apiClient.post<{ formation: Formation }>('/api/formations', data);
  }

  async updateFormation(id: number, data: Partial<Formation>) {
    return await apiClient.put<{ formation: Formation }>(`/api/formations/${id}`, data);
  }

  async deleteFormation(id: number) {
    return await apiClient.delete(`/api/formations/${id}`);
  }

  async publishFormation(id: number) {
    return await apiClient.post(`/api/formations/${id}/publish`);
  }

  async duplicateFormation(id: number, newTitle?: string) {
    return await apiClient.post<{ formation: Formation }>(`/api/formations/${id}/duplicate`, {
      nouveau_titre: newTitle
    });
  }

  // Modules
  async createModule(formationId: number, data: Partial<Module>) {
    return await apiClient.post<{ module: Module }>(`/api/formations/${formationId}/modules`, data);
  }

  async updateModule(moduleId: number, data: Partial<Module>) {
    return await apiClient.put<{ module: Module }>(`/api/modules/${moduleId}`, data);
  }

  async deleteModule(moduleId: number) {
    return await apiClient.delete(`/api/modules/${moduleId}`);
  }

  // Chapitres
  async createChapter(moduleId: number, data: Partial<Chapter>) {
    return await apiClient.post<{ chapter: Chapter }>(`/api/modules/${moduleId}/chapters`, data);
  }

  async updateChapter(chapterId: number, data: Partial<Chapter>) {
    return await apiClient.put<{ chapter: Chapter }>(`/api/chapters/${chapterId}`, data);
  }

  async deleteChapter(chapterId: number) {
    return await apiClient.delete(`/api/chapters/${chapterId}`);
  }

  async updateChapterContent(chapterId: number, content: ContentBlock[]) {
    return await apiClient.put(`/api/chapters/${chapterId}/content`, { contenu: content });
  }

  // Upload de fichiers
  async uploadFile(file: File, type: 'image' | 'video' | 'audio' | 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return await apiClient.post<{
      url: string;
      filename: string;
      size: number;
      type: string;
    }>('/api/formations/upload', formData);
  }

  // Statistiques
  async getStats() {
    return await apiClient.get<FormationStats>('/api/formations/stats');
  }

  // Validation
  async validateFormation(id: number) {
    return await apiClient.post<{
      valid: boolean;
      errors: string[];
      warnings: string[];
    }>(`/api/formations/${id}/validate`);
  }

  // Auto-save
  async autoSave(formationId: number, data: any) {
    return await apiClient.post(`/api/formations/${formationId}/autosave`, {
      data,
      timestamp: new Date().toISOString()
    });
  }
}

export const formationService = new FormationService();