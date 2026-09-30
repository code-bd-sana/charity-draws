"use client";

import React, { useState, useEffect } from "react";

interface QuantityStepperInputProps {
  quantity: number;
  min: number;
  max: number | null;
  remaining: number;
  onQuantityChange: (qty: number) => void;
  size?: "sm" | "md";
}

/**
 * Reusable interactive quantity stepper with direct number input, +/- controls,
 * and prominent red validation error messaging when exceeding max or going below min.
 */
export default function QuantityStepperInput({
  quantity,
  min = 1,
  max = null,
  remaining,
  onQuantityChange,
  size = "md",
}: QuantityStepperInputProps) {
  const [localVal, setLocalVal] = useState(String(quantity));
  const [isFocused, setIsFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(String(quantity));
      setErrorMsg(null);
    }
  }, [quantity, isFocused]);

  const upperLimit = max !== null ? Math.min(max, remaining) : remaining;

  const validateInput = (num: number | null, raw: string): string | null => {
    if (raw.trim() === "" || num === null || isNaN(num) || num <= 0) {
      return "Quantity required";
    }
    if (num < min) {
      return `Min ${min} ticket${min > 1 ? "s" : ""} required`;
    }
    if (max !== null && num > max) {
      return `Max ${max} ticket${max > 1 ? "s" : ""} allowed`;
    }
    if (num > remaining) {
      return `Only ${remaining} remaining`;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setLocalVal(raw);

    if (raw === "") {
      setErrorMsg("Quantity required");
      return;
    }

    const parsed = parseInt(raw, 10);
    const err = validateInput(parsed, raw);
    setErrorMsg(err);

    if (!err && !isNaN(parsed) && parsed >= min) {
      onQuantityChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseInt(localVal, 10);
    if (isNaN(parsed) || parsed < min) {
      setLocalVal(String(min));
      onQuantityChange(min);
      setErrorMsg(null);
    } else if (max !== null && parsed > max) {
      setLocalVal(String(max));
      onQuantityChange(max);
      setErrorMsg(`Max limit is ${max} tickets`);
      setTimeout(() => setErrorMsg(null), 3000);
    } else if (parsed > remaining) {
      setLocalVal(String(remaining));
      onQuantityChange(remaining);
      setErrorMsg(`Only ${remaining} tickets left`);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setLocalVal(String(parsed));
      onQuantityChange(parsed);
      setErrorMsg(null);
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      const next = quantity - 1;
      setLocalVal(String(next));
      setErrorMsg(null);
      onQuantityChange(next);
    } else {
      setErrorMsg(`Min ${min} ticket${min > 1 ? "s" : ""} required`);
    }
  };

  const handleIncrement = () => {
    if (quantity < upperLimit) {
      const next = quantity + 1;
      setLocalVal(String(next));
      setErrorMsg(null);
      onQuantityChange(next);
    } else {
      if (max !== null && quantity >= max) {
        setErrorMsg(`Max ${max} ticket${max > 1 ? "s" : ""} allowed`);
      } else {
        setErrorMsg(`Only ${remaining} ticket${remaining > 1 ? "s" : ""} left`);
      }
    }
  };

  const isSm = size === "sm";

  return (
    <div className="flex flex-col items-center sm:items-center">
      <div
        className={`inline-flex items-center bg-bg border ${
          errorMsg ? "border-red-400 ring-2 ring-red-100 bg-red-50/20" : "border-border"
        } rounded-button ${
          isSm ? "p-0.5 gap-0.5" : "p-0.5 sm:p-1 gap-1"
        } shadow-inner/5 transition-all`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= min}
          className={`${
            isSm ? "w-6 h-6 text-sm" : "w-7 h-7 sm:w-8 sm:h-8 text-base"
          } rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors font-bold select-none`}
          aria-label="Decrease quantity"
          title="Decrease quantity"
        >
          −
        </button>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localVal}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={`${
            isSm ? "w-11 h-6 text-[12px]" : "w-14 sm:w-16 h-7 sm:h-8 text-[13px] sm:text-[14px]"
          } text-center font-heading font-bold ${
            errorMsg ? "text-red-700" : "text-text-primary"
          } bg-transparent focus:bg-surface focus:outline-none focus:ring-1 ${
            errorMsg ? "focus:ring-red-400" : "focus:ring-primary/40"
          } rounded transition-colors no-spinner px-0.5`}
          aria-label="Quantity"
          title="Directly enter ticket quantity"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= upperLimit}
          className={`${
            isSm ? "w-6 h-6 text-sm" : "w-7 h-7 sm:w-8 sm:h-8 text-base"
          } rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors font-bold select-none`}
          aria-label="Increase quantity"
          title="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Red Validation Error Message under the input */}
      {errorMsg && (
        <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1 leading-tight text-center animate-fadeIn">
          <svg className="w-3.5 h-3.5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>{errorMsg}</span>
        </span>
      )}
    </div>
  );
}
