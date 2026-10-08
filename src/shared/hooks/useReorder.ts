import { useState, type DragEvent } from 'react';

// 목록 순서 변경: 위/아래 버튼 + 드래그 앤 드롭
export function useReorder<T>(items: T[], setItems: (items: T[]) => void) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const swap = (index: number, target: number) => {
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const moveUp = (index: number) => swap(index, index - 1);
  const moveDown = (index: number) => swap(index, index + 1);

  // 드래그할 항목 요소에 펼쳐서 붙인다: <div {...dragHandlers(index)}>
  const dragHandlers = (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== index) {
        const next = [...items];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(index, 0, moved);
        setItems(next);
      }
      setDraggedIndex(null);
    },
    onDragEnd: () => setDraggedIndex(null),
  });

  return { draggedIndex, moveUp, moveDown, dragHandlers };
}
