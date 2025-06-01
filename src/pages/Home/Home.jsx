import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Play, Users, Heart, Briefcase, Home as HomeIcon } from 'lucide-react';

import { authSelectors } from '@store/auth/authSelectors.js';
import Button from '@components/common/Button';

const Home = () => {
  const isAuthenticated = useSelector(authSelectors.getIsAuthenticated);

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const relationshipTypes = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Friends',
      description: 'Deepen friendships through shared experiences and meaningful conversations.',
      color: 'bg-blue-500',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Couples',
      description: 'Strengthen your romantic connection with questions designed for partners.',
      color: 'bg-pink-500',
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: 'Colleagues',
      description: 'Build better working relationships in a professional, fun environment.',
      color: 'bg-green-500',
    },
    {
      icon: <HomeIcon className="h-8 w-8" />,
      title: 'Family',
      description: 'Bridge generational gaps and create lasting family memories.',
      color: 'bg-purple-500',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Connection Game - Build Meaningful Relationships</title>
        <meta
          name="description"
          content="A card-based game designed to build deeper connections between friends, couples, colleagues, and family members through engaging questions and activities."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-6 font-heading text-4xl font-bold text-gray-900 md:text-6xl">
                Build Deeper
                <span className="block text-primary-600">Connections</span>
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
                A card-based game designed to bring people closer together through meaningful
                conversations, fun challenges, and shared experiences.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  leftIcon={<Play className="h-5 w-5" />}
                  onClick={() => (window.location.href = '/register')}
                >
                  Start Playing
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => (window.location.href = '/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Relationship Types */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-heading text-3xl font-bold text-gray-900">
                Perfect for Every Relationship
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Tailored questions and activities for different types of relationships, ensuring
                meaningful conversations that respect boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {relationshipTypes.map((type, index) => (
                <div
                  key={index}
                  className="group text-center transition-transform duration-200 hover:scale-105"
                >
                  <div
                    className={`${type.color} mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white transition-shadow group-hover:shadow-lg`}
                  >
                    {type.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-heading text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="text-lg text-gray-600">
                Simple, intuitive, and designed for real-world social gatherings
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Choose Your Group</h3>
                <p className="text-gray-600">
                  Select the relationship type and gather your group in person
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Draw Cards</h3>
                <p className="text-gray-600">
                  One person hosts and draws cards for the group to engage with
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Connect & Grow</h3>
                <p className="text-gray-600">
                  Progress through deeper levels of connection and understanding
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 font-heading text-3xl font-bold text-white">
              Ready to Build Stronger Connections?
            </h2>
            <p className="mb-8 text-xl text-primary-100">
              Join thousands of people using Connection Game to create meaningful relationships
            </p>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="h-5 w-5" />}
              onClick={() => (window.location.href = '/register')}
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
