import React, { useState } from "react";
import { RaffleFormData } from "./CreateRaffleWizard";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep4({ formData, updateForm, onNext, onPrev }: Props) {
  const [numInstantWins, setNumInstantWins] = useState(
    formData.instantWins.length > 0 ? formData.instantWins.length.toString() : "1"
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasInstantWins = e.target.checked;
    updateForm({ hasInstantWins });
    if (hasInstantWins && formData.instantWins.length === 0) {
      updateForm({
        instantWins: Array(parseInt(numInstantWins) || 1).fill({ prizeName: "", imageFile: null, imageUrl: null, rrpValue: "" })
      });
    }
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumInstantWins(val);
    const num = parseInt(val) || 0;
    
    if (formData.hasInstantWins) {
      const currentLength = formData.instantWins.length;
      if (num > currentLength) {
        // add more
        const toAdd = Array(num - currentLength).fill({ prizeName: "", imageFile: null, imageUrl: null, rrpValue: "" });
        updateForm({ instantWins: [...formData.instantWins, ...toAdd] });
      } else if (num < currentLength) {
        // remove some
        updateForm({ instantWins: formData.instantWins.slice(0, num) });
      }
    }
  };

  const updateInstantWin = (index: number, field: string, value: any) => {
    const updated = [...formData.instantWins];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === "imageFile") {
      updated[index].imageUrl = value ? URL.createObjectURL(value) : null;
    }
    
    updateForm({ instantWins: updated });
  };

  const applyToAll = (index: number) => {
    const source = formData.instantWins[index];
    const updated = formData.instantWins.map(iw => ({
      ...iw,
      prizeName: source.prizeName,
      imageFile: source.imageFile,
      imageUrl: source.imageUrl,
      rrpValue: source.rrpValue,
    }));
    updateForm({ instantWins: updated });
  };

  const applyFromFirst = (index: number) => {
    const source = formData.instantWins[0];
    const updated = [...formData.instantWins];
    updated[index] = {
      ...updated[index],
      prizeName: source.prizeName,
      imageFile: source.imageFile,
      imageUrl: source.imageUrl,
      rrpValue: source.rrpValue,
    };
    updateForm({ instantWins: updated });
  };

  const isValid = !formData.hasInstantWins || formData.instantWins.every(iw => iw.prizeName.trim() !== "");

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
          Instant Wins
        </h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Would you like to offer instant wins for this competition?
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded border-border bg-bg text-primary focus:ring-primary accent-primary"
            checked={formData.hasInstantWins}
            onChange={handleToggle}
          />
          <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">Enable Instant Wins</span>
        </label>

        {formData.hasInstantWins && (
          <div className="flex flex-col gap-6 mt-2 border-t border-divider pt-6">
            <div className="flex flex-col gap-2">
              <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                Number of Instant Wins
              </label>
              <input
                type="number"
                min="1"
                max={formData.totalTickets || "1000"}
                value={numInstantWins}
                onChange={handleNumChange}
                className="w-full sm:w-48 h-11 bg-bg border border-border rounded-button px-4 text-text-primary font-sans text-xs md:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.instantWins.map((iw, idx) => (
                <div key={idx} className="bg-bg border border-border rounded-card p-4 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="text-text-brand font-bold text-xs md:text-sm">Prize #{idx + 1}</h4>
                    {idx === 0 && formData.instantWins.length > 1 && (
                      <button
                        onClick={() => applyToAll(0)}
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                        title="Copy this prize's name and image to all other instant wins"
                      >
                        Apply to all
                      </button>
                    )}
                    {idx > 0 && formData.instantWins[0].prizeName && (
                      <button
                        onClick={() => applyFromFirst(idx)}
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                        title="Copy the details from Prize #1"
                      >
                        Copy from 1st
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">Prize Name*</label>
                    <input
                      type="text"
                      value={iw.prizeName}
                      onChange={(e) => updateInstantWin(idx, "prizeName", e.target.value)}
                      placeholder="e.g. TM Hi-Capa 5.1"
                      className="w-full h-10 bg-surface border border-border rounded-button px-3 text-text-primary font-sans text-xs md:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">RRP Value (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={iw.rrpValue}
                      onChange={(e) => updateInstantWin(idx, "rrpValue", e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full h-10 bg-surface border border-border rounded-button px-3 text-text-primary font-sans text-xs md:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">Prize Image</label>
                    <div className="flex items-center gap-3">
                      {iw.imageUrl && (
                        <div className="w-12 h-12 rounded-button overflow-hidden shrink-0 bg-surface border border-border shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={iw.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateInstantWin(idx, "imageFile", e.target.files?.[0] || null)}
                        className="text-xs text-text-muted file:mr-3 file:py-1 file:px-3 file:rounded-button file:border-0 file:text-xs file:font-bold file:bg-accent-bg file:text-text-brand hover:file:bg-primary hover:file:text-primary-text cursor-pointer transition-all"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-6 border-t border-divider">
        <button
          onClick={onPrev}
          className="w-full sm:w-auto h-11 px-6 rounded-button bg-bg border border-border hover:bg-accent-bg/50 text-text-primary font-semibold text-xs md:text-sm transition-all cursor-pointer"
        >
          &larr; Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full sm:w-auto h-11 px-8 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue &rarr;</span>
        </button>
      </div>
    </div>
  );
}
