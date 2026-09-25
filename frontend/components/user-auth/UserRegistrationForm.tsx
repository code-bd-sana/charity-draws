'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserRegistrationFormValues, UserAuthFormState } from '../../types/user-auth.types';
import {
  validateRegisterForm,
  getPasswordStrength,
} from '../../lib/validations/user-auth.validation';
import PrimaryButton from '../website/shared/PrimaryButton';
import { cn } from '../../lib/utils';
import { useRegisterMutation, useAuthUser } from '../../hooks/useAuthHooks';
import { extractApiError } from '../../lib/utils';

export default function UserRegistrationForm() {
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
  const [formData, setFormData] = useState<UserRegistrationFormValues>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    acceptedMarketing: false,
  });

  // Overall form state
  const [formState, setFormState] = useState<UserAuthFormState<UserRegistrationFormValues>>({
    values: formData,
    isSubmitting: false,
    submitStatus: 'idle',
  });

  // Client-side validation errors state
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const registerMutation = useRegisterMutation();
  const isSubmitting = formState.isSubmitting || registerMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Perform validation checks
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    // 2. Submit form
    try {
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        role: 'CLIENT',
      });

      toast.success('Registration successful! Check your email to verify.');
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 1500);
    } catch (error: any) {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));

      const responseData = error.response?.data;
      const validationErrors = responseData?.errors || responseData?.error;

      if (validationErrors && Array.isArray(validationErrors)) {
        const newErrors: any = {};
        validationErrors.forEach((err: any) => {
          newErrors[
            err.field === 'firstName' || err.field === 'lastName' ? 'fullName' : err.field
          ] = err.errors[0];
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
        toast.error('Please fix the validation errors.');
      } else {
        toast.error(extractApiError(error, 'Registration failed. Please try again.'));
      }
    }
  };

  // Calculate password strength rating
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className='relative w-full max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn'>
      {/* Nav Tabs Selector */}
      <div className='flex items-center justify-start self-start bg-surface border border-divider p-1 rounded-badge'>
        <div className='bg-accent-bg border border-border-medium px-4 py-2 rounded-badge'>
          <span className='font-sans text-[11px] md:text-xs font-semibold text-text-brand uppercase tracking-wider'>
            Client Register
          </span>
        </div>
        <button
          type='button'
          onClick={() => router.push('/host/register')}
          className='font-sans text-[11px] md:text-xs font-semibold text-text-muted hover:text-text-primary px-4 py-2 rounded-badge transition-colors duration-200 cursor-pointer select-none'
        >
          Host Register
        </button>
      </div>

      {/* Main Registration Card wrapper */}
      <div className='bg-surface border border-divider p-6 md:p-10 rounded-card shadow-card w-full'>
        {/* Header section */}
        <div className='flex flex-col gap-2 mb-8'>
          <h2 className='font-heading font-normal text-3xl md:text-[36px] text-text-primary'>
            Register
          </h2>
          <div className='flex flex-wrap items-center gap-1.5 text-xs md:text-sm'>
            <span className='text-text-secondary/70'>Already have an account?</span>
            <Link
              href='/login'
              className='font-medium text-primary hover:text-primary-hover transition-colors duration-200'
            >
              Log in →
            </Link>
          </div>
        </div>

        {/* Semantic Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          {/* Full Name input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='fullName'
              className='font-sans font-medium text-xs md:text-sm text-text-primary'
            >
              Full Name
            </label>
            <input
              type='text'
              id='fullName'
              name='fullName'
              autoComplete='name'
              placeholder='John Smith'
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                'w-full bg-bg border border-border rounded-button px-4 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none',
                errors.fullName
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : 'focus:border-primary focus:ring-1 focus:ring-primary/20',
                isSubmitting && 'opacity-50 cursor-not-allowed',
              )}
            />
            {errors.fullName && (
              <span className='font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn'>
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='email'
              className='font-sans font-medium text-xs md:text-sm text-text-primary'
            >
              Email Address
            </label>
            <input
              type='email'
              id='email'
              name='email'
              autoComplete='email'
              placeholder='you@example.com'
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                'w-full bg-bg border border-border rounded-button px-4 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none',
                errors.email
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : 'focus:border-primary focus:ring-1 focus:ring-primary/20',
                isSubmitting && 'opacity-50 cursor-not-allowed',
              )}
            />
            {errors.email && (
              <span className='font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn'>
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone input field (optional) */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='phone'
              className='font-sans font-medium text-xs md:text-sm text-text-primary'
            >
              Phone Number{' '}
              <span className='text-text-muted/40 text-[10px] md:text-xs font-normal'>
                (Optional)
              </span>
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              autoComplete='tel'
              placeholder='+44 7700 900000'
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={cn(
                'w-full bg-bg border border-border rounded-button px-4 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none',
                errors.phone
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                  : 'focus:border-primary focus:ring-1 focus:ring-primary/20',
                isSubmitting && 'opacity-50 cursor-not-allowed',
              )}
            />
            {errors.phone && (
              <span className='font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn'>
                {errors.phone}
              </span>
            )}
          </div>

          {/* Password input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='password'
              className='font-sans font-medium text-xs md:text-sm text-text-primary'
            >
              Password
            </label>
            <div className='relative w-full'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                autoComplete='new-password'
                placeholder='••••••••'
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={cn(
                  'w-full bg-bg border border-border rounded-button pl-4 pr-12 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none',
                  errors.password
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                    : 'focus:border-primary focus:ring-1 focus:ring-primary/20',
                  isSubmitting && 'opacity-50 cursor-not-allowed',
                )}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-brand p-1 cursor-pointer select-none transition-colors duration-200'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className='font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn'>
                {errors.password}
              </span>
            )}

            {/* Password Strength Meter */}
            <div className='flex gap-1.5 mt-1.5 h-[4px] w-full'>
              {[1, 2, 3, 4].map((barIndex) => (
                <div
                  key={barIndex}
                  className={cn(
                    'h-full flex-1 rounded-badge transition-all duration-300',
                    formData.password.length > 0 && barIndex <= passwordStrength
                      ? passwordStrength <= 1
                        ? 'bg-red-500'
                        : passwordStrength === 2
                          ? 'bg-orange-500'
                          : passwordStrength === 3
                            ? 'bg-yellow-500'
                            : 'bg-primary'
                      : 'bg-divider',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Confirm Password input field */}
          <div className='flex flex-col w-full gap-1.5'>
            <label
              htmlFor='confirmPassword'
              className='font-sans font-medium text-xs md:text-sm text-text-primary'
            >
              Confirm Password
            </label>
            <div className='relative w-full'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                name='confirmPassword'
                autoComplete='new-password'
                placeholder='••••••••'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={cn(
                  'w-full bg-bg border border-border rounded-button pl-4 pr-12 py-2.5 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 transition-all duration-200 outline-none',
                  errors.confirmPassword
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                    : 'focus:border-primary focus:ring-1 focus:ring-primary/20',
                  isSubmitting && 'opacity-50 cursor-not-allowed',
                )}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-brand p-1 cursor-pointer select-none transition-colors duration-200'
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className='font-sans text-[11px] text-red-500 mt-1 self-start animate-fadeIn'>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Guidelines / Terms check */}
          <div className='flex flex-col gap-3 mt-1'>
            <label className='flex items-start gap-2.5 text-xs md:text-sm text-text-secondary select-none cursor-pointer'>
              <input
                type='checkbox'
                name='acceptedTerms'
                checked={formData.acceptedTerms}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className='w-4.5 h-4.5 mt-0.5 rounded border border-border bg-bg text-primary focus:ring-0 focus:ring-offset-0 focus:outline-none accent-primary transition-all duration-200 cursor-pointer shrink-0'
              />
              <span className='leading-tight'>
                I confirm that I agree to the{' '}
                <Link href='/terms' className='text-text-brand hover:underline font-semibold'>
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href='/privacy' className='text-text-brand hover:underline font-semibold'>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.acceptedTerms && (
              <span className='font-sans text-[11px] text-red-500 self-start animate-fadeIn'>
                {errors.acceptedTerms}
              </span>
            )}

            <label className='flex items-start gap-2.5 text-xs md:text-sm text-text-secondary select-none cursor-pointer'>
              <input
                type='checkbox'
                name='acceptedMarketing'
                checked={formData.acceptedMarketing}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className='w-4.5 h-4.5 mt-0.5 rounded border border-border bg-bg text-primary focus:ring-0 focus:ring-offset-0 focus:outline-none accent-primary transition-all duration-200 cursor-pointer shrink-0'
              />
              <span className='leading-tight'>
                I want to receive marketing updates, raffle announcements, and exclusive discount
                codes.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <PrimaryButton
            type='submit'
            isLoading={isSubmitting}
            loadingText='Registering...'
            disabled={!isMounted}
            className='w-full py-3.5 mt-2 font-heading font-semibold text-sm tracking-wide uppercase'
          >
            Register →
          </PrimaryButton>
        </form>
      </div>

      {/* Switch to Host link */}
      <div className='text-center mt-2 text-xs md:text-sm'>
        <span className='text-text-secondary/70'>Looking to host draws instead? </span>
        <Link
          href='/host/register'
          className='text-text-brand hover:text-primary-hover font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer select-none'
        >
          Go to Host Register &rarr;
        </Link>
      </div>
    </div>
  );
}
