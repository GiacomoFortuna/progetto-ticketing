import { createContext, useContext, useState, useEffect } from 'react'; // Importa React e gli hook necessari
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione

// Definisce il tipo ClientUser per tipizzare i dati utente client
type ClientUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  client_id: number;
  company_name: string;
};

// Definisce il tipo del context di autenticazione client
type ClientAuthContextType = {
  clientUser: ClientUser | null; // Utente client autenticato
  token: string | null; // Token JWT
  login: (user: ClientUser, token: string) => void; // Funzione di login
  logout: () => void; // Funzione di logout
  loading: boolean; // Stato di caricamento
};

// Crea il context di autenticazione client
const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

// Provider per il context di autenticazione client
export const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null); // Stato utente client
  const [token, setToken] = useState<string | null>(null); // Stato token JWT
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  useEffect(() => {
    // Recupera token e utente dal localStorage al mount
    const savedToken = localStorage.getItem('client_token');
    const savedUser = localStorage.getItem('client_user');
    if (savedToken && savedUser) {
      setToken(savedToken); // Imposta il token recuperato
      setClientUser(JSON.parse(savedUser)); // Imposta l'utente recuperato
    }
    setLoading(false); // Imposta loading a false dopo il recupero
  }, []);

  // Funzione di login: salva token e utente in localStorage e aggiorna lo stato
  const login = (user: ClientUser, token: string) => {
    localStorage.setItem('client_token', token);
    localStorage.setItem('client_user', JSON.stringify(user));
    setToken(token);
    setClientUser(user);
  };

  // Funzione di logout: rimuove token e utente dal localStorage, resetta lo stato e naviga alla home
  const logout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    setToken(null);
    setClientUser(null);
    navigate('/'); // ✅ redirect alla home pubblica
  };

  // Ritorna il provider con i valori del context
  return (
    <ClientAuthContext.Provider value={{ clientUser, token, login, logout, loading }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

// Hook custom per usare il context di autenticazione client
export const useClientAuth = (): ClientAuthContextType => {
  const context = useContext(ClientAuthContext); // Recupera il context
  if (!context) {
    throw new Error('useClientAuth deve essere usato dentro ClientAuthProvider'); // Errore se usato fuori dal provider
  }
  return context; // Restituisce il context
};
