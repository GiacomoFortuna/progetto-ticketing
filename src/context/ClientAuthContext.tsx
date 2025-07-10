import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type ClientUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  client_id: number;
  company_name: string;
};

type ClientAuthContextType = {
  clientUser: ClientUser | null;
  token: string | null;
  login: (user: ClientUser, token: string) => void;
  logout: () => void;
};

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('client_token');
    const savedUser = localStorage.getItem('client_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setClientUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (user: ClientUser, token: string) => {
    localStorage.setItem('client_token', token);
    localStorage.setItem('client_user', JSON.stringify(user));
    setToken(token);
    setClientUser(user);
  };

  const logout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    setToken(null);
    setClientUser(null);
    navigate('/'); // ✅ redirect alla home pubblica
  };

  return (
    <ClientAuthContext.Provider value={{ clientUser, token, login, logout }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = (): ClientAuthContextType => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth deve essere usato dentro ClientAuthProvider');
  }
  return context;
};
