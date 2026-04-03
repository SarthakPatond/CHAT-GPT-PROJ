import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuthToken } from './lib/api.js';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

const AppRoutes = () => {
    const defaultRedirect = getAuthToken() ? '/' : '/login';

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path='/'
                    element={(
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path='/login'
                    element={(
                        <ProtectedRoute requireAuth={false} redirectTo='/'>
                            <Login />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path='/register'
                    element={(
                        <ProtectedRoute requireAuth={false} redirectTo='/'>
                            <Register />
                        </ProtectedRoute>
                    )}
                />

                <Route path='*' element={<Navigate to={defaultRedirect} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
