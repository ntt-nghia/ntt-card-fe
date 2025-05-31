import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Calendar, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import Button from '@components/common/Button';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading, error, register: registerUser, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    // Convert birthDate to proper format
    const userData = {
      ...data,
      birthDate: new Date(data.birthDate)
    };
    await registerUser(userData);
  };

  // Calculate minimum birth date (18 years ago)
  const minBirthDate = new Date();
  minBirthDate.setFullYear(minBirthDate.getFullYear() - 18);
  const minBirthDateString = minBirthDate.toISOString().split('T')[0];

  return (
    <>
      <Helmet>
        <title>Sign Up - Connection Game</title>
        <meta name="description" content="Create your Connection Game account and start building meaningful relationships" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              Join Connection Game
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start building meaningful relationships today
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <input
                    {...register('displayName', {
                      required: 'Display name is required',
                      minLength: {
                        value: 1,
                        message: 'Display name must be at least 1 character'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Display name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    className="input-field pl-10"
                    placeholder="Enter your display name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.displayName && (
                  <p className="mt-1 text-sm text-error-600">{errors.displayName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email'
                      }
                    })}
                    type="email"
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Date
                </label>
                <div className="relative">
                  <input
                    {...register('birthDate', {
                      required: 'Birth date is required',
                      validate: (value) => {
                        const birthDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        return age >= 18 || 'You must be at least 18 years old';
                      }
                    })}
                    type="date"
                    max={minBirthDateString}
                    className="input-field pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.birthDate.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="Create a password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className="input-field pl-10"
                    placeholder="Confirm your password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>.
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
