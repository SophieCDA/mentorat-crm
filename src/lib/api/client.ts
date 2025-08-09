// lib/api/client.ts
import { authService } from '@/lib/services/auth.service';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  params?: Record<string, any>;
  responseType?: 'json' | 'blob' | 'text';
  body?: any; // Ajout pour accepter tout type de body (objet, string, etc.)
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  // Helper pour construire les query parameters
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      params,
      responseType = 'json',
      ...customConfig
    } = config;

    // Construire l'URL avec les query parameters
    const url = `${this.baseURL}${endpoint}${this.buildQueryString(params)}`;

    // Headers par défaut (ne pas ajouter Content-Type pour FormData)
    const headers: HeadersInit = {
      ...customConfig.headers,
    };

    // Ajouter Content-Type seulement si ce n'est pas FormData
    if (!(customConfig.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...customConfig,
      headers,
      credentials: requiresAuth ? 'include' : 'same-origin',
    });

    // Si non autorisé, tenter de rafraîchir l'authentification
    if (response.status === 401 && requiresAuth) {
      try {
        await authService.refreshAuth();
        // Réessayer la requête après rafraîchissement
        return this.request(endpoint, config);
      } catch {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        await authService.logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    }

    // Gérer les autres erreurs HTTP
    if (!response.ok) {
      let errorMessage = 'Une erreur est survenue';
      try {
        const error = await response.json();
        errorMessage = error.message || error.detail || errorMessage;
      } catch {
        // Si la réponse n'est pas du JSON, utiliser le statut HTTP
        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parser la réponse selon le type attendu
    try {
      if (responseType === 'blob') {
        return await response.blob() as unknown as T;
      } else if (responseType === 'text') {
        return await response.text() as unknown as T;
      } else {
        return await response.json();
      }
    } catch {
      // Si la réponse n'est pas du type attendu, retourner un objet vide
      return {} as T;
    }
  }

  // Méthodes HTTP avec support des query parameters
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    // Si body est FormData, ne pas le stringifier
    const requestBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: requestBody,
    });
  }

  put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    const requestBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);

    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: requestBody,
    });
  }

  patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    const requestBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);

    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: requestBody,
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    // Support du body pour DELETE (pour suppression en masse)
    if (config?.body) {
      return this.request<T>(endpoint, {
        ...config,
        method: 'DELETE',
        body: JSON.stringify(config.body),
      });
    }
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Méthode pour upload de fichiers (utilise maintenant post avec FormData)
  async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    return this.post<T>(endpoint, formData, config);
  }

  // Méthode pour télécharger des fichiers
  async download(endpoint: string, filename: string, config?: RequestConfig): Promise<void> {
    try {
      const blob = await this.get<Blob>(endpoint, {
        ...config,
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Erreur lors du téléchargement: ${error}`);
    }
  }

  // Méthodes utilitaires pour des cas d'usage spécifiques
  async getWithParams<T>(endpoint: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
    return this.get<T>(endpoint, { ...config, params });
  }

  async deleteMany<T>(endpoint: string, ids: number[], config?: RequestConfig): Promise<T> {
    return this.delete<T>(endpoint, {
      ...config,
      body: ids.length > 0 ? JSON.stringify({ ids }) : undefined,
    });
  }

  async getTags(params?: { search?: string; couleur?: string; sort_by?: string; sort_order?: string; page?: number; limit?: number }) {
    return this.get('/api/tags', { params });
  }

  async getTag(tagId: number) {
    return this.get(`/api/tags/${tagId}`);
  }

  async createTag(data: { nom: string; couleur: string; description?: string }) {
    return this.post('/api/tags', data);
  }

  async updateTag(tagId: number, data: { nom?: string; couleur?: string; description?: string }) {
    return this.put(`/api/tags/${tagId}`, data);
  }

  async deleteTag(tagId: number) {
    return this.delete(`/api/tags/${tagId}`);
  }

  async bulkDeleteTags(tagIds: number[]) {
    return this.delete('/api/tags/bulk', { body: { tag_ids: tagIds } });
  }

  async addTagToContacts(tagId: number, contactIds: number[]) {
    return this.post(`/api/tags/${tagId}/contacts`, {
      tag_ids: [tagId],
      contact_ids: contactIds,
      operation: 'add'
    });
  }

  async removeTagFromContacts(tagId: number, contactIds: number[]) {
    return this.post(`/api/tags/${tagId}/contacts`, {
      tag_ids: [tagId],
      contact_ids: contactIds,
      operation: 'remove'
    });
  }

  async bulkTagOperation(tagIds: number[], contactIds: number[], operation: 'add' | 'remove') {
    return this.post('/api/tags/bulk-operation', {
      tag_ids: tagIds,
      contact_ids: contactIds,
      operation
    });
  }

  async mergeTags(sourceTagId: number, targetTagId: number) {
    return this.post('/api/tags/merge', {
      source_tag_id: sourceTagId,
      target_tag_id: targetTagId
    });
  }

  async duplicateTag(tagId: number, newName: string) {
    return this.post('/api/tags/duplicate', {
      tag_id: tagId,
      new_name: newName
    });
  }

  async getTagStats() {
    return this.get('/api/tags/stats');
  }

  async getTagAnalytics(tagId: number) {
    return this.get(`/api/tags/${tagId}/analytics`);
  }

  async getPopularTags(limit: number = 10) {
    return this.get('/api/tags/popular', { params: { limit } });
  }
}

// Export de l'instance unique
export const apiClient = new ApiClient();

// Export du type pour les configurations si nécessaire
export type { RequestConfig };