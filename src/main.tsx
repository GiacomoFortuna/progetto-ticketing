// TypeScript React file
import React from 'react' // Importa la libreria React
import ReactDOM from 'react-dom/client' // Importa il modulo ReactDOM per il rendering
import App from './App.tsx' // Importa il componente principale App
import { BrowserRouter } from 'react-router-dom' // Importa BrowserRouter per il routing

ReactDOM.createRoot(document.getElementById('root')!).render( // Crea la root React e fa il rendering nell'elemento con id 'root'
  <React.StrictMode>
    {/* Attiva controlli aggiuntivi in fase di sviluppo */}
    <BrowserRouter>
      {/* Abilita il routing nell'applicazione */}
      <App />
      {/* Renderizza il componente principale App */}
    </BrowserRouter>
  </React.StrictMode>,
)
// In questo file, abbiamo creato un punto di ingresso per la nostra applicazione React.
// Abbiamo importato il componente principale `App` e lo abbiamo eseguito il rendering all'interno dell'elemento DOM con id 'root'.
// Abbiamo anche avvolto `App` con `BrowserRouter` per abilitare il routing nell'applicazione.

