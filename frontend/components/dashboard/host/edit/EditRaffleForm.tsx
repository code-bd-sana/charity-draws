"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetRaffleById, useUpdateRaffle } from "../../../../hooks/useRaffleHooks";
import { usePublicCategories } from "../../../../hooks/useCategoryHooks";
import { cn } from "../../../../lib/utils";
import { formatDateForUKInput, parseUKInputToISO } from "../../../../lib/uk-date";
import { toast } from "sonner";

interface Props {
  raffleId: string;
}

export default function EditRaffleForm({ raffleId }: Props) {
  const router = useRouter();
  const { data: raffle, isLoading } = useGetRaffleById(raffleId);
  const { data: categories = [], isLoading: isCategoriesLoading } = usePublicCategories();
  const updateMutation = useUpdateRaffle();

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (raffle) {
      setFormData({
        title: raffle.title,
        category: (raffle as any).category,
        description: raffle.description,
        prizeName: raffle.prizeName,
        totalTickets: raffle.totalTickets,
        pricePerTicket: raffle.pricePerTicket,
        startDate: formatDateForUKInput(raffle.startDate),
        endDate: formatDateForUKInput(raffle.endDate),
        isAutoDraw: raffle.isAutoDraw,
        autoDrawDate: raffle.autoDrawDate,
        autoDrawSoldOut: raffle.autoDrawSoldOut,
        minTicketsPerUser: (raffle as any).minTicketsPerUser ?? 1,
        maxTicketsPerUser: (raffle as any).maxTicketsPerUser ?? "",
      });
    }
  }, [raffle]);

  const hasSoldTickets = (raffle?.ticketsSold ?? 0) > 0;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
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
      if (payload.totalTickets) payload.totalTickets = Number(payload.totalTickets);
      if (payload.pricePerTicket) payload.pricePerTicket = Number(payload.pricePerTicket);
      payload.minTicketsPerUser = numMin;
      payload.maxTicketsPerUser = numMax;

      await updateMutation.mutateAsync({ id: raffleId, data: payload });
      toast.success("Competition updated successfully!");
      router.push("/dashboard/host/competitions");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update competition.");
    }
  };

  if (isLoading) {
    return <div className="text-[#a0d056]">Loading competition data...</div>;
  }

  if (!raffle) {
    return <div className="text-red-500">Competition not found.</div>;
  }

  return (
    <div className="w-full bg-[#161810] border border-[#2d3c13] rounded-[16px] overflow-hidden flex flex-col p-[24px]">
      <h2 className="font-heading font-medium text-[24px] text-[#e8edd4] mb-[8px]">
        Edit Competition
      </h2>
      <p className="font-sans text-[14px] text-[#b3b8aa] mb-[24px]">
        Make changes to your competition. Note that some fields cannot be edited once tickets have been sold.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
        {/* Basic Info */}
        <div className="flex flex-col gap-[8px]">
          <label className="font-sans font-medium text-[13px] text-[#e8edd4]">Title</label>
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a]"
          />
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="font-sans font-medium text-[13px] text-[#e8edd4]">Prize Name</label>
          <input
            type="text"
            value={formData.prizeName || ""}
            onChange={(e) => handleChange("prizeName", e.target.value)}
            className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a]"
          />
        </div>

        {/* Category Field */}
        <div className="flex flex-col gap-[8px]">
          <label className="font-sans font-medium text-[13px] text-[#e8edd4] flex items-center justify-between">
            <span>Category</span>
            {isCategoriesLoading && (
              <span className="text-[11px] text-[#8cb34a] animate-pulse font-normal">Loading categories...</span>
            )}
          </label>
          <div className="relative">
            <select
              value={formData.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
              disabled={isCategoriesLoading}
              className="w-full h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a] appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <svg
              className="w-5 h-5 text-[#b3b8aa] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <label className="font-sans font-medium text-[13px] text-[#e8edd4]">Description</label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="p-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a]"
          />
        </div>

        {/* Tickets & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[13px] text-[#e8edd4]">
              Total Tickets {hasSoldTickets && <span className="text-red-400 text-[11px]">(Locked)</span>}
            </label>
            <input
              type="number"
              value={formData.totalTickets || ""}
              onChange={(e) => handleChange("totalTickets", e.target.value)}
              disabled={hasSoldTickets}
              className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a] disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[13px] text-[#e8edd4]">
              Price per Ticket (£) {hasSoldTickets && <span className="text-red-400 text-[11px]">(Locked)</span>}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.pricePerTicket || ""}
              onChange={(e) => handleChange("pricePerTicket", e.target.value)}
              disabled={hasSoldTickets}
              className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Ticket Limits Per User */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[13px] text-[#e8edd4]">
              Minimum Tickets Per Order
            </label>
            <input
              type="number"
              min="1"
              value={formData.minTicketsPerUser ?? 1}
              onChange={(e) => handleChange("minTicketsPerUser", e.target.value)}
              className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a]"
            />
            <span className="font-sans text-[11px] text-[#72943A]">
              Minimum tickets required per entry transaction (default: 1).
            </span>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[13px] text-[#e8edd4]">
              Maximum Tickets Per Person (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxTicketsPerUser || ""}
              onChange={(e) => handleChange("maxTicketsPerUser", e.target.value)}
              placeholder="e.g. 50 (leave empty for unlimited)"
              className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a]"
            />
            <span className="font-sans text-[11px] text-[#72943A]">
              Maximum total tickets any single user can purchase.
            </span>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-badge bg-[#111210] border border-[#2d3c13] text-xs text-[#a0d056] font-medium">
          <svg className="w-4 h-4 text-[#8cb34a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>All times are configured and displayed in <strong>UK Time (Europe/London - BST/GMT)</strong>.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[13px] text-[#e8edd4] flex items-center justify-between">
              <span>Start Date & Time</span>
              <span className="text-[10px] text-[#8cb34a] font-bold bg-[#1a230a] px-2 py-0.5 rounded border border-[#2d3c13]">UK Time</span>
            </label>
            <input
              type="datetime-local"
              value={formData.startDate || ""}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a] [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[13px] text-[#e8edd4] flex items-center justify-between">
              <span>End/Draw Date & Time</span>
              <span className="text-[10px] text-[#8cb34a] font-bold bg-[#1a230a] px-2 py-0.5 rounded border border-[#2d3c13]">UK Time</span>
            </label>
            <input
              type="datetime-local"
              value={formData.endDate || ""}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="h-[48px] px-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px] text-[#e8edd4] outline-none focus:border-[#8cb34a] [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Draw Strategy */}
        <div className="flex flex-col gap-[16px] mt-[16px]">
          <div className="flex flex-col gap-[16px] p-[16px] bg-[#0d0d0b] border border-[#2d3c13] rounded-[8px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-[4px]">
                <span className="font-sans font-medium text-[14px] text-[#e8edd4]">Draw Type</span>
                <span className="font-sans font-normal text-[12px] text-[#5a752a]">How will the winner be selected?</span>
              </div>
            </div>

            <div className="flex flex-col gap-[12px] mt-[8px] pt-[16px] border-t border-[#2d3c13]">
              <label className="flex items-start gap-[12px] cursor-pointer">
                <input 
                  type="radio"
                  name="drawType"
                  checked={!formData.isAutoDraw}
                  onChange={() => setFormData((prev: any) => ({ ...prev, isAutoDraw: false, autoDrawDate: false, autoDrawSoldOut: false }))}
                  className="mt-1 w-[16px] h-[16px] rounded-full border-[#2d3c13] bg-[#161810] text-[#8cb34a] focus:ring-[#8cb34a]"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-medium text-[14px] text-[#e8edd4]">Live Draw</span>
                  <span className="font-sans font-normal text-[12px] text-[#b3b8aa]">You will manually run the draw from your dashboard (e.g., live on Instagram).</span>
                </div>
              </label>

              <label className="flex items-start gap-[12px] cursor-pointer">
                <input 
                  type="radio"
                  name="drawType"
                  checked={formData.isAutoDraw}
                  onChange={() => setFormData((prev: any) => ({ ...prev, isAutoDraw: true, autoDrawDate: true, autoDrawSoldOut: true }))}
                  className="mt-1 w-[16px] h-[16px] rounded-full border-[#2d3c13] bg-[#161810] text-[#8cb34a] focus:ring-[#8cb34a]"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-medium text-[14px] text-[#e8edd4]">Automatic Draw</span>
                  <span className="font-sans font-normal text-[12px] text-[#b3b8aa]">System automatically draws a winner when all tickets are sold out OR the end time expires.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-[16px] mt-[24px] pt-[24px] border-t border-[#2d3c13]">
          <button
            type="button"
            onClick={() => router.push("/dashboard/host/competitions")}
            className="px-[24px] h-[48px] rounded-[8px] border border-[#2d3c13] text-[#e8edd4] hover:bg-[#1a230a] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-[32px] h-[48px] rounded-[8px] bg-[#8cb34a] text-[#0d0d0b] font-medium hover:bg-[#72943a] transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
