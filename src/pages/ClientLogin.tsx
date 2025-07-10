import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useClientAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/clientAuth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert('Login fallito');
        return;
      }

      const data = await res.json();
      localStorage.setItem('client_token', data.token);
      localStorage.setItem('client_user', JSON.stringify(data.user));
      login(data.user, data.token);
      navigate('/client-dashboard');
    } catch (err) {
      console.error(err);
      alert('Errore di rete');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[#429d46]/10">
        <h2 className="text-3xl font-bold text-center text-[#429d46] mb-6">
          Login Area Clienti
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci email"
              required
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#429d46] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#357a36] transition"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientLogin;
// This component handles the client login functionality.
// It includes a form for email and password input, and handles the login process by sending a POST request to the server.
// Upon successful login, it stores the token and user data in localStorage and redirects to the client dashboard.