import { useState, useCallback } from "react";

export function useDragAndDrop(setCharacters, updateChar) {
  const [dragState, setDragState] = useState({ dragging: null, over: null });
  const [weaponDragState, setWeaponDragState] = useState({ dragging: null, over: null });

  // Sidebar drag-and-drop
  const handleDragStart = useCallback((e, id) => {
    setDragState(prev => ({ ...prev, dragging: id }));
    e.dataTransfer.effectAllowed = "move";
    if (e.target) e.target.style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e) => {
    if (e.target) e.target.style.opacity = "1";
    setDragState({ dragging: null, over: null });
  }, []);

  const handleDragOver = useCallback((e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragState(prev => prev.over !== id ? { ...prev, over: id } : prev);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    setDragState(prev => {
      const dragId = prev.dragging;
      if (!dragId || dragId === targetId) return { dragging: null, over: null };
      setCharacters(items => {
        const arr = [...items];
        const dragIndex = arr.findIndex(c => c.id === dragId);
        const targetIndex = arr.findIndex(c => c.id === targetId);
        if (dragIndex === -1 || targetIndex === -1) return items;
        const [dragged] = arr.splice(dragIndex, 1);
        arr.splice(targetIndex, 0, dragged);
        return arr;
      });
      return { dragging: null, over: null };
    });
  }, [setCharacters]);

  // Weapon row drag-and-drop
  const handleWeaponDragStart = useCallback((e, idx) => {
    setWeaponDragState(prev => ({ ...prev, dragging: idx }));
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget) e.currentTarget.style.opacity = "0.4";
  }, []);

  const handleWeaponDragEnd = useCallback((e) => {
    if (e.currentTarget) e.currentTarget.style.opacity = "1";
    setWeaponDragState({ dragging: null, over: null });
  }, []);

  const handleWeaponDragOver = useCallback((e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setWeaponDragState(prev => prev.over !== idx ? { ...prev, over: idx } : prev);
  }, []);

  const handleWeaponDrop = useCallback((e, targetIdx) => {
    e.preventDefault();
    setWeaponDragState(prev => {
      const dragIdx = prev.dragging;
      if (dragIdx === null || dragIdx === targetIdx) return { dragging: null, over: null };
      updateChar(c => {
        const weapons = [...c.weapons];
        const [dragged] = weapons.splice(dragIdx, 1);
        weapons.splice(targetIdx, 0, dragged);
        return { ...c, weapons };
      });
      return { dragging: null, over: null };
    });
  }, [updateChar]);

  return {
    dragState, weaponDragState,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleWeaponDragStart, handleWeaponDragEnd, handleWeaponDragOver, handleWeaponDrop,
  };
}
