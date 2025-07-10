import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type User = {
  username: string;
  division: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  token: string | null;
  role: string | null;
  updatePassword?: (newPassword: string) => Promise<void>;
  loading: boolean; // ⬅️ aggiunto
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  //  Inizializza lo stato da localStorage (utile dopo reload o cambio utente)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // <-- una volta fatto il check
  }, []);

  const login = (userData: User, authToken: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    window.location.href = '/'; // Forza redirect pulito
  };
  // Funzione per aggiornare la password dell'utente
  // Funzione asincrona per aggiornare la password dell'utente
  const updatePassword = async (newPassword: string) => {
    // Effettua una richiesta PATCH all'endpoint di aggiornamento password
    const res = await fetch('http://localhost:3001/api/users/update', {
      method: 'PATCH', // Metodo HTTP PATCH per aggiornare la risorsa
      headers: {
        'Content-Type': 'application/json', // Specifica il tipo di contenuto come JSON
        Authorization: `Bearer ${token}`,   // Invia il token JWT per autenticazione
      },
      body: JSON.stringify({ newPassword }), // Invia la nuova password nel body della richiesta
    });

    // Se la risposta non è ok, gestisce l'errore
    if (!res.ok) {
      const error = await res.json(); // Estrae il messaggio di errore dalla risposta
      throw new Error(error.message || 'Errore aggiornamento password'); // Lancia un errore con messaggio appropriato
    }

    // Restituisce la risposta JSON se la richiesta ha avuto successo
    return res.json();
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, token, role: user?.role || null, updatePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};




// This code defines an authentication context for a React application.
// It provides a way to manage user authentication state, including login and logout functionality.