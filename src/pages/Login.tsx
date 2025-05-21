// Importa gli hook useState da React e useNavigate da react-router-dom
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importa l'hook personalizzato useAuth dal contesto di autenticazione
import { useAuth } from '../context/AuthContext';

function Login() {
  // Estrae la funzione login dal contesto di autenticazione
  const { login } = useAuth();
  // Hook per la navigazione tra le pagine
  const navigate = useNavigate();

  // Stato per gestire il valore dell'username
  const [username, setUsername] = useState('');
  // Stato per gestire il valore della password
  const [password, setPassword] = useState('');
  // Stato per gestire eventuali messaggi di errore
  const [error, setError] = useState('');

  // Funzione chiamata al submit del form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form (refresh pagina)
    const success = login(username, password); // Tenta il login con username e password
    if (success) {
      navigate('/ticket'); // Se il login ha successo, reindirizza alla pagina /ticket
    } else {
      setError('Credenziali errate.'); // Altrimenti mostra un messaggio di errore
    }
  };

  // Renderizza il form di login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-700 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md mt-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Aggiorna lo stato username ad ogni modifica
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Aggiorna lo stato password ad ogni modifica
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="1234"
            />
          </div>
          {/* Se c'è un errore, mostra il messaggio */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Entra
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
// Questo componente gestisce il login dell'utente mostrando un form e gestendo l'autenticazione.