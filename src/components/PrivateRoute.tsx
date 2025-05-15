import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react';

type Props = {
  children: JSX.Element;
};

function PrivateRoute({ children }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
// This code defines a PrivateRoute component for a React application.
// It checks if a user is authenticated using the useAuth hook.