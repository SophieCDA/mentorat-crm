// utils/mediaHelpers.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getMediaUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  // Si c'est déjà une URL complète, la retourner
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si le chemin commence par /, le retirer
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Si c'est un chemin d'upload, construire l'URL complète
  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/api/${cleanPath}`;
  }
  
  // Sinon, ajouter le préfixe uploads/formations
  return `${API_BASE_URL}/api/uploads/formations/${cleanPath}`;
};

export const getFileUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  if (cleanPath.includes('files/')) {
    return `${API_BASE_URL}/api/${cleanPath}`;
  }
  
  return `${API_BASE_URL}/api/uploads/formations/files/${cleanPath}`;
};

export const extractYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : '';
};

export const extractVimeoId = (url: string): string => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};