import { useState } from 'react'; // Importa lo useState di React per gestire lo stato locale
import { Routes, Route, useLocation } from 'react-router-dom'; // Importa le funzioni di routing di React Router
import Home from './pages/Home'; // Importa la pagina Home
import Login from './pages/Login'; // Importa la pagina Login aziendale
import TicketList from './pages/TicketList'; // Importa la pagina lista ticket aziendale
import UserRegister from './pages/UserRegister'; // Importa la pagina di registrazione utente
import ClientLogin from './pages/ClientLogin'; // Importa la pagina Login cliente
import ClientDashboard from './pages/ClientDashboard'; // Importa la dashboard cliente
import PrivateRoute from './components/PrivateRoute'; // Importa il componente per proteggere le rotte aziendali
import ClientProtectedRoute from './components/ClientPrivateRoute'; // Importa il componente per proteggere le rotte cliente
import Header from './components/Header'; // Importa l'header aziendale
import Sidebar from './components/Sidebar'; // Importa la sidebar aziendale
import Profile from './pages/Profile'; // Importa la pagina profilo utente aziendale
import LayoutCliente from './components/LayoutCliente'; // Importa il layout cliente
import ClientProfile from './pages/ClientProfile'; // Importa la pagina profilo cliente
import PlanetelInfo from './pages/PlanetelInfo'; // Importa la pagina info Planetel
import { useAuth } from './context/AuthContext'; // Importa il context di autenticazione aziendale
import { useClientAuth } from './context/ClientAuthContext'; // Importa il context di autenticazione cliente
import DashboardStats from './pages/DashboardStats'; // Importa la pagina statistiche dashboard

// Componente layout aziendale con sidebar e header
const LayoutAziendale = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Stato per mostrare/nascondere la sidebar
  const toggleSidebar = () => setSidebarOpen((prev) => !prev); // Funzione per togglare la sidebar

  const { loading: authLoading } = useAuth(); // Stato di caricamento autenticazione aziendale
  const { loading: clientLoading } = useClientAuth(); // Stato di caricamento autenticazione cliente

  // Se uno dei due loading è true, mostra messaggio di caricamento
  if (authLoading || clientLoading) {
    return <div className="text-center mt-32 text-lg font-semibold">Caricamento in corso...</div>;
  }

  // Render layout aziendale con header, sidebar e main
  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <Header />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`pt-16 px-4 py-6 transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-16'}`}>
        {children}
      </main>
    </div>
  );
};

// Componente principale App
const App = () => {
  const location = useLocation(); // Ottiene la location corrente dal router
  const excludedRoutes = ['/', '/login', '/client-login']; // Rotte che non mostrano il layout aziendale

  const isLayoutVisible = !excludedRoutes.includes(location.pathname); // Determina se mostrare il layout aziendale

  // Render delle rotte dell'applicazione
  return (
    <>
      {/* Rotte pubbliche */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client-login" element={<ClientLogin />} />

        {/* Rotte aziendali (Planetel) */}
        {isLayoutVisible && (
          <>
            <Route
              path="/ticket"
              element={
                <PrivateRoute>
                  <LayoutAziendale>
                    <TicketList />
                  </LayoutAziendale>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <LayoutAziendale>
                    <Profile />
                  </LayoutAziendale>
                </PrivateRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PrivateRoute>
                  <LayoutAziendale>
                    <UserRegister />
                  </LayoutAziendale>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard-stats"
              element={
                <PrivateRoute>
                  <LayoutAziendale>
                    <DashboardStats />
                  </LayoutAziendale>
                </PrivateRoute>
              }
            />
          </>
        )}

        {/* Rotte cliente */}
        <Route
          path="/client-dashboard"
          element={
            <ClientProtectedRoute>
              <LayoutCliente>
                <ClientDashboard />
              </LayoutCliente>
            </ClientProtectedRoute>
          }
        />
        <Route
          path="/client-profile"
          element={
            <ClientProtectedRoute>
              <LayoutCliente>
                <ClientProfile />
              </LayoutCliente>
            </ClientProtectedRoute>
          }
        />
        <Route
          path="/planetel-info"
          element={
            <ClientProtectedRoute>
              <LayoutCliente>
                <PlanetelInfo />
              </LayoutCliente>
            </ClientProtectedRoute>
          }
        />
        {/* ...other client routes... */}
      </Routes>
    </>
  );
};

export default App; // Esporta il componente principale App
// Questo file definisce la struttura principale dell'applicazione React.
// Include le rotte per le pagine pubbliche, aziendali e cliente.