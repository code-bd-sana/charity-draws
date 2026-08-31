"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HostLoginFormValues, HostAuthFormState } from "../../types/host-auth.types";
import { validateLoginForm } from "../../lib/validations/host-auth.validation";
import PrimaryButton from "../website/shared/PrimaryButton";
import AuthSuccessState from "./AuthSuccessState";
import { cn, extractApiError } from "../../lib/utils";
import { useLoginMutation } from "../../hooks/useAuthHooks";

export default function HostLoginForm() {
  const router = useRouter();
  
  // Controlled form values state
  const [formData, setFormData] = useState<HostLoginFormValues>({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Overall form visual state
  const [formState, setFormState] = useState<HostAuthFormState<HostLoginFormValues>>({
    values: formData,
    isSubmitting: false,
    submitStatus: "idle",
  });

  // Client-side validation errors state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loginMutation = useLoginMutation();
  const isSubmitting = formState.isSubmitting || loginMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Perform validation checks
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
      toast.success("Host login successful! Redirecting...");
    } catch (error: any) {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
      if (error.response?.data?.message === 'Please verify your email address before logging in') {
        toast.error("Please verify your email address before logging in. Redirecting...");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      } else {
        toast.error(extractApiError(error, "Login failed. Please check your credentials."));
      }
    }
  };

  if (formState.submitStatus === "success") {
    return (
      <AuthSuccessState
        title="Welcome Back!"
        description="Your Host session has been successfully simulated. Directing you to the dashboard..."
        buttonText="Go to Dashboard"
        buttonHref="/host/dashboard"
      />
    );
  }

  return (
    <div className="relative w-full max-w-[829px] mx-auto flex flex-col gap-[24px] animate-fadeIn">
      {/* Nav Tabs Selector */}
      <div className="flex items-center justify-center self-center md:self-start">
        <div className="bg-surface border border-accent-bg flex gap-[6px] items-center px-[7px] py-[6px] rounded-[99px]">
          <Link
            href="/login"
            className="bg-transparent border border-transparent rounded-[99px] flex flex-col items-center justify-center px-[15px] py-[6px] hover:bg-elevated transition-colors"
          >
            <span className="font-sans font-medium text-[12px] leading-[18px] text-text-secondary tracking-[0.48px] whitespace-nowrap">
              User Login
            </span>
          </Link>
          <div className="bg-accent-bg border border-border-medium rounded-[99px] flex flex-col items-center justify-center px-[15px] py-[6px]">
            <span className="font-sans font-medium text-[12px] leading-[18px] text-text-brand tracking-[0.48px] whitespace-nowrap">
              Host Login
            </span>
          </div>
        </div>
      </div>

      {/* Main Login Card wrapper */}
      <div className="bg-surface border border-accent-bg p-6 md:p-[41px] rounded-[16px] w-full">
        {/* Header section */}
        <div className="flex flex-col gap-2 mb-[35px]">
          <h2 className="font-heading font-normal text-[36px] text-text-primary leading-tight">
            Host Log In
          </h2>
          <div className="flex items-center gap-1.5 pt-[8px]">
            <span className="font-sans font-normal text-[14px] leading-[19.5px] text-text-secondary">
              New to Charity Draws?
            </span>
            <Link
              href="/host/register"
              className="font-sans font-medium text-[14px] leading-[19.5px] text-primary hover:text-primary-hover transition-colors"
            >
              Apply to become a host →
            </Link>
          </div>
        </div>

        {/* Semantic Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          {/* Email input field */}
          <div className="flex flex-col w-full gap-[6px]">
            <label
              htmlFor="email"
              className="font-sans font-medium text-[14px] text-text-primary leading-normal"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                "w-full h-[46px] bg-bg border border-border rounded-[8px] px-[13px] font-sans font-normal text-[14px] text-text-primary placeholder:text-text-primary/50 transition-all duration-200 outline-none",
                errors.email
                  ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                  : "focus:border-primary focus:ring-1 focus:ring-primary/20",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            />
            {errors.email && (
              <span className="font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password input field */}
          <div className="flex flex-col w-full gap-[6px]">
            <label
              htmlFor="password"
              className="font-sans font-medium text-[14px] text-text-primary leading-normal"
            >
              Password
            </label>
            <div className="relative w-full h-[46px]">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={cn(
                  "w-full h-full bg-bg border border-border rounded-[8px] pl-[13px] pr-[43px] font-sans font-normal text-[14px] text-text-primary placeholder:text-text-primary/50 transition-all duration-200 outline-none",
                  errors.password
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    : "focus:border-primary focus:ring-1 focus:ring-primary/20",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[13px] top-1/2 -translate-y-1/2 text-text-primary/50 hover:text-text-brand p-1 cursor-pointer select-none transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn">
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between mt-[4px] h-[24px]">
            <label className="flex items-center gap-[10px] cursor-pointer group">
              <div className="flex items-start pt-[1px]">
                <div className="relative w-[18px] h-[18px]">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="appearance-none absolute inset-0 w-[18px] h-[18px] rounded-[4px] border border-border bg-transparent checked:bg-primary checked:border-primary focus:ring-0 cursor-pointer transition-colors"
                  />
                  {formData.rememberMe && (
                    <svg className="absolute inset-0 w-[18px] h-[18px] text-bg p-[3px] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-sans font-medium text-[13px] leading-[19.5px] text-text-secondary group-hover:text-text-primary transition-colors select-none">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="font-sans font-semibold text-[16px] leading-[24px] text-primary hover:text-primary-hover transition-colors cursor-pointer select-none"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Logging In..."
            className="w-full mt-[12px] h-[48px] uppercase tracking-wider"
          >
            Log In →
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
