"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetRaffleById, useUpdateRaffle, useUploadRaffleImage } from "../../../../hooks/useRaffleHooks";
import { usePublicCategories } from "../../../../hooks/useCategoryHooks";
import { formatDateForUKInput, parseUKInputToISO, formatUKDateTime } from "../../../../lib/uk-date";
import { formatCurrency } from "../../../../lib/utils";
import { toast } from "sonner";

interface Props {
  raffleId: string;
}

export default function EditRaffleForm({ raffleId }: Props) {
  const router = useRouter();
  const { data: raffle, isLoading, isError } = useGetRaffleById(raffleId);
  const { data: categories = [], isLoading: isCategoriesLoading } = usePublicCategories();
  const updateMutation = useUpdateRaffle();
  const uploadImageMutation = useUploadRaffleImage();

  const [formData, setFormData] = useState<{
    title?: string;
    category?: string;
    description?: string;
    prizeName?: string;
    totalTickets?: number | string;
    pricePerTicket?: number | string;
    startDate?: string;
    endDate?: string;
    isAutoDraw?: boolean;
    autoDrawDate?: boolean;
    autoDrawSoldOut?: boolean;
    minTicketsPerUser?: number | string;
    maxTicketsPerUser?: number | string;
  }>({});

  // Image Upload States
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (raffle) {
      setFormData({
        title: raffle.title || "",
        category: (raffle as any).category || "",
        description: raffle.description || "",
        prizeName: raffle.prizeName || "",
        totalTickets: raffle.totalTickets ?? "",
        pricePerTicket: raffle.pricePerTicket ?? "",
        startDate: formatDateForUKInput(raffle.startDate),
        endDate: formatDateForUKInput(raffle.endDate),
        isAutoDraw: Boolean(raffle.isAutoDraw),
        autoDrawDate: Boolean(raffle.autoDrawDate),
        autoDrawSoldOut: Boolean(raffle.autoDrawSoldOut),
        minTicketsPerUser: (raffle as any).minTicketsPerUser ?? 1,
        maxTicketsPerUser: (raffle as any).maxTicketsPerUser ?? "",
      });
    }
  }, [raffle]);

  const ticketsSold = raffle?.ticketsSold ?? 0;
  const hasSoldTickets = ticketsSold > 0;
  const currentCoverUrl = raffle?.mainImage || (raffle as any)?.coverImage || (raffle as any)?.images?.[0] || null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
        toast.error("Please select a valid image file (PNG, JPG, or WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5 MB.");
        return;
      }
      setSelectedImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
      toast.info("New image selected! You can upload it now or save changes.");
    }
  };

  const handleClearSelectedImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInstantImageUpload = async () => {
    if (!selectedImageFile) return;
    try {
      setIsUploadingImage(true);
      await uploadImageMutation.mutateAsync({ id: raffleId, file: selectedImageFile });
      toast.success("Competition cover image updated successfully!");
      handleClearSelectedImage();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      
      const numTotal = Number(payload.totalTickets) || 0;
      const numMin = Number(payload.minTicketsPerUser) || 1;
      const numMax = payload.maxTicketsPerUser ? Number(payload.maxTicketsPerUser) : null;

      if (numTotal > 0 && numMin > numTotal) {
        toast.error(`Minimum tickets (${numMin}) cannot exceed total competition tickets (${numTotal}).`);
        return;
      }

      if (numMax !== null && numMax > 0 && numMin > numMax) {
        toast.error(`Minimum tickets (${numMin}) cannot be greater than maximum tickets (${numMax}).`);
        return;
      }

      if (numTotal > 0 && numMax !== null && numMax > numTotal) {
        toast.error(`Maximum tickets (${numMax}) cannot exceed total competition tickets (${numTotal}).`);
        return;
      }

      // Convert dates to UK ISO string
      if (payload.startDate) payload.startDate = parseUKInputToISO(payload.startDate);
      if (payload.endDate) payload.endDate = parseUKInputToISO(payload.endDate);
      
      // Convert numbers
      if (payload.totalTickets !== undefined && payload.totalTickets !== "") {
        payload.totalTickets = Number(payload.totalTickets);
      }
      if (payload.pricePerTicket !== undefined && payload.pricePerTicket !== "") {
        payload.pricePerTicket = Number(payload.pricePerTicket);
      }
      payload.minTicketsPerUser = numMin;
      payload.maxTicketsPerUser = numMax;

      // If a new image was chosen, upload it
      if (selectedImageFile) {
        try {
          await uploadImageMutation.mutateAsync({ id: raffleId, file: selectedImageFile });
          handleClearSelectedImage();
        } catch (imgErr: any) {
          console.error("Image upload failed:", imgErr);
          toast.error("Failed to upload new image file.");
          return;
        }
      }

      await updateMutation.mutateAsync({ id: raffleId, data: payload });
      toast.success("Competition updated successfully!");
      router.push("/dashboard/host/competitions");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update competition.");
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        <div className="h-8 w-48 bg-accent-bg rounded-lg" />
        <div className="bg-surface border border-border rounded-card p-8 flex flex-col gap-6 shadow-sm">
          <div className="h-6 w-64 bg-accent-bg rounded" />
          <div className="h-4 w-96 bg-accent-bg rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="h-12 bg-accent-bg rounded-button" />
            <div className="h-12 bg-accent-bg rounded-button" />
          </div>
          <div className="h-28 bg-accent-bg rounded-button" />
        </div>
      </div>
    );
  }

  // Not Found State
  if (isError || !raffle) {
    return (
      <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="font-heading font-bold text-xl text-text-primary">Competition Not Found</h2>
        <p className="font-sans text-sm text-text-muted max-w-sm">
          The competition you are attempting to edit does not exist, or you may not have permission to edit it.
        </p>
        <Link
          href="/dashboard/host/competitions"
          className="mt-2 px-6 py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-xs transition-all shadow-sm"
        >
          ← Back to Competitions
        </Link>
      </div>
    );
  }

  // Calculate live pool valuation
  const calcTotalTickets = Number(formData.totalTickets || 0);
  const calcPricePerTicket = Number(formData.pricePerTicket || 0);
  const projectedPool = calcTotalTickets * calcPricePerTicket;

  const status = (raffle.status || "DRAFT").toUpperCase();
  const getStatusBadge = () => {
    switch (status) {
      case "ACTIVE":
      case "LIVE":
        return {
          label: "Active / Live",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500 animate-pulse",
        };
      case "PENDING_APPROVAL":
        return {
          label: "Pending Review",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "ENDED":
      case "COMPLETED":
        return {
          label: "Ended",
          className: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
      default:
        return {
          label: status,
          className: "bg-accent-bg text-text-brand border-border",
          dot: "bg-primary",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="flex flex-col gap-6 w-full font-sans pb-12">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/dashboard/host" className="hover:text-text-brand transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/host/competitions" className="hover:text-text-brand transition-colors">
            Competitions
          </Link>
          <span>/</span>
          <span className="text-text-primary font-semibold truncate max-w-xs">
            Edit: {raffle.title}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary leading-tight">
                Edit Competition
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${statusBadge.className}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-text-muted mt-1">
              Update competition details, cover photos, ticket allocations, draw timing, and automated rules.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/live-raffles/${raffle.slug || raffle.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-button bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-text-brand text-xs font-semibold shadow-sm transition-all"
            >
              <span>Public Page</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
            <Link
              href="/dashboard/host/competitions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-secondary text-xs font-semibold shadow-sm transition-all"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      {/* Regulated Consumer Protection Notice if tickets have been sold */}
      {hasSoldTickets && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-card p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 text-xs sm:text-sm text-amber-900">
            <span className="font-heading font-bold text-amber-950">
              Regulatory Consumer Protection (Locked Fields)
            </span>
            <p className="leading-relaxed text-amber-800/90">
              <strong>{ticketsSold.toLocaleString()} tickets</strong> have already been purchased for this competition. Under UK competition standards and consumer fairness rules, <strong>Total Tickets</strong> and <strong>Ticket Price</strong> are permanently locked to preserve the original odds and contract terms. All other parameters (title, cover photo, description, dates, and draw type) remain freely editable.
            </p>
          </div>
        </div>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* SECTION 1: Basic Information */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm flex flex-col gap-5">
          <div className="border-b border-divider pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                1. Basic Information
              </h2>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Competition headline, category tagging, and prize details.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-text-brand bg-accent-bg border border-border px-2.5 py-1 rounded-full">
              General
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary">
                Competition Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                placeholder="e.g. Brand New 2026 Land Rover Defender 110 or £50,000 Cash Alternative"
                className="h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            {/* Prize Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary">
                Prize Headline / Item Name
              </label>
              <input
                type="text"
                value={formData.prizeName || ""}
                onChange={(e) => handleChange("prizeName", e.target.value)}
                placeholder="e.g. Rolex Submariner Date 41mm"
                className="h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            {/* Category Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary flex items-center justify-between">
                <span>Category <span className="text-red-500">*</span></span>
                {isCategoriesLoading && (
                  <span className="text-[11px] text-primary animate-pulse font-normal">Loading categories...</span>
                )}
              </label>
              <div className="relative">
                <select
                  value={formData.category || ""}
                  onChange={(e) => handleChange("category", e.target.value)}
                  disabled={isCategoriesLoading}
                  required
                  className="w-full h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer disabled:opacity-50 font-medium"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary">
                Full Description & Specification
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                placeholder="Describe the prize specifications, manufacturer warranty, shipping details, and charity beneficiary in detail..."
                className="p-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium resize-y leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Media & Cover Image Upload */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm flex flex-col gap-5">
          <div className="border-b border-divider pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                2. Cover Photo & Media
              </h2>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Change or replace the primary promotional image displayed on cards, hero banners, and the public draw page.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-text-brand bg-accent-bg border border-border px-2.5 py-1 rounded-full">
              Media
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Current Active Cover */}
            <div className="md:col-span-5 flex flex-col gap-2">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <span>Current Cover Photo</span>
                {currentCoverUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </span>

              <div className="w-full aspect-[4/3] rounded-xl bg-accent-bg/40 border border-border overflow-hidden relative group shadow-sm flex items-center justify-center">
                {currentCoverUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentCoverUrl}
                    alt={raffle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-text-muted p-4 text-center">
                    <svg className="w-10 h-10 stroke-1 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="text-xs font-medium">No cover image uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: New Selection / File Dropzone */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <span className="text-xs font-semibold text-text-secondary">
                {selectedImageFile ? "Selected New Image Preview" : "Change / Replace Image"}
              </span>

              {selectedImageFile && imagePreviewUrl ? (
                /* New Image Selected Preview Card */
                <div className="border border-primary/40 bg-accent-bg/20 rounded-xl p-4 flex flex-col gap-3.5 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface border border-border shrink-0 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreviewUrl}
                        alt="New selected preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit mb-1">
                        ✓ Ready to upload
                      </span>
                      <span className="font-sans font-semibold text-xs text-text-primary truncate">
                        {selectedImageFile.name}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {(selectedImageFile.size / 1024).toFixed(1)} KB · {selectedImageFile.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={handleInstantImageUpload}
                      disabled={isUploadingImage}
                      className="px-4 py-2 rounded-button bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                          </svg>
                          <span>Upload & Replace Now</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary text-xs font-medium transition-all cursor-pointer"
                    >
                      Choose Different
                    </button>

                    <button
                      type="button"
                      onClick={handleClearSelectedImage}
                      className="px-3 py-2 rounded-button text-red-600 hover:bg-red-50 text-xs font-medium transition-all cursor-pointer ml-auto"
                    >
                      Cancel Selection
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone / Upload Trigger */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border hover:border-primary rounded-xl p-6 sm:p-7 flex flex-col items-center justify-center text-center gap-2.5 bg-bg/50 hover:bg-accent-bg/30 transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent-bg border border-border-medium flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-text-primary block">
                      Click to choose a new cover photo
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5 block">
                      PNG, JPG, or WEBP up to 5 MB (recommended 1200×900)
                    </span>
                  </div>
                  <span className="mt-1 px-4 py-1.5 rounded-button bg-surface border border-border text-text-brand text-xs font-semibold group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    Browse Computer
                  </span>
                </div>
              )}

              <p className="text-[11px] text-text-muted leading-relaxed">
                Tip: High-resolution images showing the authentic item increase ticket sales significantly. If you select a new image without clicking &quot;Upload & Replace Now&quot;, it will automatically be uploaded when you submit &quot;Save Changes&quot; below.
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 3: Pricing & Ticket Rules */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm flex flex-col gap-5">
          <div className="border-b border-divider pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                3. Pricing & Ticket Allocations
              </h2>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Ticket quantities, pricing per entry, and user participation bounds.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-text-brand bg-accent-bg border border-border px-2.5 py-1 rounded-full">
              Financials
            </span>
          </div>

          {/* Real-time Prize Pool Indicator Banner */}
          <div className="bg-gradient-to-r from-accent-bg via-white to-accent-bg border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                £
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Projected Competition Pool
                </span>
                <span className="font-heading font-extrabold text-xl text-text-brand">
                  {formatCurrency(projectedPool)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted font-medium">
              <span>{calcTotalTickets.toLocaleString()} total tickets</span>
              <span>•</span>
              <span>{formatCurrency(calcPricePerTicket)} / ticket</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Total Tickets */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary flex items-center justify-between">
                <span>Total Tickets in Draw <span className="text-red-500">*</span></span>
                {hasSoldTickets && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Locked ({ticketsSold} sold)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={formData.totalTickets || ""}
                  onChange={(e) => handleChange("totalTickets", e.target.value)}
                  disabled={hasSoldTickets}
                  required
                  placeholder="e.g. 1000"
                  className="w-full h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-text-muted">
                The total quantity of tickets issued for this draw.
              </span>
            </div>

            {/* Price Per Ticket */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary flex items-center justify-between">
                <span>Price per Ticket (£) <span className="text-red-500">*</span></span>
                {hasSoldTickets && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Locked ({ticketsSold} sold)
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">
                  £
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.pricePerTicket || ""}
                  onChange={(e) => handleChange("pricePerTicket", e.target.value)}
                  disabled={hasSoldTickets}
                  required
                  placeholder="2.50"
                  className="w-full h-11 pl-8 pr-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-text-muted">
                Price in GBP per individual ticket entry.
              </span>
            </div>

            {/* Minimum Tickets Per Order */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary">
                Minimum Tickets Per Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.minTicketsPerUser ?? 1}
                onChange={(e) => handleChange("minTicketsPerUser", e.target.value)}
                className="h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
              <span className="text-[11px] text-text-muted">
                Minimum ticket purchase required per single checkout (default is 1).
              </span>
            </div>

            {/* Maximum Tickets Per Person */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary">
                Maximum Tickets Per User (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxTicketsPerUser || ""}
                onChange={(e) => handleChange("maxTicketsPerUser", e.target.value)}
                placeholder="e.g. 50 (leave empty for no cap)"
                className="h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
              <span className="text-[11px] text-text-muted">
                Maximum aggregate tickets any individual entrant may hold.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Schedule & Timeline */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm flex flex-col gap-5">
          <div className="border-b border-divider pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                4. Schedule & Timing
              </h2>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Configured strictly in official UK London Time (BST/GMT).
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-accent-bg border border-border text-text-brand px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Europe/London (BST/GMT)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary flex items-center justify-between">
                <span>Start Date & Time</span>
                <span className="text-[10px] text-text-brand font-semibold">UK Time</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate || ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
              <span className="text-[11px] text-text-muted">
                When tickets become publicly available to purchase.
              </span>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-xs text-text-primary flex items-center justify-between">
                <span>Draw Closing Date & Time</span>
                <span className="text-[10px] text-text-brand font-semibold">UK Time</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endDate || ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="h-11 px-3.5 bg-bg border border-border rounded-button text-xs sm:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
              <span className="text-[11px] text-text-muted">
                When ticket sales close and the official winner is drawn.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 5: Draw Execution Strategy */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm flex flex-col gap-5">
          <div className="border-b border-divider pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                5. Draw Execution Strategy
              </h2>
              <p className="font-sans text-xs text-text-muted mt-0.5">
                Choose how the winning ticket will be drawn upon competition completion.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-text-brand bg-accent-bg border border-border px-2.5 py-1 rounded-full">
              Draw Method
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Live Draw Card */}
            <label
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 relative ${
                !formData.isAutoDraw
                  ? "border-primary bg-accent-bg/30 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-bg hover:border-border-medium"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <span className="font-heading font-bold text-sm text-text-primary">
                    Live Stream Draw
                  </span>
                </div>
                <input
                  type="radio"
                  name="drawType"
                  checked={!formData.isAutoDraw}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isAutoDraw: false,
                      autoDrawDate: false,
                      autoDrawSoldOut: false,
                    }))
                  }
                  className="w-4 h-4 text-primary accent-primary"
                />
              </div>
              <p className="font-sans text-xs text-text-muted leading-relaxed">
                You will manually trigger the certified draw from your Host Dashboard (e.g. while streaming live on Instagram, YouTube, or Facebook).
              </p>
            </label>

            {/* Automated Draw Card */}
            <label
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 relative ${
                formData.isAutoDraw
                  ? "border-primary bg-accent-bg/30 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-bg hover:border-border-medium"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                    </svg>
                  </div>
                  <span className="font-heading font-bold text-sm text-text-primary">
                    Automated System Draw
                  </span>
                </div>
                <input
                  type="radio"
                  name="drawType"
                  checked={Boolean(formData.isAutoDraw)}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isAutoDraw: true,
                      autoDrawDate: true,
                      autoDrawSoldOut: true,
                    }))
                  }
                  className="w-4 h-4 text-primary accent-primary"
                />
              </div>
              <p className="font-sans text-xs text-text-muted leading-relaxed">
                Charity Draws automated certified algorithm selects a verified random winner automatically when all tickets sell out or when the draw end time expires.
              </p>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 shadow-sm flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
          <button
            type="button"
            onClick={() => router.push("/dashboard/host/competitions")}
            className="w-full sm:w-auto px-6 h-11 rounded-button border border-border hover:bg-accent-bg text-text-secondary font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center"
          >
            Cancel & Exit
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={updateMutation.isPending || isUploadingImage}
              className="w-full sm:w-auto px-8 h-11 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-bold text-xs sm:text-sm transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {updateMutation.isPending || isUploadingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <span>Save Changes</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
