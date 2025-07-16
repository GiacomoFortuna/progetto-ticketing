import { useState } from 'react'; // Importa lo useState di React per gestire lo stato locale
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra pagine
import { useClientAuth } from '../context/ClientAuthContext'; // Importa il context di autenticazione client

const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

const ClientLogin = () => {
  const [email, setEmail] = useState(''); // Stato per l'email inserita dall'utente
  const [password, setPassword] = useState(''); // Stato per la password inserita dall'utente
  const navigate = useNavigate(); // Hook per navigare tra le pagine
  const { login } = useClientAuth(); // Funzione di login dal context client

  // Funzione per gestire il submit del form di login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form
    try {
      // Effettua la richiesta POST al backend per il login
      const res = await fetch(`${baseUrl}/api/clientAuth/login`, {
        method: 'POST', // Metodo HTTP POST
        headers: { 'Content-Type': 'application/json' }, // Indica che il body è in JSON
        body: JSON.stringify({ email, password }), // Invia email e password nel body
      });

      // Se la risposta non è ok, mostra un alert di errore
      if (!res.ok) {
        alert('Login fallito');
        return;
      }

      // Parsea la risposta JSON
      const data = await res.json();
      // Salva il token e i dati utente nel localStorage
      localStorage.setItem('client_token', data.token);
      localStorage.setItem('client_user', JSON.stringify(data.user));
      // Aggiorna lo stato globale di autenticazione client
      login(data.user, data.token);
      // Naviga alla dashboard cliente
      navigate('/client-dashboard');
    } catch (err) {
      // Logga eventuali errori di rete
      console.error(err);
      alert('Errore di rete');
    }
  };

  // Render della pagina di login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[#429d46]/10">
        <h2 className="text-3xl font-bold text-center text-[#429d46] mb-6">
          Login Area Clienti
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Aggiorna lo stato email
              placeholder="Inserisci email"
              required
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Aggiorna lo stato password
              placeholder="••••••••"
              required
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#429d46] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#357a36] transition"
          >
            Accedi
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')} // Torna alla home pubblica
            className="text-sm text-gray-600 hover:text-[#429d46] underline"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin; // Esporta il componente ClientLogin

// Questo componente gestisce la funzionalità di login del cliente.
// Include un modulo per l'inserimento di email e password e gestisce il processo di login inviando una richiesta POST al server.
// Dopo un login riuscito, memorizza il token e i dati dell'utente in localStorage e reindirizza alla dashboard del cliente.