// hooks/useSidebarRefresh.ts

/**
 * Hook pour déclencher le rafraîchissement des compteurs de la sidebar
 * Utilise un événement personnalisé pour communiquer avec le composant Sidebar
 */
export const useSidebarRefresh = () => {
  
    /**
     * Déclenche le rafraîchissement des compteurs dans la sidebar
     * À appeler après avoir créé/supprimé des contacts, tags, etc.
     */
    const refreshSidebarCounts = () => {
      // Émettre un événement personnalisé que la sidebar écoute
      window.dispatchEvent(new CustomEvent('refreshSidebarCounts'));
    };
  
    /**
     * Rafraîchir uniquement le compteur des contacts
     */
    const refreshContactsCount = () => {
      window.dispatchEvent(new CustomEvent('refreshSidebarCounts', { 
        detail: { type: 'contacts' } 
      }));
    };
  
    /**
     * Rafraîchir uniquement le compteur des tags
     */
    const refreshTagsCount = () => {
      window.dispatchEvent(new CustomEvent('refreshSidebarCounts', { 
        detail: { type: 'tags' } 
      }));
    };
  
    /**
     * Rafraîchir uniquement le compteur des transactions
     */
    const refreshTransactionsCount = () => {
      window.dispatchEvent(new CustomEvent('refreshSidebarCounts', { 
        detail: { type: 'transactions' } 
      }));
    };
  
    /**
     * Rafraîchir uniquement le compteur des campagnes
     */
    const refreshCampaignsCount = () => {
      window.dispatchEvent(new CustomEvent('refreshSidebarCounts', { 
        detail: { type: 'campaigns' } 
      }));
    };
  
    return {
      refreshSidebarCounts,
      refreshContactsCount,
      refreshTagsCount,
      refreshTransactionsCount,
      refreshCampaignsCount
    };
  };
  
  // Export des types pour TypeScript
  export interface SidebarRefreshEvent extends CustomEvent {
    detail: {
      type: 'contacts' | 'tags' | 'transactions' | 'campaigns';
    };
  }