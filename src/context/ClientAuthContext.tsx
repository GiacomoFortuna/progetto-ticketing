import { createContext, useContext, useState, useEffect } from 'react';

const ClientAuthContext = createContext<any>(null);

export const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientUser, setClientUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('clientToken');
    const savedUser = localStorage.getItem('clientUser');
    if (saved && savedUser) {
      setToken(saved);
      setClientUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3001/api/client-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Login fallito');

    const data = await res.json();
    localStorage.setItem('clientToken', data.token);
    localStorage.setItem('clientUser', JSON.stringify(data.user));
    setToken(data.token);
    setClientUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    setToken(null);
    setClientUser(null);
  };

  return (
    <ClientAuthContext.Provider value={{ clientUser, token, login, logout }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => useContext(ClientAuthContext);
