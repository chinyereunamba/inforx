/**
 * Form validation utilities for authentication
 */

import type { ValidationResult } from '@/lib/types/auth';

/**
 * Validates email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength?: number } => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long', strength: 1 };
  }

  let strength = 1;
  const checks = [
    /[a-z]/.test(password), // lowercase
    /[A-Z]/.test(password), // uppercase
    /[0-9]/.test(password), // numbers
    /[^A-Za-z0-9]/.test(password), // special characters
  ];

  strength += checks.filter(Boolean).length;

  if (strength < 3) {
    return { 
      isValid: false, 
      error: 'Password should include uppercase, lowercase, numbers, and special characters',
      strength 
    };
  }

  return { isValid: true, strength };
};

/**
 * Validates full name
 */
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validates password confirmation
 */
export const validatePasswordConfirmation = (
  password: string, 
  confirmation: string
): { isValid: boolean; error?: string } => {
  if (!confirmation) {
    return { isValid: false, error: 'Password confirmation is required' };
  }

  if (password !== confirmation) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Validates sign up form data
 */
export const validateSignUpForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!;
  }

  // Validate password confirmation
  const confirmPasswordValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error!;
  }

  // Validate full name
  const nameValidation = validateFullName(data.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.error!;
  }

  // Validate role
  if (!data.role || !['patient', 'doctor'].includes(data.role)) {
    errors.role = 'Please select a valid role';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates sign in form data
 */
export const validateSignInForm = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Get password strength indicator
 */
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  const { strength = 0 } = validatePassword(password);
  
  const strengthMap = {
    0: { label: 'Very Weak', color: 'bg-red-500' },
    1: { label: 'Weak', color: 'bg-red-400' },
    2: { label: 'Fair', color: 'bg-yellow-400' },
    3: { label: 'Good', color: 'bg-emerald-400' },
    4: { label: 'Strong', color: 'bg-emerald-500' },
    5: { label: 'Very Strong', color: 'bg-emerald-600' },
  };

  return {
    score: strength,
    ...strengthMap[strength as keyof typeof strengthMap],
  };
};