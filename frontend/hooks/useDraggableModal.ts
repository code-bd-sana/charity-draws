"use client";

import { useState, useEffect, useRef } from "react";

export interface UseDraggableModalOptions {
  resetKey?: any;
  minVisibleX?: number;
  minVisibleY?: number;
}

export function useDraggableModal(
  isOpen: boolean,
  options: UseDraggableModalOptions = {}
) {
  const { resetKey, minVisibleX = 80, minVisibleY = 40 } = options;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset position whenever modal opens or resetKey changes
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, resetKey]);

  // Window drag event listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      let nextX = dragStartRef.current.initialX + dx;
      let nextY = dragStartRef.current.initialY + dy;

      if (modalRef.current) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const minX = -screenWidth / 2 + minVisibleX;
        const maxX = screenWidth / 2 - minVisibleX;
        const minY = -screenHeight / 2 + minVisibleY;
        const maxY = screenHeight / 2 - minVisibleY;

        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextY = Math.max(minY, Math.min(maxY, nextY));
      }

      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;

      let nextX = dragStartRef.current.initialX + dx;
      let nextY = dragStartRef.current.initialY + dy;

      if (modalRef.current) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const minX = -screenWidth / 2 + minVisibleX;
        const maxX = screenWidth / 2 - minVisibleX;
        const minY = -screenHeight / 2 + minVisibleY;
        const maxY = screenHeight / 2 - minVisibleY;

        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextY = Math.max(minY, Math.min(maxY, nextY));
      }

      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, minVisibleX, minVisibleY]);

  const handleStartDrag = (
    clientX: number,
    clientY: number,
    target: EventTarget | null
  ) => {
    // Prevent dragging when clicking interactive elements
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, input, select, textarea, label, [role='button']")
    ) {
      return;
    }

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
    setIsDragging(true);
  };

  const dragHandleProps = {
    onMouseDown: (e: React.MouseEvent) => {
      if (e.button === 0) {
        handleStartDrag(e.clientX, e.clientY, e.target);
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    },
    onDoubleClick: () => setPosition({ x: 0, y: 0 }),
  };

  const modalStyle: React.CSSProperties = {
    transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0)`,
    transition: isDragging
      ? "none"
      : "transform 0.12s ease-out, box-shadow 0.2s ease",
  };

  const isMoved = position.x !== 0 || position.y !== 0;

  return {
    modalRef,
    position,
    setPosition,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition: () => setPosition({ x: 0, y: 0 }),
  };
}
