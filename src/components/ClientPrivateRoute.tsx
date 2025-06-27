import { Navigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import type { JSX } from 'react';

const ClientPrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { clientUser, token } = useClientAuth();

  if (!clientUser || !token) {
    return <Navigate to="/client-login" replace />;
  }

  return children;
};

export default ClientPrivateRoute;
// This code defines a ClientPrivateRoute component for a React application.
// It checks if a client user is authenticated using the useClientAuth hook.