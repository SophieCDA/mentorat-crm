import { useState, useRef, useEffect, useCallback } from "react";

export const useAutoSave = (data: any, onSave: () => void, delay = 5000) => {
  const [hasChanges, setHasChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hasChanges) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        onSave();
        setHasChanges(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, hasChanges, onSave, delay]);

  const triggerAutoSave = useCallback(() => {
    setHasChanges(true);
  }, []);

  return { triggerAutoSave, hasChanges };
};

export const useDragAndDrop = (items: any[], onReorder: (items: any[]) => void) => {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  
    const handleDragStart = useCallback((index: number) => {
      setDraggedItem(index);
    }, []);
  
    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragOverItem(index);
    }, []);
  
    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedItem === null) return;
  
      const draggedContent = items[draggedItem];
      const newItems = [...items];
      
      // Retirer l'élément de sa position d'origine
      newItems.splice(draggedItem, 1);
      
      // L'insérer à la nouvelle position
      const adjustedDropIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
      newItems.splice(adjustedDropIndex, 0, draggedContent);
      
      // Mettre à jour les ordres
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        ordre: index + 1
      }));
  
      onReorder(reorderedItems);
      setDraggedItem(null);
      setDragOverItem(null);
    }, [items, draggedItem, onReorder]);
  
    return {
      draggedItem,
      dragOverItem,
      handleDragStart,
      handleDragOver,
      handleDrop
    };
  };