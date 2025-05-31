import React, {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import {authActions} from '@store/auth/authSlice';
import {authSelectors} from '@store/auth/authSelectors';
import {Layout} from '@components/common/Layout';
import ProtectedRoute from '@components/auth/ProtectedRoute/ProtectedRoute.jsx';
import Loading from '@components/common/Loading';

// Pages
import Home from '@pages/Home/Home.jsx';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import Game from '@pages/Game/Game.jsx';
import Profile from '@pages/Profile';
import Admin from '@pages/Admin';
import NotFound from '@pages/NotFound';

function App() {
  const dispatch = useDispatch();
  const {isLoading, isAuthenticated} = useSelector(authSelectors.getAuthState);

  useEffect(() => {
    // Check for existing auth token on app startup
    dispatch(authActions.checkAuthState());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard/>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/game/:sessionId"
          element={
            <ProtectedRoute>
              <Game/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile/>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <Admin/>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </div>
  );
}

export default App;
