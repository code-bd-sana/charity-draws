"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { useUserDashboardQuery } from "../../../../hooks/useUserHooks";
import { userService } from "../../../../services/user.service";
import { userKeys } from "../../../../hooks/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function UserProfileForm() {
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: dashboardData } = useUserDashboardQuery();
  const queryClient = useQueryClient();

  // Active Tab: 'personal' | 'shipping' | 'security'
  const [activeTab, setActiveTab] = useState<"personal" | "shipping" | "security">("personal");

  // Personal Information
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
  });

  // Shipping & Delivery Address
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    postcode: "",
    notes: "",
  });

  // Password & Security
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Drag & Drop Avatar State
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submitting States
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const rawAddress = user.address || user.location || user.hostProfile?.address || "";
      const parts = rawAddress.split(",").map((s: string) => s.trim());

      if (parts.length >= 3) {
        setAddressData({
          street: parts[0] || "",
          city: parts[1] || user.location || "",
          postcode: parts[2] || "",
          notes: parts.slice(3).join(", ").replace(/^\(Notes:\s*|\)$/g, "") || "",
        });
      } else {
        setAddressData({
          street: rawAddress,
          city: user.location || "",
          postcode: "",
          notes: "",
        });
      }

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || user.hostProfile?.phone || "",
        location: user.location || "",
      });
    }
  }, [user]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.updateProfile(data);
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      queryClient.setQueryData(userKeys.all, data.user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    },
    onSettled: () => {
      setIsSubmittingProfile(false);
      setIsSubmittingAddress(false);
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.changePassword(data);
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password.");
    },
    onSettled: () => {
      setIsSubmittingPassword(false);
    },
  });

  // Upload Avatar Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return userService.uploadAvatar(file);
    },
    onSuccess: (data) => {
      toast.success("Avatar updated successfully!");
      queryClient.setQueryData(userKeys.all, data.user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to upload avatar.");
    },
  });

  // Avatar Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAvatarMutation.mutate(e.target.files[0]);
    }
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadAvatarMutation.mutate(file);
    } else {
      toast.error("Please drop a valid image file");
    }
  };

  // Form Change Handlers
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Profile Save
  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

    const formattedAddress = [
      addressData.street,
      addressData.city,
      addressData.postcode,
      addressData.notes ? `(Notes: ${addressData.notes})` : null,
    ]
      .filter(Boolean)
      .join(", ");

    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      location: formData.location || addressData.city,
      address: formattedAddress,
    });
  };

  // Address Save
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAddress(true);

    const formattedAddress = [
      addressData.street,
      addressData.city,
      addressData.postcode,
      addressData.notes ? `(Notes: ${addressData.notes})` : null,
    ]
      .filter(Boolean)
      .join(", ");

    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      location: addressData.city || formData.location,
      address: formattedAddress,
    });
  };

  // Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setIsSubmittingPassword(true);
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  // Password Strength Calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { score: 0, label: "", color: "bg-border" };
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Profile Completion Calculation
  const calculateProfileCompletion = () => {
    let score = 0;
    if (user?.avatarUrl) score += 25;
    if (formData.firstName && formData.lastName) score += 25;
    if (formData.phone) score += 25;
    if (addressData.street && addressData.postcode) score += 25;
    return score;
  };

  const completionPercent = calculateProfileCompletion();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-muted font-sans text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  const initials =
    user?.firstName?.substring(0, 2).toUpperCase() ||
    user?.email?.substring(0, 2).toUpperCase() ||
    "US";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  const kpis = dashboardData?.kpi || {
    totalTickets: 0,
    activeEntriesCount: 0,
    totalWins: 0,
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-fadeIn select-none">
      
      {/* 1. Profile Hero & Cover Banner */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card relative">
        {/* Cover Top Accent */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        </div>

        {/* Hero Content */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-14">
          {/* Avatar & Core Bio */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Draggable & Clickable Avatar Container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsAvatarDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsAvatarDragOver(false);
              }}
              onDrop={handleAvatarDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-28 h-28 rounded-full border-4 border-surface shadow-md bg-accent-bg flex items-center justify-center overflow-hidden cursor-pointer group transition-all shrink-0 ${
                isAvatarDragOver ? "ring-4 ring-primary scale-105" : "hover:ring-2 hover:ring-primary/50"
              }`}
              title="Click or drag & drop to change avatar photo"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {user?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-3xl text-text-brand">{initials}</span>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0M18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                <span className="text-[10px] font-sans font-semibold">
                  {uploadAvatarMutation.isPending ? "Uploading..." : "Change"}
                </span>
              </div>
            </div>

            {/* User Meta Information */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Community Member"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-badge bg-primary/10 text-primary border border-primary/20 font-sans font-bold text-[11px] uppercase tracking-wider">
                  {user?.role === "ADMIN" ? "Admin" : user?.role === "HOST" ? "Host" : "VIP Member"}
                </span>
                {user?.isEmailVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans font-semibold text-[11px]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <p className="font-sans text-[13px] text-text-muted mt-1">
                {user?.email} • Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-center md:justify-end shrink-0 pt-2 md:pt-0">
            <Link
              href="/dashboard/user/tickets"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-button bg-accent-bg hover:bg-accent-bg/80 border border-border text-text-primary font-sans font-semibold text-[13px] transition-colors"
            >
              <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
              My Tickets
            </Link>
            <Link
              href="/dashboard/user/winners"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[13px] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a2.99 2.99 0 0 0-2.12-.879H10.5a2.99 2.99 0 0 0-2.12.879h-.88c-.621 0-1.125.504-1.125 1.125V18.75m9 0H7.5" />
              </svg>
              My Wins
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Stats & Completion) + Right Column (Tabs & Forms) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          
          {/* Profile Completion Card */}
          <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-text-primary">
                Profile Completeness
              </span>
              <span className={`font-sans font-bold text-xs ${
                completionPercent === 100 ? "text-emerald-600" : "text-primary"
              }`}>
                {completionPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-accent-bg h-2.5 rounded-full overflow-hidden border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercent === 100
                    ? "bg-emerald-500"
                    : completionPercent >= 50
                    ? "bg-primary"
                    : "bg-amber-500"
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border text-xs font-sans">
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${user?.avatarUrl ? "bg-emerald-500" : "bg-gray-300"}`} />
                  Profile Photo
                </span>
                <span className={user?.avatarUrl ? "text-emerald-600 font-semibold" : "text-text-muted"}>
                  {user?.avatarUrl ? "Done" : "+25%"}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${formData.firstName && formData.lastName ? "bg-emerald-500" : "bg-gray-300"}`} />
                  Full Name
                </span>
                <span className={formData.firstName && formData.lastName ? "text-emerald-600 font-semibold" : "text-text-muted"}>
                  {formData.firstName && formData.lastName ? "Done" : "+25%"}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${formData.phone ? "bg-emerald-500" : "bg-gray-300"}`} />
                  Contact Phone
                </span>
                <span className={formData.phone ? "text-emerald-600 font-semibold" : "text-text-muted"}>
                  {formData.phone ? "Done" : "+25%"}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${addressData.street && addressData.postcode ? "bg-emerald-500" : "bg-gray-300"}`} />
                  Shipping Address
                </span>
                <span className={addressData.street && addressData.postcode ? "text-emerald-600 font-semibold" : "text-text-muted"}>
                  {addressData.street && addressData.postcode ? "Done" : "+25%"}
                </span>
              </div>
            </div>

            {completionPercent < 100 && (
              <p className="text-[11px] text-text-muted bg-accent-bg/60 p-2.5 rounded-button border border-border/80">
                💡 <strong>Tip:</strong> Keep your shipping address and phone up to date for instant dispatch of physical prizes when you win!
              </p>
            )}
          </div>

          {/* Activity KPI Cards */}
          <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-text-primary">
              Your Platform Activity
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-bg rounded-button border border-border flex flex-col items-center text-center">
                <span className="font-heading font-bold text-lg text-text-primary">
                  {kpis.totalTickets || 0}
                </span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">Tickets</span>
              </div>
              <div className="p-3 bg-bg rounded-button border border-border flex flex-col items-center text-center">
                <span className="font-heading font-bold text-lg text-primary">
                  {kpis.activeEntriesCount || 0}
                </span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">Active</span>
              </div>
              <div className="p-3 bg-bg rounded-button border border-border flex flex-col items-center text-center">
                <span className="font-heading font-bold text-lg text-emerald-600">
                  {kpis.totalWins || 0}
                </span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">Wins</span>
              </div>
            </div>
          </div>

          {/* Account Security Quick Status */}
          <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm text-text-primary">
              Security & Protection
            </h3>
            <div className="flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-button">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-sans font-bold text-emerald-900">
                  Account Protected
                </span>
                <span className="text-[11px] font-sans text-emerald-700">
                  Standard session encryption active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Column (8 Columns): Tabbed Forms */}
        <div className="lg:col-span-8 flex flex-col gap-5 w-full min-w-0">
          
          {/* Tabs Bar */}
          <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-card shadow-card overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-button font-sans font-semibold text-xs md:text-[13px] transition-all cursor-pointer shrink-0 ${
                activeTab === "personal"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-accent-bg"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7 0 3.75 3.75 0 0 1 7 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Personal Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-button font-sans font-semibold text-xs md:text-[13px] transition-all cursor-pointer shrink-0 ${
                activeTab === "shipping"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-accent-bg"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5A1.5 1.5 0 0 0 12.75 3H3.75A1.5 1.5 0 0 0 2.25 4.5v9.75" />
              </svg>
              Shipping & Delivery
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-button font-sans font-semibold text-xs md:text-[13px] transition-all cursor-pointer shrink-0 ${
                activeTab === "security"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-accent-bg"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Password & Security
            </button>
          </div>

          {/* TAB 1: Personal Details */}
          {activeTab === "personal" && (
            <form
              onSubmit={handlePersonalSubmit}
              className="bg-surface border border-border rounded-card p-6 md:p-8 shadow-card flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1 pb-4 border-b border-border">
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  Personal Information
                </h2>
                <p className="font-sans text-xs text-text-muted">
                  Update your contact details and display name across the platform.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handlePersonalChange}
                    required
                    placeholder="e.g. John"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm transition-colors"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handlePersonalChange}
                    required
                    placeholder="e.g. Doe"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm transition-colors"
                  />
                </div>

                {/* Email (Read-Only) */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      Email Address
                    </label>
                    <span className="text-[11px] text-text-muted font-sans font-medium">
                      Primary login identifier
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full h-11 px-3.5 bg-accent-bg/40 border border-border rounded-button text-text-muted font-sans text-sm cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-emerald-600 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Contact Phone Number
                  </label>
                  <div className="flex gap-2">
                    <span className="h-11 px-3 bg-accent-bg/50 border border-border rounded-button flex items-center text-xs font-sans font-semibold text-text-primary shrink-0">
                      🇬🇧 +44
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePersonalChange}
                      placeholder="7700 900123"
                      className="w-full h-11 px-3.5 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-text-muted font-sans mt-0.5">
                    Couriers will use this number for delivery tracking and SMS delivery updates.
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-button font-sans font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {isSubmittingProfile && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSubmittingProfile ? "Saving Details..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Shipping & Delivery Address */}
          {activeTab === "shipping" && (
            <form
              onSubmit={handleAddressSubmit}
              className="bg-surface border border-border rounded-card p-6 md:p-8 shadow-card flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1 pb-4 border-b border-border">
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  Shipping & Physical Delivery Address
                </h2>
                <p className="font-sans text-xs text-text-muted">
                  Physical prizes won in competitions and instant win draws are automatically dispatched to this address.
                </p>
              </div>

              {/* Info Callout */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-button flex items-start gap-3">
                <div className="p-1 rounded bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-sans font-bold text-blue-900">
                    Guaranteed Safe Delivery
                  </span>
                  <span className="text-[11px] font-sans text-blue-700 mt-0.5">
                    Our platform verifies host dispatches with tracked shipping (Royal Mail / DPD / Evri). Please ensure your postal code and door number are precise.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street Address */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Street Address & House Number *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={addressData.street}
                    onChange={handleAddressChange}
                    required
                    placeholder="e.g. 10 Downing Street, Flat 4B"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm transition-colors"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    required
                    placeholder="e.g. London"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm transition-colors"
                  />
                </div>

                {/* Postcode */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Postal Code / Postcode *
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={addressData.postcode}
                    onChange={handleAddressChange}
                    required
                    placeholder="e.g. SW1A 2AA"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-mono text-sm uppercase transition-colors"
                  />
                </div>

                {/* Delivery Notes */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={addressData.notes}
                    onChange={handleAddressChange}
                    rows={2}
                    placeholder="e.g. Leave with neighbor at No. 12 or in the safe porch box if not in."
                    className="w-full p-3 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Courier Label Preview Box */}
              {(addressData.street || addressData.postcode) && (
                <div className="p-4 bg-accent-bg/40 border border-dashed border-border rounded-button flex flex-col gap-1 font-mono text-xs text-text-primary">
                  <span className="text-[10px] font-sans uppercase font-bold text-text-muted tracking-wider mb-1">
                    Courier Label Preview:
                  </span>
                  <span className="font-bold">
                    {formData.firstName || user?.firstName} {formData.lastName || user?.lastName}
                  </span>
                  <span>{addressData.street || "---"}</span>
                  <span>
                    {addressData.city || "---"}, {addressData.postcode || "---"}
                  </span>
                  <span className="text-text-muted">United Kingdom</span>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingAddress}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-button font-sans font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {isSubmittingAddress && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSubmittingAddress ? "Saving Address..." : "Save Delivery Address"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === "security" && (
            <form
              onSubmit={handlePasswordSubmit}
              className="bg-surface border border-border rounded-card p-6 md:p-8 shadow-card flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1 pb-4 border-b border-border">
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  Password & Security Settings
                </h2>
                <p className="font-sans text-xs text-text-muted">
                  Keep your account secure by choosing a strong password.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Current Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 pr-11 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm tracking-wider transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 pr-11 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm tracking-wider transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
                    >
                      {showNewPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {passwordData.newPassword && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted font-sans font-medium">Strength:</span>
                        <span className="font-sans font-bold text-text-primary">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`rounded-full transition-colors ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-border"}`} />
                        <div className={`rounded-full transition-colors ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-border"}`} />
                        <div className={`rounded-full transition-colors ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-border"}`} />
                        <div className={`rounded-full transition-colors ${passwordStrength.score >= 4 ? passwordStrength.color : "bg-border"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 pr-11 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-sm tracking-wider transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="p-3.5 bg-bg border border-border rounded-button flex flex-col gap-2 text-xs font-sans">
                  <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider">
                    Password Requirements:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-muted">
                    <span className={`flex items-center gap-1.5 ${passwordData.newPassword.length >= 8 ? "text-emerald-600 font-semibold" : ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword.length >= 8 ? "bg-emerald-500" : "bg-gray-400"}`} />
                      At least 8 characters
                    </span>
                    <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(passwordData.newPassword) ? "text-emerald-600 font-semibold" : ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(passwordData.newPassword) ? "bg-emerald-500" : "bg-gray-400"}`} />
                      1 uppercase letter
                    </span>
                    <span className={`flex items-center gap-1.5 ${/[0-9]/.test(passwordData.newPassword) ? "text-emerald-600 font-semibold" : ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(passwordData.newPassword) ? "bg-emerald-500" : "bg-gray-400"}`} />
                      1 number or special character
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword ? "text-emerald-600 font-semibold" : ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword ? "bg-emerald-500" : "bg-gray-400"}`} />
                      Passwords match
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-button font-sans font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {isSubmittingPassword && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isSubmittingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
