"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { User } from "../../../services/admin.service";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset position whenever modal opens or active user changes
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, user?.id]);

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

        // Keep at least 80px visible horizontally and 40px vertically
        const minX = -screenWidth / 2 + 80;
        const maxX = screenWidth / 2 - 80;
        const minY = -screenHeight / 2 + 40;
        const maxY = screenHeight / 2 - 40;

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
        const minX = -screenWidth / 2 + 80;
        const maxX = screenWidth / 2 - 80;
        const minY = -screenHeight / 2 + 40;
        const maxY = screenHeight / 2 - 40;
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
  }, [isDragging]);

  const handleStartDrag = (clientX: number, clientY: number, target: EventTarget | null) => {
    // Prevent dragging when clicking buttons, links, inputs
    if (target instanceof HTMLElement && target.closest("button, a, input, select")) {
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

  if (!isOpen || !user) return null;

  const getInitials = () => {
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  return (
    <>
      {/* Backdrop overlay (subtle so user can view background content when modal is dragged) */}
      <div 
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px] transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container - Draggable Window */}
      <div
        ref={modalRef}
        style={{
          transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0)`,
          transition: isDragging ? "none" : "transform 0.12s ease-out, box-shadow 0.2s ease",
        }}
        className={`fixed top-1/2 left-1/2 w-[95vw] sm:max-w-[540px] max-h-[85vh] bg-surface border border-border rounded-card ${
          isDragging ? "shadow-2xl ring-2 ring-primary/40 select-none" : "shadow-card"
        } z-50 animate-fadeIn flex flex-col p-6 sm:p-7 font-sans overflow-hidden`}
      >
        
        {/* Header - Windows-style Draggable Title Bar */}
        <div
          onMouseDown={(e) => {
            if (e.button === 0) {
              handleStartDrag(e.clientX, e.clientY, e.target);
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, e.target);
            }
          }}
          onDoubleClick={() => setPosition({ x: 0, y: 0 })}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between pb-3.5 mb-1 border-b border-border shrink-0 select-none cursor-grab active:cursor-grabbing transition-colors ${
            isDragging ? "bg-accent-bg/40 -mx-6 -mt-6 p-6 pb-3.5 mb-1 rounded-t-card" : ""
          }`}
        >
          <div className="flex items-center gap-2.5">
            {/* Grip handle icon */}
            <div className="flex items-center text-text-muted hover:text-text-brand transition-colors p-1 rounded">
              <svg className="w-4 h-4 text-text-muted opacity-70" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary leading-tight">
                User Information
              </h2>
              <span className="text-[11px] text-text-muted flex items-center gap-1 font-sans">
                <span>Hold &amp; drag to move</span>
                {(position.x !== 0 || position.y !== 0) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPosition({ x: 0, y: 0 });
                    }}
                    className="text-text-brand hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    (Reset position)
                  </button>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Reset to center button if window was dragged */}
            {(position.x !== 0 || position.y !== 0) && (
              <button
                type="button"
                onClick={() => setPosition({ x: 0, y: 0 })}
                title="Reset window to center"
                className="text-text-muted hover:text-text-brand p-1.5 rounded-button hover:bg-accent-bg transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center text-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}

            {/* Close button */}
            <button 
              onClick={onClose}
              title="Close window"
              className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-button hover:bg-accent-bg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {/* Profile Card Section */}
          <div className="flex items-center gap-4 p-4 bg-bg border border-border rounded-button mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-bg border-2 border-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-heading font-bold text-[20px] sm:text-[22px] text-text-brand tracking-wider">
                {getInitials()}
              </span>
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <h3 className="font-heading font-bold text-[15px] sm:text-[16px] text-text-primary truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "No Name Provided"}
              </h3>
              <span className="font-sans text-[12px] text-text-muted font-medium truncate">{user.email}</span>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-badge border border-border-medium bg-accent-bg text-text-brand font-sans font-semibold text-[9px] uppercase tracking-wider shadow-sm">
                  {user.role}
                </span>
                {user.isEmailVerified ? (
                  <span className="px-2.5 py-0.5 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[9px] uppercase tracking-wider shadow-sm">
                    Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[9px] uppercase tracking-wider shadow-sm">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-bg border border-border rounded-button p-3.5 flex flex-col gap-1">
              <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Tickets Purchased</span>
              <span className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary">{user.ticketsCount}</span>
            </div>
            <div className="bg-bg border border-border rounded-button p-3.5 flex flex-col gap-1">
              <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Spent</span>
              <span className="font-heading font-bold text-[18px] sm:text-[20px] text-text-brand">£{user.totalSpent.toFixed(2)}</span>
            </div>
          </div>

          {/* Info list */}
          <div className="flex flex-col gap-3 font-sans text-[13px] border-t border-border pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold">Joined Date</span>
              <span className="text-text-primary font-medium">{format(new Date(user.createdAt), "dd MMMM yyyy HH:mm")}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold">Phone Number</span>
              <span className="text-text-primary font-medium">{user.phone || "Not provided"}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold">Location</span>
              <span className="text-text-primary font-medium">{user.location || "Not provided"}</span>
            </div>

            <div className="flex items-start justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold shrink-0">Address</span>
              <span className="text-text-primary font-medium text-right max-w-[240px] line-clamp-3">{user.address || "Not provided"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted font-semibold">Status</span>
              <span>
                {user.isBlocked ? (
                  <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-semibold text-[10px] shadow-sm">Blocked / Suspended</span>
                ) : (
                  <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[10px] shadow-sm">Active / Operational</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center pt-3 border-t border-divider shrink-0">
          <button 
            onClick={onClose}
            className="w-full min-h-[44px] h-[44px] rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[14px] transition-all cursor-pointer shadow-sm flex items-center justify-center"
          >
            Close Details
          </button>
        </div>

      </div>
    </>
  );
}
