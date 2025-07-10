import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react';

type Props = {
  children: JSX.Element;
};

function PrivateRoute({ children }: Props) {
  const { user, token, loading } = useAuth();

  // ⏳ Mostra un loader se il context sta ancora caricando i dati da localStorage
  if (loading) {
    return <div className="text-center mt-32 text-lg font-semibold">Controllo autenticazione...</div>;
  }

  // 🔐 Se non autenticato → redirect al login
  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  // ✅ Se autenticato → mostra i children
  return children;
}

export default PrivateRoute;
// This component checks if the user is authenticated.
// If not, it redirects to the login page.