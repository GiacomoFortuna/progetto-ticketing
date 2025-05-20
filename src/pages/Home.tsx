import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import animationLogo from '../video/animation_logo.mp4';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-hidden flex items-center justify-center pt-14">
      {/* 🎥 Video sfondo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={animationLogo} type="video/mp4" />
      </video>

      {/* 🔲 Overlay per contrasto */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 z-10" />

      {/* 🔤 Contenuto centrato */}
      <div className="relative z-20 flex items-center justify-center w-full h-full">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl text-center max-h-[90vh] overflow-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Benvenuto su Planetel Ticketing
          </h1>

          {!user ? (
            <>
              <p className="text-white/90 mb-6 text-base sm:text-lg">
                Accedi per gestire segnalazioni e supporto tecnico in azienda.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold w-full"
              >
                Accedi
              </button>
            </>
          ) : (
            <>
              <p className="text-white/90 mb-6 text-base sm:text-lg">
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
