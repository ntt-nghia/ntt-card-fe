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
      icon: <Users className="w-8 h-8" />,
      title: 'Friends',
      description: 'Deepen friendships through shared experiences and meaningful conversations.',
      color: 'bg-blue-500'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Couples',
      description: 'Strengthen your romantic connection with questions designed for partners.',
      color: 'bg-pink-500'
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'Colleagues',
      description: 'Build better working relationships in a professional, fun environment.',
      color: 'bg-green-500'
    },
    {
      icon: <HomeIcon className="w-8 h-8" />,
      title: 'Family',
      description: 'Bridge generational gaps and create lasting family memories.',
      color: 'bg-purple-500'
    }
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 mb-6">
                Build Deeper
                <span className="text-primary-600 block">Connections</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                A card-based game designed to bring people closer together through
                meaningful conversations, fun challenges, and shared experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  leftIcon={<Play className="w-5 h-5" />}
                  onClick={() => window.location.href = '/register'}
                >
                  Start Playing
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Relationship Types */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                Perfect for Every Relationship
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tailored questions and activities for different types of relationships,
                ensuring meaningful conversations that respect boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relationshipTypes.map((type, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className={`${type.color} w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4 group-hover:shadow-lg transition-shadow`}>
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple, intuitive, and designed for real-world social gatherings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose Your Group
                </h3>
                <p className="text-gray-600">
                  Select the relationship type and gather your group in person
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Draw Cards
                </h3>
                <p className="text-gray-600">
                  One person hosts and draws cards for the group to engage with
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect & Grow
                </h3>
                <p className="text-gray-600">
                  Progress through deeper levels of connection and understanding
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Ready to Build Stronger Connections?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of people using Connection Game to create meaningful relationships
            </p>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={() => window.location.href = '/register'}
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
