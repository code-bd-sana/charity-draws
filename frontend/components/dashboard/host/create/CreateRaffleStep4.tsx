import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RaffleFormData } from "./CreateRaffleWizard";
import { useMySubscription } from "../../../../hooks/useSubscriptionHooks";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep4({ formData, updateForm, onNext, onPrev }: Props) {
  const { data: mySubscription, isLoading: isSubscriptionLoading } = useMySubscription();

  const planName = mySubscription?.plan?.name?.toLowerCase() || "free";
  const isPaidActive =
    mySubscription?.status === "ACTIVE" &&
    (planName === "pro" || planName === "premium");

  // Automatically reset instant wins if user is on Free plan
  useEffect(() => {
    if (!isSubscriptionLoading && !isPaidActive && formData.hasInstantWins) {
      updateForm({ hasInstantWins: false, instantWins: [] });
    }
  }, [isSubscriptionLoading, isPaidActive, formData.hasInstantWins, updateForm]);

  const [numInstantWins, setNumInstantWins] = useState(
    formData.instantWins.length > 0 ? formData.instantWins.length.toString() : "1"
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPaidActive) return;
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
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
          Instant Wins
        </h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Would you like to offer instant wins for this competition?
        </p>
      </div>

      {/* Free Plan Notice / Upgrade Banner */}
      {!isSubscriptionLoading && !isPaidActive && (
        <div className="mb-6 p-5 rounded-card border border-amber-500/40 bg-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-600 text-white shadow-xs">
                  Pro &amp; Premium Exclusive
                </span>
                <span className="text-amber-950 dark:text-text-muted text-xs font-medium">
                  Current plan: <strong className="text-amber-950 dark:text-text-primary font-bold capitalize">{mySubscription?.plan?.name || "Free"}</strong>
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm md:text-base text-amber-950 dark:text-text-primary">
                Instant Wins are not available on the Free Plan
              </h3>
              <p className="font-sans text-xs md:text-sm text-amber-900/90 dark:text-text-muted leading-relaxed max-w-xl">
                Instant Wins are only applicable for <strong>Pro</strong> and <strong>Premium</strong> subscribers. If you want to enable Instant Wins for your competitions, please subscribe to upgrade your plan.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/host/billing"
            className="shrink-0 h-10 px-5 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer self-stretch md:self-auto text-center"
          >
            <span>Subscribe / Upgrade</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {!isPaidActive ? (
          <div className="flex items-center justify-between p-4 bg-bg border border-border/80 rounded-button opacity-75">
            <label className="flex items-center gap-3 cursor-not-allowed select-none">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-border bg-bg text-primary focus:ring-primary accent-primary cursor-not-allowed opacity-50"
                checked={false}
                disabled
              />
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-xs md:text-sm text-text-muted flex items-center gap-2">
                  Enable Instant Wins
                  <span className="text-[10px] bg-accent-bg border border-border px-2 py-0.5 rounded-badge text-text-muted font-medium">
                    Locked on Free Plan
                  </span>
                </span>
                <span className="font-sans text-[11px] text-text-muted">
                  If you want to enable Instant Wins, please subscribe to a Pro or Premium plan.
                </span>
              </div>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-button">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-border bg-bg text-primary focus:ring-primary accent-primary cursor-pointer"
                checked={formData.hasInstantWins}
                onChange={handleToggle}
              />
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-xs md:text-sm text-text-primary flex items-center gap-2">
                  Enable Instant Wins
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-badge font-bold uppercase">
                    Unlocked ({mySubscription?.plan?.name})
                  </span>
                </span>
                <span className="font-sans text-[11px] text-text-muted">
                  Add instant prizes that participants can win immediately when buying tickets.
                </span>
              </div>
            </label>
          </div>
        )}

        {isPaidActive && formData.hasInstantWins && (
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
