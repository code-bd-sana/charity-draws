"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "../../../../hooks/useUserHooks";
import { extractApiError } from "../../../../lib/utils";

export default function ProfileSettings() {
  const { data: user, isLoading } = useAuthUser();
  const updateMutation = useUpdateProfileMutation();
  const avatarMutation = useUploadAvatarMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
  });

  const [errors, setErrors] = useState<{ form?: string }>({});
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors({});
    setSuccessMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    try {
      await updateMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        location: formData.location,
      });
      setSuccessMsg("Profile details updated successfully.");
    } catch (err: any) {
      setErrors({ form: extractApiError(err, "Failed to update profile.") });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors({});
    setSuccessMsg("");

    try {
      await avatarMutation.mutateAsync(file);
      setSuccessMsg("Profile picture updated successfully.");
    } catch (err: any) {
      setErrors({ form: extractApiError(err, "Failed to upload image.") });
    }
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return <div className="p-8 text-text-muted font-sans text-xs md:text-sm font-medium animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="bg-surface border border-border rounded-card p-6 md:p-8 flex flex-col gap-6 shadow-card select-none animate-fadeIn">
      <div>
        <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary">Profile Details</h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium mt-1">Manage your public profile and contact information.</p>
      </div>

      <div className="h-px w-full bg-divider" />

      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-medium p-3.5 rounded-card">
          ⚠️ {errors.form}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-sans font-medium p-3.5 rounded-card">
          ✅ {successMsg}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative w-20 h-20 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
          {user?.avatarUrl ? (
            <Image 
              src={user.avatarUrl} 
              alt="Avatar" 
              fill 
              className="object-cover"
              unoptimized={true} 
            />
          ) : (
            <span className="font-heading font-bold text-2xl text-primary">
              {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </span>
          )}
          {avatarMutation.isPending && (
            <div className="absolute inset-0 bg-text-primary/50 flex items-center justify-center">
              <span className="text-primary-text text-[10px] font-bold">Uploading</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileSelect}
            />
            <button 
              type="button"
              disabled={avatarMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-heading font-bold text-xs shadow-glow transition-all disabled:opacity-50 cursor-pointer"
            >
              Upload New Avatar
            </button>
          </div>
          <p className="font-sans text-xs text-text-muted font-medium">Recommended: Square JPG, PNG. Max 5MB.</p>
        </div>
      </div>

      <div className="h-px w-full bg-divider" />
      
      {/* Form Fields */}
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">First Name</label>
            <input 
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={updateMutation.isPending}
              className="w-full h-11 bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={updateMutation.isPending}
              className="w-full h-11 bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            value={user?.email || ""} 
            disabled 
            className="w-full h-11 bg-accent-bg/30 border border-border-medium/50 rounded-button px-4 font-sans text-xs md:text-sm text-text-muted cursor-not-allowed outline-none"
          />
          <span className="text-xs text-text-muted font-medium">Email address cannot be changed directly.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">Location</label>
          <input 
            type="text" 
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g. London, UK"
            disabled={updateMutation.isPending}
            className="w-full h-11 bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex justify-end pt-3 border-t border-divider mt-2">
          <button 
            type="submit"
            disabled={updateMutation.isPending}
            className="h-11 px-6 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-heading font-bold text-xs md:text-sm shadow-glow transition-all disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
