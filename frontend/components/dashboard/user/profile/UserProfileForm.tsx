"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "../../../../hooks/useAuthHooks";
import { userService } from "../../../../services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function UserProfileForm() {
  const { data: user, isLoading } = useAuthUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || user.hostProfile?.phone || "",
        address: user.address || user.location || user.hostProfile?.address || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.updateProfile(data);
    },
    onSuccess: (data) => {
      setProfileMessage("Profile saved successfully!");
      queryClient.setQueryData(["user"], data.user);
      setTimeout(() => setProfileMessage(""), 3000);
    },
    onError: () => {
      setProfileMessage("Failed to save profile.");
    },
    onSettled: () => {
      setIsSubmittingProfile(false);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return userService.changePassword(data);
    },
    onSuccess: () => {
      setPasswordMessage("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMessage(""), 3000);
    },
    onError: (error: any) => {
      setPasswordMessage(error.response?.data?.message || "Failed to change password.");
    },
    onSettled: () => {
      setIsSubmittingPassword(false);
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return userService.uploadAvatar(file);
    },
    onSuccess: (data) => {
      setProfileMessage("Avatar updated successfully!");
      queryClient.setQueryData(["user"], data.user);
      setTimeout(() => setProfileMessage(""), 3000);
    },
    onError: () => {
      setProfileMessage("Failed to update avatar.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAvatarMutation.mutate(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    
    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters long.");
      return;
    }
    setIsSubmittingPassword(true);
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return <div className="text-text-muted font-sans font-medium animate-pulse">Loading profile...</div>;
  }

  const initials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <div className="flex flex-col xl:flex-row gap-5 p-8 max-w-[1660px] mx-auto w-full animate-fadeIn items-start select-none">
      {/* Left Column: Profile Summary */}
      <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-card p-8 flex flex-col items-center shadow-card">
          {/* Avatar Area */}
          <div className="relative mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="w-[140px] h-[140px] rounded-full border-2 border-primary bg-accent-bg flex items-center justify-center overflow-hidden shadow-sm">
              {user?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-[48px] text-text-brand">{initials}</span>
              )}
            </div>
            <button 
              type="button"
              onClick={handleUploadClick}
              disabled={uploadAvatarMutation.isPending}
              className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white hover:bg-primary-hover transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0M18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>
          </div>
          <p 
            onClick={handleUploadClick}
            className="font-sans text-[12px] font-semibold text-text-brand mb-8 cursor-pointer hover:underline transition-colors"
          >
            {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Photo"}
          </p>

          {/* Verification Banner */}
          {user?.isEmailVerified && (
            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-button py-2.5 px-4 mb-6 flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="font-sans font-semibold text-[12px] text-emerald-700">Email Verified</span>
            </div>
          )}

          {/* Stats List */}
          <div className="w-full flex flex-col gap-4 pt-2 border-t border-divider">
            <div className="flex justify-between items-center w-full">
              <span className="font-sans text-[12px] text-text-muted font-medium">Member since</span>
              <span className="font-sans text-[13px] font-bold text-text-primary">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="font-sans text-[12px] text-text-muted font-medium">Role</span>
              <div className="px-2.5 py-0.5 rounded-badge bg-accent-bg border border-border-medium shadow-sm">
                <span className="font-sans font-bold text-[10px] text-text-brand tracking-wider uppercase">
                  {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'HOST' ? 'Host' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Settings Forms */}
      <div className="flex-1 flex flex-col gap-5">
        <form onSubmit={handleProfileSubmit} className="bg-surface border border-border rounded-card p-8 flex flex-col gap-8 shadow-card">
          
          {/* Account Information */}
          <section>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-divider">
              <h3 className="font-heading font-bold text-[16px] text-text-primary">Account Information</h3>
              {profileMessage && (
                <span className={`text-[13px] font-semibold ${profileMessage.includes('Failed') ? 'text-red-600' : 'text-emerald-700'}`}>
                  {profileMessage}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">First Name</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center focus-within:border-primary transition-colors">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans font-medium" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">Last Name</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center focus-within:border-primary transition-colors">
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans font-medium" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center opacity-70 cursor-not-allowed">
                  <input type="email" name="email" value={formData.email} disabled className="bg-transparent outline-none w-full text-[13px] text-text-muted font-sans font-medium cursor-not-allowed" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">Phone Number</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center focus-within:border-primary transition-colors">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+44 7700 900123" className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans font-medium" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">Shipping Address</label>
                <div className="bg-bg border border-border rounded-button p-3 flex focus-within:border-primary transition-colors">
                  <textarea name="address" value={formData.address} onChange={handleChange} className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans font-medium resize-none h-[60px]" placeholder="123 Street, City, Postcode" />
                </div>
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="mt-2 flex justify-end w-full">
            <button 
              type="submit" 
              disabled={isSubmittingProfile}
              className="bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[13px] px-6 py-2.5 rounded-button transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmittingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-surface border border-border rounded-card p-8 flex flex-col gap-8 shadow-card">
          {/* Change Password */}
          <section>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-divider">
              <h3 className="font-heading font-bold text-[16px] text-text-primary">Change Password</h3>
              {passwordMessage && (
                <span className={`text-[13px] font-semibold ${passwordMessage.includes('Failed') || passwordMessage.includes('not match') || passwordMessage.includes('least') ? 'text-red-600' : 'text-emerald-700'}`}>
                  {passwordMessage}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">Current Password</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center justify-between focus-within:border-primary transition-colors">
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans tracking-widest" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">New Password</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center justify-between focus-within:border-primary transition-colors">
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans placeholder:tracking-widest" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">Confirm Password</label>
                <div className="bg-bg border border-border h-[40px] rounded-button px-3 flex items-center justify-between focus-within:border-primary transition-colors">
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="bg-transparent outline-none w-full text-[13px] text-text-primary font-sans placeholder:tracking-widest" required />
                </div>
              </div>
            </div>
          </section>
          
          <div className="mt-2 flex justify-end w-full">
            <button 
              type="submit" 
              disabled={isSubmittingPassword}
              className="bg-accent-bg border border-border-medium text-text-brand hover:bg-primary hover:text-white font-sans font-semibold text-[13px] px-6 py-2.5 rounded-button transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmittingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
