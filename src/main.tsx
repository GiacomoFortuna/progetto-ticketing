import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ClientAuthProvider } from './context/ClientAuthContext'; // importa il context client
import './index.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ClientAuthProvider>
          <App />
        </ClientAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// In questo file, abbiamo creato un punto di ingresso per la nostra applicazione React.
// Abbiamo importato il componente principale `App` e lo abbiamo eseguito il rendering all'interno dell'elemento DOM con id 'root'.
// Abbiamo anche avvolto `App` con `BrowserRouter` per abilitare il routing nell'applicazione.

