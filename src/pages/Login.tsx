import { useState } from 'react'; // Importa lo useState di React per gestire lo stato locale
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra pagine
import { useAuth } from '../context/AuthContext'; // Importa il context di autenticazione aziendale

const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

function Login() {
  const { login } = useAuth(); // Ottiene la funzione di login dal context
  const [username, setUsername] = useState(''); // Stato per il campo username
  const [password, setPassword] = useState(''); // Stato per il campo password
  const [error, setError] = useState(''); // Stato per il messaggio di errore
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  // Funzione per gestire il submit del form di login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form
    setError(''); // Resetta il messaggio di errore

    try {
      // Effettua la richiesta POST al backend per il login
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST', // Metodo HTTP POST
        headers: { 'Content-Type': 'application/json' }, // Indica che il body è in JSON
        body: JSON.stringify({ username, password }), // Invia username e password nel body
      });

      const data = await response.json(); // Parsea la risposta JSON

      if (!response.ok) {
        throw new Error(data.error || 'Errore di login'); // Se la risposta non è ok, lancia errore
      }

      const { token, user } = data; // Estrae token e dati utente dalla risposta

      // ✅ Salva tutto correttamente nel localStorage
      localStorage.setItem('token', token); // Salva il token JWT
      localStorage.setItem('user', JSON.stringify(user)); // Salva i dati utente (incluso il ruolo)
      login(user, token); // Aggiorna lo stato globale di autenticazione

      navigate('/ticket'); // Naviga alla pagina di gestione ticket
    } catch (err: any) {
      setError(err.message); // Mostra il messaggio di errore
    }
  };

  // Render della pagina di login
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full" autoComplete="off">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          {error && <p className="text-red-500 mb-3">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Aggiorna lo stato username
            className="w-full mb-3 p-2 border rounded"
            required
            autoComplete="new-username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Aggiorna lo stato password
            className="w-full mb-4 p-2 border rounded"
            required
            autoComplete="new-password"
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Accedi
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate('/')} // Torna alla home pubblica
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-medium"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; // Esporta il componente Login
// This code defines a Login component for a React application.
// It allows users to log in by entering their username and password.