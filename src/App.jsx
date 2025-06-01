// src/App.jsx - Updated with proper error boundaries and loading states
import React, { useEffect, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { authActions } from '@store/auth/authSlice';
import { authSelectors } from '@store/auth/authSelectors';
import { Layout } from '@components/common/Layout';
import ProtectedRoute from '@components/auth/ProtectedRoute/ProtectedRoute';
import ErrorBoundary from '@components/common/ErrorBoundary';
import GameErrorFallback from '@components/common/ErrorFallbacks/GameErrorFallback';
import Loading from '@components/common/Loading';

// Lazy load pages for better performance
const Home = React.lazy(() => import('@pages/Home/Home.jsx'));
const Login = React.lazy(() => import('@pages/Login'));
const Register = React.lazy(() => import('@pages/Register'));
const Dashboard = React.lazy(() => import('@pages/Dashboard'));
const Game = React.lazy(() => import('@pages/Game/Game.jsx'));
const Profile = React.lazy(() => import('@pages/Profile'));
const Admin = React.lazy(() => import('@pages/Admin'));
const NotFound = React.lazy(() => import('@pages/NotFound'));

// Loading component for suspense
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <Loading size="large" text="Loading..." />
  </div>
);

// Auth loading component
const AuthLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <Loading size="large" text="Checking authentication..." />
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { isLoading, isInitialized, error } = useSelector(authSelectors.getAuthState);

  useEffect(() => {
    // Check for existing auth token on app startup
    dispatch(authActions.checkAuthState());
  }, [dispatch]);

  // Show loading while checking auth
  if (isLoading && !isInitialized) {
    return <AuthLoader />;
  }

  // Show error if auth check failed critically
  if (error && !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Unable to Initialize App</h1>
          <p className="mb-6 text-gray-600">
            There was a problem starting the application. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="app">
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route
                index
                element={
                  <ErrorBoundary level="page">
                    <Home />
                  </ErrorBoundary>
                }
              />
              <Route
                path="login"
                element={
                  <ErrorBoundary level="page">
                    <Login />
                  </ErrorBoundary>
                }
              />
              <Route
                path="register"
                element={
                  <ErrorBoundary level="page">
                    <Register />
                  </ErrorBoundary>
                }
              />
            </Route>

            {/* Protected routes with layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ErrorBoundary level="page">
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Game route without layout and custom error boundary */}
            <Route
              path="/game/:sessionId"
              element={
                <ProtectedRoute>
                  <ErrorBoundary level="page" fallback={GameErrorFallback}>
                    <Game />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ErrorBoundary level="page">
                    <Layout>
                      <Profile />
                    </Layout>
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <ErrorBoundary level="page">
                    <Admin />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route
              path="*"
              element={
                <ErrorBoundary level="page">
                  <NotFound />
                </ErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
