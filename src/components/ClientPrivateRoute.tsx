import { Navigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import type { JSX } from 'react';

const ClientPrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { clientUser, token } = useClientAuth();

  const loading = token === null && clientUser === null;

  if (loading) {
    // 👇 Evita di redirectare mentre ancora si caricano dati da localStorage
    return null; // oppure uno spinner temporaneo
  }

  if (!clientUser || !token) {
    return <Navigate to="/client-login" replace />;
  }

  return children;
};

export default ClientPrivateRoute;
// This component checks if the user is authenticated as a client.
// If not, it redirects to the client login page.