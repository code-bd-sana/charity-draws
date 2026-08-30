"use client";

import React, { useState } from "react";
import { useChangePasswordMutation } from "../../../../hooks/useUserHooks";
import { extractApiError } from "../../../../lib/utils";

export default function SecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ form?: string; newPassword?: string; currentPassword?: string }>({});
  const [successMsg, setSuccessMsg] = useState("");
  
  const mutation = useChangePasswordMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
    }
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    if (!formData.currentPassword) {
      setErrors({ currentPassword: "Current password is required" });
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrors({ newPassword: "New password must be at least 8 characters long" });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ newPassword: "Passwords do not match" });
      return;
    }

    try {
      await mutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccessMsg("Password updated successfully.");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setErrors({ form: extractApiError(err, "Failed to change password.") });
    }
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 md:p-8 flex flex-col gap-6 shadow-card select-none animate-fadeIn">
      <div>
        <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary">Security</h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium mt-1">Keep your account secure with a strong password.</p>
      </div>

      <div className="h-px w-full bg-divider" />

      {/* Password Change Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h3 className="font-heading font-bold text-base text-text-primary">Change Password</h3>
        
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
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">Current Password</label>
            <input 
              type="password" 
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="••••••••" 
              disabled={mutation.isPending}
              className="w-full h-11 bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
            {errors.currentPassword && <span className="text-red-600 text-xs font-medium">{errors.currentPassword}</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••" 
                disabled={mutation.isPending}
                className="w-full h-11 bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••" 
                disabled={mutation.isPending}
                className="w-full h-11 bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          {errors.newPassword && <span className="text-red-600 text-xs font-medium">{errors.newPassword}</span>}
        </div>
        
        <div className="flex justify-start mt-2">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="h-10 px-5 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-heading font-bold text-xs md:text-sm shadow-glow transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
