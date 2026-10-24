"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface WonInstantPrize {
  ticketNumber: number;
  title: string;
}

interface WinAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: WonInstantPrize[];
}

function FastRollingNumbers() {
  const [numbers, setNumbers] = useState(["0", "0", "0", "0"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNumbers([
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
      ]);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2 items-center justify-center font-heading text-[40px] text-text-brand blur-[0.5px] opacity-90">
      {numbers.map((num, i) => (
        <div key={i} className="w-[50px] text-center bg-surface rounded-lg py-2 border border-border shadow-sm text-primary font-bold">
          {num}
        </div>
      ))}
    </div>
  );
}

export default function WinAnimationModal({ isOpen, onClose, prizes }: WinAnimationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<"rolling" | "revealed">("rolling");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStage("rolling");
      const timer = setTimeout(() => {
        setStage("revealed");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-surface border border-border p-1 rounded-[24px] shadow-card max-w-md w-[90%] overflow-hidden animate-in zoom-in-95 duration-500 z-[10000]">
        
        {/* Animated Glowing Border Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#B766F3] to-[#16A6DC] opacity-25 animate-[spin_4s_linear_infinite]" />
        
        <div className="relative bg-surface p-8 rounded-[22px] flex flex-col items-center text-center z-10 h-full w-full">
          
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-full bg-accent-bg border border-border flex items-center justify-center mb-6 shadow-glow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>

          <h2 className="font-heading font-bold text-3xl text-text-primary mb-2 tracking-wide uppercase">
            {stage === "rolling" ? "Checking Tickets..." : "Congratulations!"}
          </h2>
          
          <p className="font-sans text-[13px] text-text-brand mb-8 uppercase tracking-[1.5px] font-semibold">
            {stage === "rolling" ? "Locating Instant Wins" : "You won an Instant Prize!"}
          </p>

          {/* Roller / Prize Display */}
          <div className="w-full bg-elevated border border-border rounded-xl p-6 mb-8 relative overflow-hidden h-[120px] flex items-center justify-center shadow-inner">
            
            {/* The Slot Machine "Spinning" Effect */}
            {stage === "rolling" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <FastRollingNumbers />
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3 max-h-[100px] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500 fade-in">
                {prizes.map((prize, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg shadow-sm">
                    <span className="font-sans text-text-muted text-[11px] uppercase font-bold tracking-wide">
                      Ticket #{prize.ticketNumber}
                    </span>
                    <span className="font-heading font-semibold text-text-brand text-lg">
                      {prize.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Inner shadow overlay for roller effect */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.06),inset_0_-20px_20px_-10px_rgba(0,0,0,0.06)]" />
          </div>

          <button 
            onClick={onClose}
            disabled={stage === "rolling"}
            className={`w-full h-12 rounded-[10px] font-heading font-semibold text-[15px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              stage === "rolling" 
                ? "bg-accent-bg text-text-muted cursor-not-allowed border border-border"
                : "bg-primary hover:bg-primary-hover text-white shadow-glow transform hover:-translate-y-0.5"
            }`}
          >
            Claim Prize
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}