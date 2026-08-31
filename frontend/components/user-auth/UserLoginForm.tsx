"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserLoginFormValues, UserAuthFormState } from "../../types/user-auth.types";
import { validateLoginForm } from "../../lib/validations/user-auth.validation";
import PrimaryButton from "../website/shared/PrimaryButton";
import AuthSuccessState from "../host-auth/AuthSuccessState";
import { cn, extractApiError } from "../../lib/utils";
import { useLoginMutation, useAuthUser } from "../../hooks/useAuthHooks";

export default function UserLoginForm() {
  const router = useRouter();
  const { data: user } = useAuthUser();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Controlled form values state
  const [formData, setFormData] = useState<UserLoginFormValues>({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Overall form state
  const [formState, setFormState] = useState<UserAuthFormState<UserLoginFormValues>>({
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
      toast.success("Welcome back! Redirecting to dashboard...");
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
        description="Your Player session has been successfully simulated. Directing you to the draws homepage..."
        buttonText="Explore Competitions"
        buttonHref="/"
      />
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">
      {/* Main Login Card wrapper */}
      <div className="bg-surface border border-divider p-6 md:p-10 rounded-card shadow-card w-full">
        {/* Header section */}
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="font-heading font-normal text-3xl md:text-[36px] text-text-primary">
            Log In
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm">
            <span className="text-text-secondary/70">New user?</span>
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-hover transition-colors duration-200"
            >
              Register now →
            </Link>
          </div>
        </div>

        {/* Semantic Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input field */}
          <div className="flex flex-col w-full gap-1.5">
            <label
              htmlFor="email"
              className="font-sans font-medium text-xs md:text-sm text-text-primary"
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
                "w-full bg-bg border border-border rounded-button px-4 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none",
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
          <div className="flex flex-col w-full gap-1.5">
            <label
              htmlFor="password"
              className="font-sans font-medium text-xs md:text-sm text-text-primary"
            >
              Password
            </label>
            <div className="relative w-full">
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
                  "w-full bg-bg border border-border rounded-button pl-4 pr-12 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none",
                  errors.password
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    : "focus:border-primary focus:ring-1 focus:ring-primary/20",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-brand p-1 cursor-pointer select-none transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Eye Slash Icon */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
          <div className="flex items-center justify-between mt-1 text-xs md:text-sm">
            <label className="flex items-center gap-2 text-text-secondary select-none cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-4.5 h-4.5 rounded border border-border bg-bg text-primary focus:ring-0 focus:ring-offset-0 focus:outline-none accent-primary transition-all duration-200 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="font-sans font-semibold text-text-brand hover:text-primary-hover transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Logging In..."
            disabled={!isMounted}
            className="w-full py-3.5 mt-2 font-heading font-semibold text-sm tracking-wide uppercase"
          >
            Log In →
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
