import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import logoPlanetel from '../assets/logo-planetel.svg';
import animationLogo from '../video/animation_logo.mp4';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video sfondo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={animationLogo} type="video/mp4" />
      </video>

      {/* Overlay nero per contrasto */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 z-10" />

      {/* Card centrata perfettamente nello schermo */}
      <div className="relative z-20 flex items-center justify-center w-full h-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center">
          <img
            src={logoPlanetel}
            alt="Planetel Logo"
            className="mx-auto mb-6 w-40 drop-shadow-lg"
          />

          {!user ? (
            <>
              <p className="text-white/90 mb-6">
                Accedi per gestire segnalazioni e supporto tecnico in azienda.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold w-full mb-4"
              >
                Accedi
              </button>
              {/* Link Area Clienti */}
              <button
                onClick={() => navigate('/client-login')}
                className="text-white underline text-sm hover:text-gray-300"
              >
                Area Clienti
              </button>
            </>
          ) : (
            <>
              <p className="text-white/90 mb-6">
                Sei autenticato come <strong>{user.username}</strong>.
              </p>
              <button
                onClick={() => navigate('/ticket')}
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

export default Home;
