// Importa le funzioni e i tipi necessari da React
import { createContext, useState, useContext } from 'react';
// Importa il tipo ReactNode per tipizzare i children
import type { ReactNode } from 'react';

// Definisce il tipo User con una proprietà username
type User = {
    username: string;
};

// Definisce il tipo del contesto di autenticazione
type AuthContextType = {
    user: User | null; // Utente autenticato o null se non autenticato
    login: (username: string, password: string) => boolean; // Funzione di login
    logout: () => void; // Funzione di logout
};

// Crea il contesto di autenticazione con valore iniziale undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definisce il provider di autenticazione
export function AuthProvider({ children }: { children: ReactNode }) {
    // Stato per memorizzare l'utente autenticato
    const [user, setUser] = useState<User | null>(null);

    // Funzione per effettuare il login
    const login = (username: string, password: string) => {
        // Verifica se username e password sono corretti
        if (username === 'admin' && password === '1234') {
            setUser({ username }); // Imposta l'utente autenticato
            return true; // Login riuscito
        }
        return false; // Login fallito
    };

    // Funzione per effettuare il logout
    const logout = () => setUser(null); // Rimuove l'utente autenticato

    // Ritorna il provider con il valore del contesto
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children} {/* Renderizza i componenti figli */}
        </AuthContext.Provider>
    );
}

// Hook personalizzato per utilizzare il contesto di autenticazione
export function useAuth() {
    const context = useContext(AuthContext); // Recupera il contesto
    if (!context) throw new Error('useAuth must be used inside AuthProvider'); // Errore se usato fuori dal provider
    return context; // Ritorna il contesto
}
// This code defines an authentication context for a React application.
// It provides a way to manage user authentication state and login/logout functionality.