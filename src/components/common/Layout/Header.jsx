import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, User, LogOut } from 'lucide-react';

import { authSelectors } from '@store/auth/authSelectors.js';
import { authActions } from '@store/auth/authSlice.js';
import Button from '@components/common/Button/index.js';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(authSelectors.getAuthState);

  const handleLogout = () => {
    dispatch(authActions.logoutRequest());
    navigate('/');
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="font-heading text-xl font-bold text-primary-600">Connection Game</h1>
          </Link>

          {/* Navigation */}
          {/*<nav className="hidden md:flex space-x-8">*/}
          {/*  {isAuthenticated ? (*/}
          {/*    <>*/}
          {/*      <Link*/}
          {/*        to="/dashboard"*/}
          {/*        className="text-gray-600 hover:text-primary-600 transition-colors"*/}
          {/*      >*/}
          {/*        Dashboard*/}
          {/*      </Link>*/}
          {/*      <Link*/}
          {/*        to="/profile"*/}
          {/*        className="text-gray-600 hover:text-primary-600 transition-colors"*/}
          {/*      >*/}
          {/*        Profile*/}
          {/*      </Link>*/}
          {/*    </>*/}
          {/*  ) : (*/}
          {/*    <>*/}
          {/*      <Link*/}
          {/*        to="/login"*/}
          {/*        className="text-gray-600 hover:text-primary-600 transition-colors"*/}
          {/*      >*/}
          {/*        Login*/}
          {/*      </Link>*/}
          {/*      <Link*/}
          {/*        to="/register"*/}
          {/*        className="text-gray-600 hover:text-primary-600 transition-colors"*/}
          {/*      >*/}
          {/*        Register*/}
          {/*      </Link>*/}
          {/*    </>*/}
          {/*  )}*/}
          {/*</nav>*/}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
