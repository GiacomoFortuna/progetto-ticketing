import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import TicketList from './pages/TicketList';
import UserRegister from './pages/UserRegister';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import PrivateRoute from './components/PrivateRoute';
import ClientProtectedRoute from './components/ClientPrivateRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Profile from './pages/Profile';
import LayoutCliente from './components/LayoutCliente'; // usa il tuo componente
// Se in futuro usi ClientProfile, importa anche quello
import ClientProfile from './pages/ClientProfile';
import PlanetelInfo from './pages/PlanetelInfo';
import { useAuth } from './context/AuthContext';
import { useClientAuth } from './context/ClientAuthContext';
import DashboardStats from './pages/DashboardStats';

const LayoutAziendale = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const { loading: authLoading } = useAuth();
  const { loading: clientLoading } = useClientAuth();

  if (authLoading || clientLoading) {
    return <div className="text-center mt-32 text-lg font-semibold">Caricamento in corso...</div>;
  }

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

const App = () => {
  const location = useLocation();
  const excludedRoutes = ['/', '/login', '/client-login'];

  const isLayoutVisible = !excludedRoutes.includes(location.pathname);

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

export default App;
// Questo file definisce la struttura principale dell'applicazione React.
// Include le rotte per le pagine pubbliche, aziendali e cliente.