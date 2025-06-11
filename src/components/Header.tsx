import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-planetel.svg';
import { useAuth } from '../context/AuthContext';

// Componente Header che rappresenta l'intestazione dell'applicazione
function Header() {
  const location = useLocation(); // Hook per ottenere il percorso attuale
  const navigate = useNavigate(); // Hook per navigare tra le pagine
  const { user, logout } = useAuth(); // Recupera lo stato di autenticazione e la funzione di logout

  // Funzione per verificare se il percorso è attivo
  const isActive = (path: string) => location.pathname === path;

  // Gestisce il logout dell'utente e reindirizza alla pagina di login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-gray-100 shadow fixed top-0 left-0 z-50 transition-all">
      {/* Contenitore principale dell'header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-5">
        {/* Logo Planetel che reindirizza alla home */}
        <Link to="/" className="flex items-center mb-2 md:mb-0">
          <img
            src={logo}
            alt="Planetel"
            className="h-10 transition-transform duration-300 hover:scale-105"
          />
        </Link>
        {/* Navigazione principale */}
        <nav>
          <ul className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
            {/* Link alla Home */}
            <li>
              <Link
                to="/"
                className={`font-medium transition-all duration-200 transform hover:scale-110 ${
                  isActive('/') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
            </li>
            {/* Link alla pagina Ticket */}
            <li>
              <Link
                to="/ticket"
                className={`font-medium transition-all duration-200 transform hover:scale-110 ${
                  isActive('/ticket') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Ticket
              </Link>
            </li>
            {/* Mostra il link Login solo se l'utente non è autenticato */}
            {!user && (
              <li>
                <Link
                  to="/login"
                  className={`font-medium transition-all duration-200 transform hover:scale-110 ${
                    isActive('/login') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Login
                </Link>
              </li>
            )}
            {/* Mostra il link Registra utente solo ai manager */}
            {user?.role === 'manager' && (
              <li>
                <Link to="/register" className="text-sm font-medium text-blue-600 hover:underline">
                  Registra utente
                </Link>
              </li>
            )}
            {/* Mostra il pulsante Logout solo se l'utente è autenticato */}
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
// Questo componente definisce l'header dell'applicazione React.
// Include il logo e i link di navigazione, gestendo la visualizzazione in base allo stato di autenticazione.