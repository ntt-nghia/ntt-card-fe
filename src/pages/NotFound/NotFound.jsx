// src/pages/NotFound/NotFound.jsx - 404 page component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Page Not Found - Connection Game</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="mb-4 text-6xl font-bold text-gray-300">404</h1>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Page Not Found</h2>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(-1)}
              variant="outline"
            >
              Go Back
            </Button>
            <Button leftIcon={<Home className="h-4 w-4" />} onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
