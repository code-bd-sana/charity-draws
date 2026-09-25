import React, { useEffect } from "react";
import { RaffleFormData } from "./CreateRaffleWizard";
import { usePublicCategories } from "../../../../hooks/useCategoryHooks";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
}

export default function CreateRaffleStep1({ formData, updateForm, onNext }: Props) {
  const { data: categories = [], isLoading } = usePublicCategories();

  // If formData.category is empty or default, set to first available dynamic category
  useEffect(() => {
    if (categories.length > 0) {
      const exists = categories.some(
        (c) => c.name.toLowerCase() === formData.category?.toLowerCase() || c.slug === formData.category
      );
      if (!exists || !formData.category) {
        updateForm({ category: categories[0].name });
      }
    }
  }, [categories, formData.category, updateForm]);

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
          Basic Details
        </h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Start by giving your raffle a catchy title, choosing a verified category, and adding a clear description.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
            Raffle Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            placeholder="e.g. Luxury Tech Bundle or Cash Prize"
            className="h-11 px-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Dynamic Category Selector */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary flex items-center justify-between">
            <span>Category</span>
            {isLoading && (
              <span className="text-[11px] text-primary animate-pulse font-normal">Loading categories...</span>
            )}
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => updateForm({ category: e.target.value })}
              disabled={isLoading}
              className="w-full h-11 px-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <option value="">Loading categories...</option>
              ) : categories.length === 0 ? (
                <option value="General">General</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            <svg
              className="w-5 h-5 text-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Describe the item, condition, and any rules..."
            className="h-32 p-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end mt-8 pt-6 border-t border-divider">
        <button
          onClick={onNext}
          disabled={!formData.title.trim()}
          className="h-11 px-8 bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all rounded-button flex items-center justify-center shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next Step &rarr;</span>
        </button>
      </div>
    </div>
  );
}
