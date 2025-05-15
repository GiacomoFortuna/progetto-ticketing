import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import TicketList from './pages/TicketList';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/ticket"
          element={
            <PrivateRoute>
              <TicketList />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
// This code defines the main App component for a React application.
// It sets up routing using React Router, including routes for Home, Login, and TicketList pages.