// services/upload.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const uploadService = {
  async uploadImage(file: File): Promise<{
    success: boolean;
    urls?: { original: string; medium: string; thumbnail: string };
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      return { success: true, urls: data.urls };
    } catch (error) {
      console.error('Erreur upload:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload' 
      };
    }
  },

  async uploadFile(file: File): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      return { success: true, url: data.url };
    } catch (error) {
      console.error('Erreur upload:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload' 
      };
    }
  },

  async processVideoUrl(url: string): Promise<{
    success: boolean;
    video?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/video-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'URL non valide');
      }

      return { success: true, video: data.video };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du traitement' 
      };
    }
  },

  async deleteUpload(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/${filename}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur suppression:', error);
      return false;
    }
  }
};