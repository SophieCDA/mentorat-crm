// services/api/formations.ts
import { Formation } from '@/types/formation.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const formationsAPI = {
  // Récupérer toutes les formations
  async getAll(): Promise<Formation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des formations');
      const data = await response.json();
      return data.formations || [];
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  },

  // Récupérer une formation par ID
  async getById(id: string | number): Promise<Formation | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations/${id}`);
      if (!response.ok) throw new Error('Formation non trouvée');
      const data = await response.json();
      return data.formation;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  },

  // Créer une nouvelle formation
  async create(formation: Formation): Promise<Formation | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formation)
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      const data = await response.json();
      return data.formation;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  },

  // Mettre à jour une formation
  async update(id: string | number, formation: Formation): Promise<Formation | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formation)
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      const data = await response.json();
      return data.formation;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  },

  // Supprimer une formation
  async delete(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  },

  // Publier une formation
  async publish(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations/${id}/publish`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  },

  // Archiver une formation
  async archive(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations/${id}/archive`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  }
};