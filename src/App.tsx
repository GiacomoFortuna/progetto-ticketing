import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import TicketList from './pages/TicketList';
import Header from './components/Header'; // già esistente
import PrivateRoute from './components/PrivateRoute';
import UserRegister from './pages/UserRegister';
import ClientLogin from './pages/ClientLogin';

function App() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserRegister />} />
          <Route
            path="/ticket"
            element={
              <PrivateRoute>
                <TicketList />
              </PrivateRoute>
            }
          />
          <Route path="/client-login" element={<ClientLogin />} />
          {/* Puoi aggiungere qui altre rotte client, es: <Route path="/client-dashboard" element={<ClientDashboard />} /> */}
        </Routes>
      </main>
    </>
  );
}

export default App;
// This code defines the main App component for a React application.
// It sets up routing for the application using React Router.
// The application includes a header and a main content area.