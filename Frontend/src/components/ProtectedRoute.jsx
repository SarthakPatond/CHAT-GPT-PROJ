import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '../lib/api.js';

const ProtectedRoute = ({ requireAuth = true, redirectTo, children }) => {
    const location = useLocation();
    const isAuthenticated = Boolean(getAuthToken());

    if (requireAuth && !isAuthenticated) {
        return (
            <Navigate
                to={redirectTo || '/login'}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!requireAuth && isAuthenticated) {
        return <Navigate to={redirectTo || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;
