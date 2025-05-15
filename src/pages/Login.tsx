import { useState } from 'react'; // Importa useState per gestire lo stato locale
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra pagine
import { useAuth } from '../context/AuthContext'; // Importa il custom hook per l'autenticazione

function Login() {
  const { login } = useAuth(); // Estrae la funzione login dal contesto di autenticazione
  const navigate = useNavigate(); // Ottiene la funzione per navigare tra le route

  const [username, setUsername] = useState(''); // Stato per il campo username
  const [password, setPassword] = useState(''); // Stato per il campo password
  const [error, setError] = useState(''); // Stato per eventuali messaggi di errore

  const handleSubmit = (e: React.FormEvent) => { // Gestore per il submit del form
    e.preventDefault(); // Previene il comportamento di default del form (refresh pagina)
    const success = login(username, password); // Tenta il login con username e password
    if (success) { // Se il login ha successo
      navigate('/ticket'); // Naviga alla pagina /ticket
    } else {
      setError('Credenziali errate.'); // Mostra un messaggio di errore
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}> {/* Form con submit gestito da handleSubmit */}
        <div>
          <label>Username:</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} /> {/* Input per username */}
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /> {/* Input per password */}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostra errore se presente */}
        <button type="submit">Accedi</button> {/* Bottone per inviare il form */}
      </form>
    </div>
  );
}

export default Login; // Esporta il componente Login
// Questo è un semplice componente di login per una applicazione React.
// Include i campi username e password e gestisce il submit del form.