import { useAuth } from '../context/AuthContext'; // Importa il context di autenticazione aziendale
import { useNavigate } from 'react-router-dom'; // Importa il hook per la navigazione tra pagine
import { useEffect } from 'react'; // Importa useEffect per gestire effetti collaterali
import logoPlanetel from '../assets/jticket3.png'; // Importa il logo Planetel
import animationLogo from '../video/jj2.mp4'; // Importa il video di animazione per lo sfondo

function Home() {
  const { user } = useAuth(); // Recupera l'utente autenticato dal context
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  useEffect(() => {
    const originalOverflow = document.body.style.overflow; // Salva lo stato originale dell'overflow del body
    document.body.style.overflow = 'hidden'; // Disabilita lo scroll della pagina
    return () => {
      document.body.style.overflow = originalOverflow; // Ripristina lo scroll quando il componente viene smontato
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video sfondo */}
      <video
        autoPlay // Avvia automaticamente il video
        loop // Ripete il video in loop
        muted // Disattiva l'audio
        playsInline // Ottimizza la riproduzione su dispositivi mobili
        className="absolute top-0 left-0 w-full h-full object-cover z-0" // Posiziona il video come sfondo
      >
        <source src={animationLogo} type="video/mp4" /> {/* Sorgente del video */}
      </video>

      {/* Overlay nero per contrasto */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 z-10" /> {/* Sovrappone un layer nero trasparente sopra il video */}

      {/* Card centrata perfettamente nello schermo */}
      <div className="relative z-20 flex items-center justify-center w-full h-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center">
          <img
            src={logoPlanetel} // Mostra il logo Planetel
            alt="Planetel Logo"
            className="mx-auto mb-6 w-40 drop-shadow-lg"
          />

          {!user ? (
            // Se l'utente NON è autenticato mostra i bottoni di login
            <>
              <p className="text-white/90 mb-6">
                Accedi per gestire segnalazioni e supporto tecnico in azienda.
              </p>
              <button
                onClick={() => navigate('/login')} // Naviga alla pagina di login aziendale
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold w-full mb-4"
              >
                Accedi
              </button>
              {/* Link Area Clienti */}
              <button
                onClick={() => navigate('/client-login')} // Naviga alla pagina di login clienti
                className="text-white underline text-sm hover:text-gray-300"
              >
                Area Clienti
              </button>
            </>
          ) : (
            // Se l'utente è autenticato mostra il messaggio e il bottone per la gestione ticket
            <>
              <p className="text-white/90 mb-6">
                Sei autenticato come <strong>{user.username}</strong>.
              </p>
              <button
                onClick={() => navigate('/ticket')} // Naviga alla pagina di gestione ticket
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold w-full"
              >
                Vai alla gestione ticket
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home; // Esporta il componente Home
