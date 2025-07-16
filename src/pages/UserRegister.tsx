import { useState } from 'react'; // Importa lo useState di React per gestire lo stato locale
import { useAuth } from '../context/AuthContext'; // Importa il context di autenticazione aziendale
import { registerUser } from '../services/api'; // Importa la funzione per registrare un utente
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra pagine

function UserRegister() {
  const { user } = useAuth(); // Recupera l'utente autenticato dal context
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  // Stato per i dati del form di registrazione
  const [formData, setFormData] = useState({
    username: '', // Username nuovo utente
    password: '', // Password nuovo utente
    division: '', // Divisione nuovo utente
    role: 'employee', // Ruolo nuovo utente (default: employee)
  });
  const [message, setMessage] = useState(''); // Stato per il messaggio di successo
  const [error, setError] = useState(''); // Stato per il messaggio di errore

  // Se l'utente non è manager, mostra messaggio di non autorizzato
  if (user?.role !== 'manager') {
    return <p className="text-red-600">Non sei autorizzato a visualizzare questa pagina.</p>;
  }

  // Funzione per gestire il cambiamento dei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // Aggiorna lo stato formData
  };

  // Funzione per gestire il submit del form di registrazione
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form
    setError(''); // Resetta il messaggio di errore
    setMessage(''); // Resetta il messaggio di successo
    try {
      await registerUser(formData); // Chiama la funzione di registrazione utente
      setMessage('Utente registrato con successo'); // Mostra messaggio di successo
      setFormData({ username: '', password: '', division: '', role: 'employee' }); // Resetta il form
    } catch {
      setError('Errore nella registrazione'); // Mostra messaggio di errore
    }
  };

  // Render della pagina di registrazione utente
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Registra nuovo utente</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>} {/* Messaggio di errore */}
        {message && <p className="text-green-600 mb-2">{message}</p>} {/* Messaggio di successo */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange} // Aggiorna lo stato username
            required
            className="w-full p-2 border rounded"
            autoComplete="new-username"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange} // Aggiorna lo stato password
            required
            className="w-full p-2 border rounded"
            autoComplete="new-password"
          />
          <select name="division" value={formData.division} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Seleziona divisione</option>
            <option value="cloud">Cloud</option>
            <option value="networking">Networking</option>
            <option value="it-care">IT-Care</option>
          </select>
          <select name="role" value={formData.role} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="employee">Dipendente</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Registra</button>
        </form>
        <button
          type="button"
          className="mt-4 w-full bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
          onClick={() => navigate('/ticket')} // Naviga alla pagina ticket
        >
          Torna ai ticket
        </button>
      </div>
    </div>
  );
}

export default UserRegister; // Esporta il componente UserRegister
// This code defines a UserRegister component that allows managers to register new users.
// It includes a form for entering user details and handles submission with error and success messages.