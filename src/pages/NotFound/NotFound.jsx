import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import Button from '@components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGoBack = () => {
    // Try to go back, fallback to appropriate home page
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? '/dashboard' : '/');
    }
  };

  const suggestedLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
        { to: '/profile', label: 'Profile', icon: <Search className="w-4 h-4" /> },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel', icon: <HelpCircle className="w-4 h-4" /> }] : [])
      ]
    : [
        { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
        { to: '/login', label: 'Sign In', icon: <Search className="w-4 h-4" /> },
        { to: '/register', label: 'Sign Up', icon: <HelpCircle className="w-4 h-4" /> }
      ];

  return (
    <>
      <Helmet>
        <title>Page Not Found - Connection Game</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-6xl font-bold text-primary-600">404</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <Button
              size="lg"
              fullWidth
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              onClick={handleGoBack}
            >
              Go Back
            </Button>

            <Button
              variant="outline"
              size="lg"
              fullWidth
              leftIcon={<Home className="w-5 h-5" />}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Try these instead:
            </h2>
            <div className="space-y-2">
              {suggestedLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Still having trouble?{' '}
              <button
                onClick={() => {
                  // You can implement a help modal or contact form here
                  alert('Contact support feature coming soon!');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Contact support
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
